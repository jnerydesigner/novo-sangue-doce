import { createHash, randomBytes } from "node:crypto";
import type { AuthenticatedRequest } from "@app/@infra/guard/auth.guard";
import { PostRepository } from "@app/posts/repositories/post.repository";
import { AwsS3Service } from "@infra/storage/aws-s3.service";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  type SocialPublicationRecord,
  SocialPublicationRepository,
} from "../domain/social-publication.repository";
import { canRetry, SocialPublicationStatus } from "../domain/social-publication-status.enum";
import type { CreateSocialPublicationDto } from "../dto/create-social-publication.dto";
import type {
  EnqueueSocialPublicationResponseDto,
  SocialPublicationListResponseDto,
  SocialPublicationResponseDto,
} from "../dto/social-publication-response.dto";
import type { UpdateSocialPublicationDto } from "../dto/update-social-publication.dto";
import { SOCIAL_IMAGE_PROMPT_VERSION } from "./prompts/social-image.prompt";
import { SOCIAL_TEXT_PROMPT_VERSION } from "./prompts/social-text.prompt";
import { SocialPublicationProducer } from "./social-publication.queue";

@Injectable()
export class SocialPublicationService {
  constructor(
    private readonly publicationRepository: SocialPublicationRepository,
    private readonly postRepository: PostRepository,
    private readonly awsS3Service: AwsS3Service,
    private readonly socialPublicationProducer: SocialPublicationProducer,
    private readonly configService: ConfigService,
  ) {}

  async enqueue(
    postId: string,
    dto: CreateSocialPublicationDto,
    req: AuthenticatedRequest,
  ): Promise<EnqueueSocialPublicationResponseDto> {
    const post = await this.postRepository.findById(postId);

    if (!post) {
      throw new NotFoundException("Post nao encontrado.");
    }

    const postPublic = post.toPublic();

    if (!postPublic.coverImageUrl) {
      throw new BadRequestException(
        "O post nao possui imagem de banner para gerar a publicacao social.",
      );
    }

    if (postPublic.status !== "PUBLISHED") {
      throw new BadRequestException("Apenas posts publicados podem gerar publicacoes sociais.");
    }

    const activePublication = await this.publicationRepository.findActiveByPostId(postId);

    if (activePublication) {
      throw new BadRequestException(
        "Ja existe uma publicacao social em processamento para este post.",
      );
    }

    if (dto.generationMode !== "NEW_PUBLICATION" && !dto.parentPublicationId) {
      throw new BadRequestException("Informe a publicacao de origem para regenerar.");
    }

    let parentPublication: SocialPublicationRecord | null = null;
    if (dto.parentPublicationId) {
      parentPublication = await this.publicationRepository.findById(dto.parentPublicationId);
      if (!parentPublication || parentPublication.postId !== postId) {
        throw new BadRequestException("A publicacao de origem nao pertence a esta materia.");
      }
      if (parentPublication.status !== SocialPublicationStatus.COMPLETED) {
        throw new BadRequestException("Apenas publicacoes concluidas podem ser regeneradas.");
      }
    }

    const idempotencyKey = this.generateIdempotencyKey(
      postId,
      postPublic.updatedAt,
      postPublic.coverImageUrl,
      dto,
    );
    const existingPublication =
      await this.publicationRepository.findByIdempotencyKey(idempotencyKey);

    if (existingPublication) {
      return existingPublication.status === SocialPublicationStatus.FAILED
        ? this.retry(existingPublication.id)
        : this.toExistingEnqueueResponse(existingPublication);
    }

    const correlationId = randomBytes(16).toString("hex");
    const sourceImageKey = this.extractS3Key(postPublic.coverImageUrl) ?? undefined;
    const siteUrl = (
      this.configService.get<string>("URL_SITE") ?? "https://sanguedoce.com.br"
    ).replace(/\/+$/g, "");
    const articleUrl = `${siteUrl}/materias/${encodeURIComponent(postPublic.slug)}`;

    const publication = await this.publicationRepository.create({
      postId,
      correlationId,
      idempotencyKey,
      requestedBy: req.user?.sub,
      sourceImageKey,
      generationMode: dto.generationMode,
      parentPublicationId: parentPublication?.id,
      imageEditInstruction: dto.imageEditInstruction,
      articleUrl,
    });

    // A criacao pode retornar o registro vencedor de uma requisicao concorrente.
    if (publication.status !== SocialPublicationStatus.PENDING) {
      return publication.status === SocialPublicationStatus.FAILED
        ? this.retry(publication.id)
        : this.toExistingEnqueueResponse(publication);
    }

    const job = await this.socialPublicationProducer.enqueueGeneration(
      {
        socialPublicationId: publication.id,
        postId,
        correlationId,
        requestedBy: req.user?.sub ?? "",
      },
      publication.id,
    );

    await this.publicationRepository.setQueueJobId(publication.id, String(job.id));
    await this.publicationRepository.updateStatus(publication.id, SocialPublicationStatus.QUEUED);

    return {
      id: publication.id,
      postId,
      status: SocialPublicationStatus.QUEUED,
      message: "A publicacao foi adicionada a fila de processamento.",
    };
  }

  async findById(id: string): Promise<SocialPublicationResponseDto> {
    const publication = await this.publicationRepository.findById(id);

    if (!publication) {
      throw new NotFoundException("Publicacao social nao encontrada.");
    }

    return this.toResponseDto(publication);
  }

  async findByPostId(
    postId: string,
    page = 1,
    limit = 20,
  ): Promise<SocialPublicationListResponseDto> {
    const result = await this.publicationRepository.findByPostId(postId, { page, limit });

    return {
      data: result.data.map((r) => this.toResponseDto(r)),
      meta: result.meta,
    };
  }

  async findAll(page = 1, limit = 20): Promise<SocialPublicationListResponseDto> {
    const result = await this.publicationRepository.findAll({ page, limit });

    if (!result) {
      throw new NotFoundException("Nenhuma publicacao social encontrada.");
    }

    return {
      data: result.data.map((record) => this.toResponseDto(record)),
      meta: result.meta,
    };
  }

  async retry(id: string): Promise<EnqueueSocialPublicationResponseDto> {
    const publication = await this.publicationRepository.findById(id);

    if (!publication) {
      throw new NotFoundException("Publicacao social nao encontrada.");
    }

    if (!canRetry(publication.status)) {
      throw new BadRequestException(
        `Nao e possivel retry de uma publicacao com status ${publication.status}.`,
      );
    }

    const post = await this.postRepository.findById(publication.postId);

    if (!post) {
      throw new NotFoundException("Post original nao encontrado.");
    }

    const newCorrelationId = randomBytes(16).toString("hex");

    await this.publicationRepository.updateStatus(id, SocialPublicationStatus.PENDING);

    const job = await this.socialPublicationProducer.enqueueGeneration(
      {
        socialPublicationId: publication.id,
        postId: publication.postId,
        correlationId: newCorrelationId,
        requestedBy: publication.requestedBy ?? "",
      },
      `${publication.id}-${newCorrelationId}`,
    );

    await this.publicationRepository.setQueueJobId(publication.id, String(job.id));
    await this.publicationRepository.updateStatus(id, SocialPublicationStatus.QUEUED);

    return {
      id: publication.id,
      postId: publication.postId,
      status: SocialPublicationStatus.QUEUED,
      message: "A publicacao foi reenfileirada para processamento.",
    };
  }

  async updateReview(
    id: string,
    dto: UpdateSocialPublicationDto,
  ): Promise<SocialPublicationResponseDto> {
    const publication = await this.publicationRepository.findById(id);

    if (!publication) {
      throw new NotFoundException("Publicacao social nao encontrada.");
    }

    if (publication.status !== SocialPublicationStatus.COMPLETED) {
      throw new BadRequestException("Aguarde a geracao terminar antes de editar a publicacao.");
    }

    const post = await this.postRepository.findById(publication.postId);
    if (!post) {
      throw new NotFoundException("Post original nao encontrado.");
    }

    const siteUrl = (
      this.configService.get<string>("URL_SITE") ?? "https://sanguedoce.com.br"
    ).replace(/\/+$/g, "");
    const articleUrl = `${siteUrl}/materias/${encodeURIComponent(post.toPersistence().slug)}`;
    const description = this.ensureArticleLink(dto.description, articleUrl);

    await this.publicationRepository.updateReview(id, description, dto.socialNetworks);

    return this.findById(id);
  }

  private toResponseDto(record: SocialPublicationRecord): SocialPublicationResponseDto {
    return {
      id: record.id,
      postId: record.postId,
      status: record.status,
      generationMode: record.generationMode,
      parentPublicationId: record.parentPublicationId,
      imageEditInstruction: record.imageEditInstruction,
      articleUrl: record.articleUrl,
      generatedContent: record.generatedContent,
      generatedHashtags: record.generatedHashtags,
      generatedShortTitle: record.generatedShortTitle,
      generatedImageUrl: record.generatedImageUrl,
      socialNetworks: record.socialNetworks,
      publicationResults: record.publicationResults,
      textModel: record.textModel,
      imageModel: record.imageModel,
      promptVersion: record.promptVersion,
      attemptCount: record.attemptCount,
      errorCode: record.errorCode,
      errorMessage: record.errorMessage,
      createdAt: record.createdAt.toISOString(),
      completedAt: record.completedAt?.toISOString() ?? null,
    };
  }

  private toExistingEnqueueResponse(
    publication: SocialPublicationRecord,
  ): EnqueueSocialPublicationResponseDto {
    return {
      id: publication.id,
      postId: publication.postId,
      status: publication.status,
      message: "Esta publicacao ja foi solicitada anteriormente.",
    };
  }

  private generateIdempotencyKey(
    postId: string,
    updatedAt: Date,
    coverImageUrl: string | null,
    dto: CreateSocialPublicationDto,
  ): string {
    return createHash("sha256")
      .update(
        [
          postId,
          updatedAt.toISOString(),
          coverImageUrl ?? "",
          SOCIAL_TEXT_PROMPT_VERSION,
          SOCIAL_IMAGE_PROMPT_VERSION,
          dto.aspectRatio,
          dto.generationMode,
          dto.parentPublicationId ?? "",
          dto.imageEditInstruction ?? "",
        ].join(":"),
      )
      .digest("hex");
  }

  private extractS3Key(url: string): string | null {
    try {
      const parsedUrl = new URL(url);
      const pathParts = parsedUrl.pathname.split("/").filter(Boolean);

      if (pathParts.length < 2) {
        return null;
      }

      return pathParts.join("/");
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
}
