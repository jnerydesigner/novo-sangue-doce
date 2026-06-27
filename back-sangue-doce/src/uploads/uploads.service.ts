import { AuthService } from "@app/auth/auth.service";
import type { JwtPayload } from "@app/auth/types/jwt-payload.type";
import { ImageService } from "@app/image/image.service";
import { PostRepository } from "@app/posts/repositories/post.repository";
import { UserRepository } from "@app/users/repositories/user.repository";
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Client } from "minio";
import type { UploadedImageFile } from "./types/uploaded-image-file.type";

type UploadAvatarResponse = {
  access_token: string;
  avatarUrl: string;
  bucket: string;
  objectName: string;
  profile: JwtPayload;
};

type UploadCoverResponse = {
  coverUrl: string;
  bucket: string;
  objectName: string;
};

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const DEFAULT_BUCKET = "sangue-doce";
const DEFAULT_PUBLIC_PREFIX = "public";
const DEFAULT_REGION = "us-east-1";

@Injectable()
export class UploadsService {
  private readonly bucket: string;
  private readonly publicBaseUrl: string;
  private readonly publicPrefix: string;
  private readonly region: string;
  private bucketReady?: Promise<void>;
  private client?: Client;

  constructor(
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
    private readonly postRepository: PostRepository,
    private readonly authService: AuthService,
    private readonly imageService: ImageService,
  ) {
    const endPoint = configService.get<string>("MINIO_ENDPOINT") ?? "localhost";
    const port = Number(configService.get<string>("MINIO_API_PORT") ?? 9000);
    const useSSL = configService.get<string>("MINIO_USE_SSL") === "true";

    this.bucket = configService.get<string>("MINIO_BUCKET") ?? DEFAULT_BUCKET;
    this.publicPrefix = configService.get<string>("MINIO_PUBLIC_PREFIX") ?? DEFAULT_PUBLIC_PREFIX;
    this.region = configService.get<string>("MINIO_REGION") ?? DEFAULT_REGION;
    this.publicBaseUrl =
      configService.get<string>("MINIO_PUBLIC_URL") ??
      `${useSSL ? "https" : "http"}://${endPoint}:${port}`;
  }

  async uploadUserAvatar(
    currentUser: JwtPayload,
    file?: UploadedImageFile,
  ): Promise<UploadAvatarResponse> {
    this.validateImage(file);

    const user = await this.userRepository.findById(currentUser.sub);

    if (!user) {
      throw new NotFoundException("User not found.");
    }

    const publicUser = user.toPublic();
    const objectName = this.createUserAvatarObjectName({
      userId: publicUser.id,
      userName: publicUser.name,
    });
    const avatarUrl = this.createPublicObjectUrl(objectName);
    const imageBuffer = await this.convertToWebp(file);

    await this.ensureBucket();

    await this.getClient().putObject(this.bucket, objectName, imageBuffer, imageBuffer.length, {
      "Content-Type": "image/webp",
    });

    if (publicUser.avatarUrl && publicUser.avatarUrl !== avatarUrl) {
      await this.removePreviousAvatar(publicUser.avatarUrl);
    }

    const updatedUser = await this.userRepository.updateAvatarUrl(publicUser.id, avatarUrl);
    const session = await this.authService.createSession(updatedUser);

    return {
      ...session,
      avatarUrl,
      bucket: this.bucket,
      objectName,
    };
  }

  async uploadPostImageCover(
    postId: string,
    file?: UploadedImageFile,
  ): Promise<UploadCoverResponse> {
    this.validateImage(file);

    const post = await this.postRepository.findById(postId);

    if (!post) {
      throw new NotFoundException("Post not found.");
    }

    const publicPost = post.toPublic();

    const objectName = this.createPostCoverName({
      postId: publicPost.id,
      slug: publicPost.slug,
    });
    const coverUrl = this.createPublicObjectUrl(objectName);
    const imageBuffer = await this.convertToWebp(file);

    await this.ensureBucket();

    await this.getClient().putObject(this.bucket, objectName, imageBuffer, imageBuffer.length, {
      "Content-Type": "image/webp",
    });

    if (publicPost.coverImageUrl && publicPost.coverImageUrl !== coverUrl) {
      await this.removePreviousCover(publicPost.coverImageUrl);
    }

    await this.postRepository.updatePostCoverImage(postId, coverUrl);

    return {
      coverUrl,
      bucket: this.bucket,
      objectName,
    };
  }

  private validateImage(file?: UploadedImageFile): asserts file is UploadedImageFile {
    if (!file) {
      throw new BadRequestException('Envie a imagem no campo "image" usando multipart/form-data.');
    }

    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException("Envie uma imagem PNG, JPG ou WebP no campo image.");
    }
  }

  private async convertToWebp(file: UploadedImageFile): Promise<Buffer> {
    try {
      return await this.imageService.toWebp(file.buffer);
    } catch (error) {
      throw new BadRequestException("Nao foi possivel processar a imagem enviada.", {
        cause: error,
      });
    }
  }

  private ensureBucket(): Promise<void> {
    this.bucketReady ??= this.createBucketIfMissing();

    return this.bucketReady;
  }

  private async createBucketIfMissing(): Promise<void> {
    try {
      const exists = await this.getClient().bucketExists(this.bucket);

      if (!exists) {
        await this.getClient().makeBucket(this.bucket, this.region);
      }
    } catch (error) {
      throw new InternalServerErrorException("Nao foi possivel preparar o bucket de uploads.", {
        cause: error,
      });
    }
  }

  private createUserAvatarObjectName({
    userId,
    userName,
  }: {
    userId: string;
    userName: string;
  }): string {
    return `${this.publicPrefix}/users/${this.slugify(userName)}/${userId}.webp`;
  }

  private createPostCoverName({ postId, slug }: { postId: string; slug: string }): string {
    return `${this.publicPrefix}/posts/${this.slugify(slug)}/cover-${postId}.webp`;
  }

  private createPublicObjectUrl(objectName: string): string {
    const encodedObjectName = objectName
      .split("/")
      .map((part) => encodeURIComponent(part))
      .join("/");

    return `${this.publicBaseUrl.replace(/\/$/, "")}/${this.bucket}/${encodedObjectName}`;
  }

  private async removePreviousAvatar(avatarUrl: string): Promise<void> {
    const objectName = this.getObjectNameFromAvatarUrl(avatarUrl);

    if (!objectName) {
      return;
    }

    try {
      await this.getClient().removeObject(this.bucket, objectName);
    } catch {
      return;
    }
  }

  private async removePreviousCover(coverUrl: string): Promise<void> {
    const objectName = this.getObjectNameFromCoverUrl(coverUrl);

    if (!objectName) {
      return;
    }

    try {
      await this.getClient().removeObject(this.bucket, objectName);
    } catch {
      return;
    }
  }

  private getObjectNameFromAvatarUrl(avatarUrl: string): string | null {
    try {
      const url = new URL(avatarUrl);
      const pathParts = url.pathname.split("/").filter(Boolean);
      const bucketIndex = pathParts.findIndex((part) => part === this.bucket);

      if (bucketIndex < 0) {
        return null;
      }

      return pathParts
        .slice(bucketIndex + 1)
        .map(decodeURIComponent)
        .join("/");
    } catch {
      return null;
    }
  }

  private getObjectNameFromCoverUrl(coverUrl: string): string | null {
    try {
      const url = new URL(coverUrl);
      const pathParts = url.pathname.split("/").filter(Boolean);
      const bucketIndex = pathParts.findIndex((part) => part === this.bucket);

      if (bucketIndex < 0) {
        return null;
      }

      return pathParts
        .slice(bucketIndex + 1)
        .map(decodeURIComponent)
        .join("/");
    } catch {
      return null;
    }
  }

  private slugify(value: string): string {
    return (
      value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "usuario"
    );
  }

  private getClient(): Client {
    if (this.client) {
      return this.client;
    }

    const endPoint = this.configService.get<string>("MINIO_ENDPOINT") ?? "localhost";
    const port = Number(this.configService.get<string>("MINIO_API_PORT") ?? 9000);
    const useSSL = this.configService.get<string>("MINIO_USE_SSL") === "true";
    const accessKey =
      this.configService.get<string>("MINIO_ACCESS_KEY") ??
      this.configService.get<string>("MINIO_ROOT_USER");
    const secretKey =
      this.configService.get<string>("MINIO_SECRET_KEY") ??
      this.configService.get<string>("MINIO_ROOT_PASSWORD");

    if (!accessKey || !secretKey) {
      throw new InternalServerErrorException("As credenciais do MinIO nao estao configuradas.");
    }

    this.client = new Client({
      accessKey,
      endPoint,
      port,
      secretKey,
      useSSL,
    });

    return this.client;
  }
}
