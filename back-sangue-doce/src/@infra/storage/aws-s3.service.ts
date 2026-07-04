import { randomUUID } from "node:crypto";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

type UploadObjectInput = {
  buffer: Buffer;
  contentType?: string;
  fileName?: string;
  key?: string;
  keyPrefix?: string;
};

type UploadedObject = {
  bucket: string;
  key: string;
  url: string;
};

const DEFAULT_BUCKET = "sangue-doce";
const DEFAULT_KEY_PREFIX = "public";
const DEFAULT_REGION = "us-east-1";

@Injectable()
export class AwsS3Service {
  private readonly bucket: string;
  private readonly region: string;
  private client?: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.bucket = configService.get<string>("AWS_S3_BUCKET") ?? DEFAULT_BUCKET;
    this.region =
      configService.get<string>("AWS_S3_REGION") ??
      configService.get<string>("AWS_REGION") ??
      DEFAULT_REGION;
  }

  async uploadObject({
    buffer,
    contentType,
    fileName,
    key,
    keyPrefix = DEFAULT_KEY_PREFIX,
  }: UploadObjectInput): Promise<UploadedObject> {
    const objectKey = key ?? this.createObjectKey(keyPrefix, fileName);

    try {
      await this.getClient().send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: objectKey,
          Body: buffer,
          ContentType: contentType,
        }),
      );

      return {
        bucket: this.bucket,
        key: objectKey,
        url: this.createPublicUrl(objectKey),
      };
    } catch (error) {
      throw new InternalServerErrorException("Nao foi possivel enviar o arquivo para o S3.", {
        cause: error,
      });
    }
  }

  async deleteObject(key: string): Promise<void> {
    try {
      await this.getClient().send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
    } catch (error) {
      throw new InternalServerErrorException("Nao foi possivel remover o arquivo do S3.", {
        cause: error,
      });
    }
  }

  async deleteObjectByUrl(url: string): Promise<void> {
    const key = this.getObjectKeyFromUrl(url);

    if (!key) {
      return;
    }

    await this.deleteObject(key);
  }

  private getClient(): S3Client {
    this.client ??= new S3Client({
      region: this.region,
    });

    return this.client;
  }

  private createObjectKey(keyPrefix: string, fileName?: string): string {
    const normalizedPrefix = keyPrefix.replace(/^\/+|\/+$/g, "") || DEFAULT_KEY_PREFIX;
    const extension = this.getFileExtension(fileName);

    return `${normalizedPrefix}/${randomUUID()}${extension}`;
  }

  private getFileExtension(fileName?: string): string {
    if (!fileName) {
      return "";
    }

    const extension = fileName.split(".").pop();

    return extension && extension !== fileName ? `.${extension.toLowerCase()}` : "";
  }

  private getObjectKeyFromUrl(url: string): string | null {
    try {
      const parsedUrl = new URL(url);
      const s3Host = `${this.bucket}.s3.${this.region}.amazonaws.com`;

      if (parsedUrl.hostname !== s3Host) {
        return null;
      }

      return parsedUrl.pathname.split("/").filter(Boolean).map(decodeURIComponent).join("/");
    } catch {
      return null;
    }
  }

  private createPublicUrl(key: string): string {
    const encodedKey = key
      .split("/")
      .map((part) => encodeURIComponent(part))
      .join("/");

    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${encodedKey}`;
  }
}
