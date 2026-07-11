import { ImageService } from "@app/image/image.service";
import { PostRepository } from "@app/posts/repositories/post.repository";
import { AwsS3Service } from "@infra/storage/aws-s3.service";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SocialPublicationRepository } from "../domain/social-publication.repository";
import {
  isTerminalStatus,
  SocialPublicationStatus,
} from "../domain/social-publication-status.enum";
import type { SocialPublicationErrorCode } from "../types";
import { LlmImageGateway } from "./gateways/llm-image.gateway";
import { LlmTextGateway } from "./gateways/llm-text.gateway";
import { SOCIAL_IMAGE_PROMPT_VERSION } from "./prompts/social-image.prompt";
import { SOCIAL_TEXT_PROMPT_VERSION } from "./prompts/social-text.prompt";

type ProcessInput = {
  socialPublicationId: string;
  postId: string;
  correlationId: string;
  requestedBy: string;
  attempt: number;
};

@Injectable()
export class ProcessSocialPublicationUseCase {
  private readonly logger = new Logger(ProcessSocialPublicationUseCase.name);
  private readonly uploadsMediaPath: string;
  private readonly siteUrl: string;

  constructor(
    private readonly publicationRepository: SocialPublicationRepository,
    private readonly postRepository: PostRepository,
    private readonly awsS3Service: AwsS3Service,
    private readonly imageService: ImageService,
    private readonly textGateway: LlmTextGateway,
    private readonly imageGateway: LlmImageGateway,
    configService: ConfigService,
  ) {
    this.uploadsMediaPath = (
      configService.get<string>("PATH_TO_UPLOADS_MEDIA") ?? "social-publications"
    ).replace(/^\/+|\/+$/g, "");
    this.siteUrl = (configService.get<string>("URL_SITE") ?? "https://sanguedoce.com.br").replace(
      /\/+$/g,
      "",
    );
  }

  async execute(input: ProcessInput): Promise<void> {
    const publication = await this.publicationRepository.findById(input.socialPublicationId);

    if (!publication) {
      this.logger.error(
        `Publication not found id=${input.socialPublicationId} correlationId=${input.correlationId}`,
      );
      return;
    }

    if (
      isTerminalStatus(publication.status) &&
      publication.status !== SocialPublicationStatus.FAILED
    ) {
      this.logger.warn(
        `Publication already in terminal status id=${publication.id} status=${publication.status}`,
      );
      return;
    }

    await this.publicationRepository.markAsProcessing(publication.id, input.attempt);

    const startTime = Date.now();

    try {
      const post = await this.postRepository.findById(input.postId);

      if (!post) {
        throw this.createError("POST_NOT_FOUND", "Post original nao encontrado.");
      }

      const postProps = post.toPersistence();
      const parentPublication = publication.parentPublicationId
        ? await this.publicationRepository.findById(publication.parentPublicationId)
        : null;
      const shouldGenerateText = publication.generationMode !== "REGENERATE_IMAGE";
      const shouldGenerateImage = publication.generationMode !== "REGENERATE_TEXT";

      if (publication.parentPublicationId && !parentPublication) {
        throw this.createError("POST_NOT_FOUND", "Publicacao de origem nao encontrada.");
      }

      if (
        !postProps.content ||
        (Array.isArray(postProps.content) && postProps.content.length === 0)
      ) {
        throw this.createError(
          "POST_CONTENT_EMPTY",
          "O post nao possui conteudo para gerar a publicacao.",
        );
      }

      if (!postProps.coverImageUrl) {
        throw this.createError("POST_BANNER_MISSING", "O post nao possui imagem de banner.");
      }

      const sourceImageKey =
        (publication.generationMode === "REGENERATE_IMAGE"
          ? parentPublication?.generatedImageKey
          : publication.sourceImageKey) ?? this.extractS3Key(postProps.coverImageUrl);

      if (!sourceImageKey) {
        throw this.createError(
          "SOURCE_IMAGE_NOT_FOUND",
          "Nao foi possivel determinar a chave da imagem no S3.",
        );
      }

      let sourceImageBuffer: Buffer | null = null;

      if (shouldGenerateImage) {
        try {
          sourceImageBuffer = await this.awsS3Service.downloadObject(sourceImageKey);
        } catch {
          throw this.createError(
            "SOURCE_IMAGE_NOT_FOUND",
            "Nao foi possivel baixar a imagem original do S3.",
          );
        }
      }

      const markdownContent = this.extractMarkdownContent(postProps.content);

      let textResult: Awaited<ReturnType<LlmTextGateway["generateSocialContent"]>>;

      if (!shouldGenerateText && parentPublication?.generatedContent) {
        textResult = {
          content: parentPublication.generatedContent,
          hashtags: parentPublication.generatedHashtags ?? [],
          shortTitle: parentPublication.generatedShortTitle ?? postProps.title,
          model: parentPublication.textModel ?? "reused",
        };
      } else
        try {
          await this.publicationRepository.updateStatus(
            publication.id,
            SocialPublicationStatus.GENERATING_TEXT,
          );

          const postTags = (post as unknown as { tags?: { name: string }[] }).tags;
          const postCategory = (post as unknown as { category?: { name: string } }).category;

          textResult = await this.textGateway.generateSocialContent({
            title: postProps.title,
            markdown: markdownContent,
            category: postCategory?.name,
            tags: postTags?.map((t) => t.name),
          });
        } catch (error) {
          throw this.createError(
            "TEXT_GENERATION_FAILED",
            `Falha na geracao de texto: ${error instanceof Error ? error.message : String(error)}`,
            { stage: "GENERATING_TEXT", retryable: true },
          );
        }

      let imageResult: Awaited<ReturnType<LlmImageGateway["generateSocialImage"]>>;

      if (!shouldGenerateImage && parentPublication?.generatedImageKey) {
        imageResult = {
          image: Buffer.alloc(0),
          mimeType: "image/webp",
          model: parentPublication.imageModel ?? "reused",
        };
      } else
        try {
          await this.publicationRepository.updateStatus(
            publication.id,
            SocialPublicationStatus.GENERATING_IMAGE,
          );

          imageResult = await this.imageGateway.generateSocialImage({
            sourceImage: sourceImageBuffer as Buffer,
            mimeType: sourceImageKey.endsWith(".webp") ? "image/webp" : "image/jpeg",
            title: postProps.title,
            summary: textResult.content,
            targetAspectRatio: "1:1",
            editInstruction: publication.imageEditInstruction ?? undefined,
          });
        } catch (error) {
          throw this.createError(
            "IMAGE_GENERATION_FAILED",
            `Falha na geracao de imagem: ${error instanceof Error ? error.message : String(error)}`,
            { stage: "GENERATING_IMAGE", retryable: true },
          );
        }

      let webpBuffer: Buffer = Buffer.alloc(0);

      if (shouldGenerateImage)
        try {
          await this.publicationRepository.updateStatus(
            publication.id,
            SocialPublicationStatus.CONVERTING_IMAGE,
          );

          webpBuffer = await this.imageService.toWebp(imageResult.image, 88);
        } catch (error) {
          throw this.createError(
            "IMAGE_CONVERSION_FAILED",
            `Falha na conversao da imagem: ${error instanceof Error ? error.message : String(error)}`,
            { stage: "CONVERTING_IMAGE", retryable: true },
          );
        }

      let uploadedImage: { key: string; url: string } = {
        key: parentPublication?.generatedImageKey ?? "",
        url: parentPublication?.generatedImageUrl ?? "",
      };

      if (shouldGenerateImage)
        try {
          await this.publicationRepository.updateStatus(
            publication.id,
            SocialPublicationStatus.UPLOADING_IMAGE,
          );

          const imageKey = `${this.uploadsMediaPath}/${input.postId}/${publication.id}/cover.webp`;

          uploadedImage = await this.awsS3Service.uploadObject({
            buffer: webpBuffer,
            contentType: "image/webp",
            key: imageKey,
          });
        } catch (error) {
          throw this.createError(
            "IMAGE_UPLOAD_FAILED",
            `Falha no upload da imagem: ${error instanceof Error ? error.message : String(error)}`,
            { stage: "UPLOADING_IMAGE", retryable: true },
          );
        }

      const processingDuration = Date.now() - startTime;
      const articleUrl =
        publication.articleUrl ?? `${this.siteUrl}/materias/${encodeURIComponent(postProps.slug)}`;
      const generatedContent = this.ensureArticleLink(textResult.content, articleUrl);

      await this.publicationRepository.complete({
        id: publication.id,
        generatedContent,
        generatedHashtags: textResult.hashtags,
        generatedShortTitle: textResult.shortTitle,
        generatedImageKey: uploadedImage.key,
        generatedImageUrl: uploadedImage.url,
        textModel: textResult.model,
        imageModel: imageResult.model,
        promptVersion: `${SOCIAL_TEXT_PROMPT_VERSION}/${SOCIAL_IMAGE_PROMPT_VERSION}`,
        processingMetadata: {
          durationMs: processingDuration,
          textTokens: textResult.usage,
          imageRequestId: imageResult.requestId,
          sourceImageKey,
          articleUrl,
          imageSizeBytes: webpBuffer.length,
        },
      });

      this.logger.log(
        `Social publication completed id=${publication.id} correlationId=${input.correlationId} durationMs=${processingDuration}`,
      );
    } catch (error) {
      if (error instanceof SocialPublicationProcessingError) {
        await this.publicationRepository.fail(publication.id, {
          errorCode: error.errorCode,
          errorMessage: error.errorMessage,
          errorDetails: error.errorDetails,
        });

        this.logger.error(
          `Social publication failed id=${publication.id} correlationId=${input.correlationId} code=${error.errorCode} msg=${error.errorMessage}`,
        );
      } else {
        await this.publicationRepository.fail(publication.id, {
          errorCode: "UNKNOWN_PROCESSING_ERROR",
          errorMessage: error instanceof Error ? error.message : String(error),
          errorDetails: { stage: "UNKNOWN" },
        });

        this.logger.error(
          `Social publication failed with unknown error id=${publication.id} correlationId=${input.correlationId}`,
          error instanceof Error ? error.stack : undefined,
        );
      }

      throw error;
    }
  }

  private extractMarkdownContent(content: unknown): string {
    if (typeof content === "string") {
      return content;
    }

    if (Array.isArray(content)) {
      const parts: string[] = [];

      for (const block of content) {
        if (typeof block === "object" && block !== null) {
          const b = block as Record<string, unknown>;

          if (b.type === "paragraph" && typeof b.content === "string") {
            parts.push(b.content);
          } else if (b.type === "heading" && typeof b.content === "string") {
            const level = typeof b.level === "number" ? b.level : 2;
            parts.push(`${"#".repeat(level)} ${b.content}`);
          } else if (b.type === "quote" && typeof b.content === "string") {
            parts.push(`> ${b.content}`);
          } else if (b.type === "list" && Array.isArray(b.items)) {
            parts.push(b.items.map((item: string) => `- ${item}`).join("\n"));
          } else if (b.type === "callout" && typeof b.content === "string") {
            parts.push(typeof b.title === "string" ? `**${b.title}**\n${b.content}` : b.content);
          }
        }
      }

      return parts.join("\n\n");
    }

    return String(content);
  }

  private extractS3Key(url: string): string | null {
    try {
      const parsedUrl = new URL(url);
      const pathParts = parsedUrl.pathname.split("/").filter(Boolean);
      return pathParts.length >= 1 ? pathParts.join("/") : null;
    } catch {
      return null;
    }
  }

  private ensureArticleLink(content: string, articleUrl: string): string {
    const normalizedContent = content.trim();

    if (normalizedContent.includes(articleUrl)) {
      return normalizedContent;
    }

    return `${normalizedContent}\n\nLeia a matéria completa: ${articleUrl}`;
  }

  private createError(
    errorCode: SocialPublicationErrorCode,
    errorMessage: string,
    details?: Record<string, unknown>,
  ): SocialPublicationProcessingError {
    return new SocialPublicationProcessingError(errorCode, errorMessage, details);
  }
}

class SocialPublicationProcessingError extends Error {
  constructor(
    public readonly errorCode: SocialPublicationErrorCode,
    public readonly errorMessage: string,
    public readonly errorDetails?: Record<string, unknown>,
  ) {
    super(errorMessage);
    this.name = "SocialPublicationProcessingError";
  }
}
