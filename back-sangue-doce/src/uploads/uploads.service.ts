import { randomUUID } from "node:crypto";
import { AuthService } from "@app/auth/auth.service";
import type { JwtPayload } from "@app/auth/types/jwt-payload.type";
import { ImageService } from "@app/image/image.service";
import { type PostImageRecord, PostRepository } from "@app/posts/repositories/post.repository";
import { UserRepository } from "@app/users/repositories/user.repository";
import { AwsS3Service } from "@infra/storage/aws-s3.service";
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Client } from "minio";
import type { UploadAvatarResponse } from "./types/upload-avatar-response.type";
import type { UploadCoverResponse } from "./types/upload-cover-response.type";
import { PrismaService } from "@infra/database/prisma.service";
import type { UploadPostImagesResponse } from "./types/upload-post-images-response.type";
import type { UploadedImageFile } from "./types/uploaded-image-file.type";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const DEFAULT_BUCKET = "sangue-doce";
const DEFAULT_PUBLIC_PREFIX = "public";
const DEFAULT_REGION = "us-east-1";

@Injectable()
export class UploadsService {
  private readonly bucket: string;
  private readonly publicPath: string;
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
    private readonly awsS3Service: AwsS3Service,
    private readonly prisma: PrismaService,
  ) {
    this.bucket = configService.get<string>("MINIO_BUCKET") ?? DEFAULT_BUCKET;
    this.publicPrefix = configService.get<string>("MINIO_PUBLIC_PREFIX") ?? DEFAULT_PUBLIC_PREFIX;
    this.publicPath =
      configService.get<string>("MINIO_PUBLIC_PATH") ?? `/${this.bucket}/${this.publicPrefix}`;
    this.region = configService.get<string>("MINIO_REGION") ?? DEFAULT_REGION;
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
    const imageBuffer = await this.convertToPng(file);

    const uploadedObject = await this.awsS3Service.uploadObject({
      buffer: imageBuffer,
      contentType: "image/png",
      key: objectName,
    });
    const avatarUrl = uploadedObject.url;

    if (publicUser.avatarUrl && publicUser.avatarUrl !== avatarUrl) {
      await this.removePreviousUploadedObject(publicUser.avatarUrl);
    }

    const updatedUser = await this.userRepository.updateAvatarUrl(publicUser.id, avatarUrl);
    const session = await this.authService.createSession(updatedUser);

    return {
      ...session,
      avatarUrl,
      bucket: uploadedObject.bucket,
      objectName: uploadedObject.key,
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
    const imageBuffer = await this.convertToPostWebp(file);
    const uploadedObject = await this.awsS3Service.uploadObject({
      buffer: imageBuffer,
      contentType: "image/webp",
      key: objectName,
    });
    const coverUrl = uploadedObject.url;

    if (publicPost.coverImageUrl && publicPost.coverImageUrl !== coverUrl) {
      await this.removePreviousUploadedObject(publicPost.coverImageUrl);
    }

    await this.postRepository.updatePostCoverImage(postId, coverUrl);

    return {
      coverUrl,
      bucket: uploadedObject.bucket,
      objectName: uploadedObject.key,
    };
  }

  async uploadPostImages(
    postId: string,
    file?: UploadedImageFile,
  ): Promise<UploadPostImagesResponse> {
    this.validateImage(file);

    const post = await this.postRepository.findById(postId);

    if (!post) {
      throw new NotFoundException("Post not found.");
    }

    const publicPost = post.toPublic();

    const objectName = this.createPostImageName({
      postId: publicPost.id,
      slug: publicPost.slug,
    });
    const imageBuffer = await this.convertToPostWebp(file);
    const previousImageUrl = await this.postRepository.findPostImageByPostId(postId);
    const uploadedObject = await this.awsS3Service.uploadObject({
      buffer: imageBuffer,
      contentType: "image/webp",
      key: objectName,
    });
    const imageUrl = uploadedObject.url;

    let postImage: PostImageRecord;

    try {
      postImage = await this.postRepository.upsertPostImage(postId, imageUrl);
    } catch (error) {
      await this.removePreviousUploadedObject(imageUrl);
      throw error;
    }

    if (previousImageUrl && previousImageUrl.imageUrl !== postImage.imageUrl) {
      await this.removePreviousUploadedObject(previousImageUrl.imageUrl);
    }

    return {
      imageUrl: postImage.imageUrl,
      bucket: uploadedObject.bucket,
      objectName: uploadedObject.key,
    };
  }

  async uploadRecipeCover(recipeId: string, file?: UploadedImageFile): Promise<UploadCoverResponse> {
    this.validateImage(file);
    const recipe = await this.prisma.recipe.findUnique({ where: { id: recipeId } });
    if (!recipe) throw new NotFoundException("Recipe not found.");
    const imageBuffer = await this.convertToPostWebp(file);
    const uploaded = await this.awsS3Service.uploadObject({
      buffer: imageBuffer,
      contentType: "image/webp",
      key: this.createRecipeCoverName({ recipeId, slug: recipe.slug }),
    });
    if (recipe.coverImageUrl && recipe.coverImageUrl !== uploaded.url) {
      await this.removePreviousUploadedObject(recipe.coverImageUrl);
    }
    await this.prisma.recipe.update({ where: { id: recipeId }, data: { coverImageUrl: uploaded.url } });
    return { coverUrl: uploaded.url, bucket: uploaded.bucket, objectName: uploaded.key };
  }

  async uploadRecipeImage(recipeId: string, file?: UploadedImageFile): Promise<UploadPostImagesResponse> {
    this.validateImage(file);
    const recipe = await this.prisma.recipe.findUnique({ where: { id: recipeId } });
    if (!recipe) throw new NotFoundException("Recipe not found.");
    const imageBuffer = await this.convertToPostWebp(file);
    const uploaded = await this.awsS3Service.uploadObject({
      buffer: imageBuffer,
      contentType: "image/webp",
      key: this.createRecipeImageName({ recipeId, slug: recipe.slug }),
    });
    return { imageUrl: uploaded.url, bucket: uploaded.bucket, objectName: uploaded.key };
  }

  async uploadInstitutionalPublicationImage(
    file?: UploadedImageFile,
  ): Promise<UploadPostImagesResponse> {
    this.validateImage(file);

    const imageBuffer = await this.convertToPostWebp(file);
    const uploaded = await this.awsS3Service.uploadObject({
      buffer: imageBuffer,
      contentType: "image/webp",
      key: this.createInstitutionalPublicationImageName(),
    });

    return { imageUrl: uploaded.url, bucket: uploaded.bucket, objectName: uploaded.key };
  }

  private validateImage(file?: UploadedImageFile): asserts file is UploadedImageFile {
    if (!file) {
      throw new BadRequestException('Envie a imagem no campo "image" usando multipart/form-data.');
    }

    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException("Envie uma imagem PNG, JPG ou WebP no campo image.");
    }
  }

  private async convertToPng(file: UploadedImageFile): Promise<Buffer> {
    try {
      return await this.imageService.png(file.buffer);
    } catch (error) {
      throw new BadRequestException("Nao foi possivel processar a imagem enviada.", {
        cause: error,
      });
    }
  }

  private async convertToPostWebp(file: UploadedImageFile): Promise<Buffer> {
    try {
      const resizedBuffer = await this.imageService.resize(file.buffer, 1600);

      return await this.imageService.toWebp(resizedBuffer, 75);
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
    return `${this.publicPrefix}/users/${this.slugify(userName)}/${userId}.png`;
  }

  private createPostCoverName({ postId, slug }: { postId: string; slug: string }): string {
    return `${this.publicPrefix}/posts/${this.slugify(slug)}/cover-${postId}.webp`;
  }

  private createPostImageName({ postId, slug }: { postId: string; slug: string }): string {
    return `${this.publicPrefix}/posts/images/${this.slugify(slug)}/${randomUUID()}-${postId}.webp`;
  }

  private createRecipeCoverName({ recipeId, slug }: { recipeId: string; slug: string }) {
    return `${this.publicPrefix}/recipes/${this.slugify(slug)}/cover-${recipeId}.webp`;
  }

  private createRecipeImageName({ recipeId, slug }: { recipeId: string; slug: string }) {
    return `${this.publicPrefix}/recipes/images/${this.slugify(slug)}/${randomUUID()}-${recipeId}.webp`;
  }

  private createInstitutionalPublicationImageName() {
    return `${this.publicPrefix}/institutional-publications/${randomUUID()}.webp`;
  }

  private createPublicObjectPath(objectName: string): string {
    const encodedObjectName = objectName
      .split("/")
      .map((part) => encodeURIComponent(part))
      .join("/");
    const publicObjectPath = this.stripPublicPrefix(encodedObjectName);

    return `${this.publicPath.replace(/\/$/, "")}/${publicObjectPath}`;
  }

  private async removePreviousPublicObject(publicPathOrUrl: string): Promise<void> {
    const objectName = this.getObjectNameFromPublicPathOrUrl(publicPathOrUrl);

    if (!objectName) {
      return;
    }

    try {
      await this.getClient().removeObject(this.bucket, objectName);
    } catch {
      return;
    }
  }

  private async removePreviousUploadedObject(publicPathOrUrl: string): Promise<void> {
    try {
      if (/^https?:\/\//i.test(publicPathOrUrl)) {
        await this.awsS3Service.deleteObjectByUrl(publicPathOrUrl);
        return;
      }

      await this.removePreviousPublicObject(publicPathOrUrl);
    } catch {
      return;
    }
  }

  private getObjectNameFromPublicPathOrUrl(publicPathOrUrl: string): string | null {
    if (publicPathOrUrl.startsWith("/")) {
      return this.getObjectNameFromPublicPath(publicPathOrUrl);
    }

    try {
      const url = new URL(publicPathOrUrl);

      return this.getObjectNameFromPublicPath(url.pathname);
    } catch {
      return null;
    }
  }

  private getObjectNameFromPublicPath(publicPath: string): string | null {
    const pathParts = publicPath.split("/").filter(Boolean);
    const bucketIndex = pathParts.findIndex((part) => part === this.bucket);

    if (bucketIndex >= 0) {
      return pathParts
        .slice(bucketIndex + 1)
        .map(decodeURIComponent)
        .join("/");
    }

    const configuredPublicPathParts = this.publicPath.split("/").filter(Boolean);
    const startsWithConfiguredPath = configuredPublicPathParts.every(
      (part, index) => pathParts[index] === part,
    );

    if (!startsWithConfiguredPath) {
      return null;
    }

    const objectPath = pathParts.slice(configuredPublicPathParts.length).map(decodeURIComponent);

    return [this.publicPrefix, ...objectPath].join("/");
  }

  private stripPublicPrefix(objectName: string): string {
    const normalizedPrefix = this.publicPrefix.replace(/^\/+|\/+$/g, "");

    if (!normalizedPrefix) {
      return objectName.replace(/^\/+/, "");
    }

    if (objectName === normalizedPrefix) {
      return "";
    }

    if (objectName.startsWith(`${normalizedPrefix}/`)) {
      return objectName.slice(normalizedPrefix.length + 1);
    }

    return objectName.replace(/^\/+/, "");
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
