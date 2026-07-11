import { randomUUID } from "node:crypto";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppLogger } from "@shared/logger/app-logger.provider";

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
  private readonly uploadsBasePath: string;
  private client?: S3Client;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(AwsS3Service.name);
    this.bucket = configService.get<string>("AWS_S3_BUCKET") ?? DEFAULT_BUCKET;
    this.region =
      configService.get<string>("AWS_S3_REGION") ??
      configService.get<string>("AWS_REGION") ??
      DEFAULT_REGION;
    this.uploadsBasePath = (configService.get<string>("PATH_TO_UPLOADS") ?? "").replace(
      /^\/+|\/+$/g,
      "",
    );
  }

  async uploadObject({
    buffer,
    contentType,
    fileName,
    key,
    keyPrefix = DEFAULT_KEY_PREFIX,
  }: UploadObjectInput): Promise<UploadedObject> {
    const objectKey = this.withUploadsBasePath(key ?? this.createObjectKey(keyPrefix, fileName));

    try {
      this.logger.log(
        `Uploading object to S3 bucket=${this.bucket} region=${this.region} key=${objectKey} contentType=${contentType ?? "unknown"} size=${buffer.length}`,
      );

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
      this.logger.error(
        `Failed to upload object to S3 bucket=${this.bucket} region=${this.region} key=${objectKey}: ${this.formatAwsError(error)}`,
      );

      throw new InternalServerErrorException("Nao foi possivel enviar o arquivo para o S3.", {
        cause: error,
      });
    }
  }

  async deleteObject(key: string): Promise<void> {
    try {
      this.logger.log(
        `Deleting object from S3 bucket=${this.bucket} region=${this.region} key=${key}`,
      );

      await this.getClient().send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
    } catch (error) {
      this.logger.error(
        `Failed to delete object from S3 bucket=${this.bucket} region=${this.region} key=${key}: ${this.formatAwsError(error)}`,
      );

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

  async downloadObject(key: string): Promise<Buffer> {
    try {
      this.logger.log(
        `Downloading object from S3 bucket=${this.bucket} region=${this.region} key=${key}`,
      );

      const response = await this.getClient().send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );

      const body = response.Body;

      if (!body) {
        throw new Error("Response body is empty");
      }

      return Buffer.from(await body.transformToByteArray());
    } catch (error) {
      this.logger.error(
        `Failed to download object from S3 bucket=${this.bucket} region=${this.region} key=${key}: ${this.formatAwsError(error)}`,
      );

      throw new InternalServerErrorException("Nao foi possivel baixar o arquivo do S3.", {
        cause: error,
      });
    }
  }

  private getClient(): S3Client {
    this.client ??= new S3Client({
      region: this.region,
    });

    return this.client;
  }

  private withUploadsBasePath(key: string): string {
    const normalizedKey = key.replace(/^\/+/, "");

    if (!this.uploadsBasePath) {
      return normalizedKey;
    }

    if (
      normalizedKey === this.uploadsBasePath ||
      normalizedKey.startsWith(`${this.uploadsBasePath}/`)
    ) {
      return normalizedKey;
    }

    return `${this.uploadsBasePath}/${normalizedKey}`;
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

  private formatAwsError(error: unknown): string {
    if (!(error instanceof Error)) {
      return String(error);
    }

    const metadata = "$metadata" in error ? error.$metadata : undefined;
    const rawStatusCode =
      metadata && typeof metadata === "object" && "httpStatusCode" in metadata
        ? metadata.httpStatusCode
        : undefined;
    const statusCode = typeof rawStatusCode === "number" ? rawStatusCode : undefined;

    return [
      `name=${error.name}`,
      statusCode ? `status=${statusCode}` : null,
      `message=${error.message}`,
    ]
      .filter(Boolean)
      .join(" ");
  }
}
