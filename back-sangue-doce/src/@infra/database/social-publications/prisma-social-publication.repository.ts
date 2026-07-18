import {
  type CompleteSocialPublicationData,
  type CreateSocialPublicationData,
  type FailSocialPublicationData,
  type PaginatedSocialPublications,
  type SocialPublicationPaginationParams,
  type SocialPublicationRecord,
  SocialPublicationRepository,
  type SocialPublicationResult,
  type SocialPublicationResults,
} from "@app/social-publications/domain/social-publication.repository";
import { SocialPublicationStatus } from "@app/social-publications/domain/social-publication-status.enum";
import type { SocialNetwork } from "@app/social-publications/dto/update-social-publication.dto";
import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma.service";

@Injectable()
export class PrismaSocialPublicationRepository implements SocialPublicationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateSocialPublicationData): Promise<SocialPublicationRecord> {
    try {
      const record = await this.prisma.socialPublication.create({
        data: {
          postId: data.postId,
          correlationId: data.correlationId,
          idempotencyKey: data.idempotencyKey,
          requestedBy: data.requestedBy,
          sourceImageKey: data.sourceImageKey,
          generationMode: data.generationMode,
          parentPublicationId: data.parentPublicationId,
          imageEditInstruction: data.imageEditInstruction,
          articleUrl: data.articleUrl,
        },
      });

      return this.toRecord(record);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        const existing = await this.prisma.socialPublication.findUnique({
          where: { idempotencyKey: data.idempotencyKey },
        });

        if (existing) {
          return this.toRecord(existing);
        }
      }

      throw error;
    }
  }

  async findById(id: string): Promise<SocialPublicationRecord | null> {
    const record = await this.prisma.socialPublication.findUnique({ where: { id } });

    return record ? this.toRecord(record) : null;
  }

  async findLatestCompletedByPostId(postId: string): Promise<SocialPublicationRecord | null> {
    const record = await this.prisma.socialPublication.findFirst({
      where: { postId, status: "COMPLETED" },
      orderBy: { createdAt: "desc" },
    });

    return record ? this.toRecord(record) : null;
  }

  async findByPostId(
    postId: string,
    params: SocialPublicationPaginationParams = { page: 1, limit: 20 },
  ): Promise<PaginatedSocialPublications> {
    const skip = (params.page - 1) * params.limit;
    const [records, total] = await this.prisma.$transaction([
      this.prisma.socialPublication.findMany({
        where: { postId, status: { not: "STANDBY" } },
        orderBy: { createdAt: "desc" },
        skip,
        take: params.limit,
      }),
      this.prisma.socialPublication.count({ where: { postId, status: { not: "STANDBY" } } }),
    ]);
    const totalPages = Math.max(1, Math.ceil(total / params.limit));

    return {
      data: records.map((r) => this.toRecord(r)),
      meta: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages,
        hasNextPage: params.page < totalPages,
        hasPreviousPage: params.page > 1,
      },
    };
  }

  async findAll(
    params: SocialPublicationPaginationParams = { page: 1, limit: 20 },
  ): Promise<PaginatedSocialPublications> {
    const skip = (params.page - 1) * params.limit;
    const [records, total] = await this.prisma.$transaction([
      this.prisma.socialPublication.findMany({
        where: { status: { not: "STANDBY" } },
        orderBy: { createdAt: "desc" },
        skip,
        take: params.limit,
      }),
      this.prisma.socialPublication.count({ where: { status: { not: "STANDBY" } } }),
    ]);
    const totalPages = Math.max(1, Math.ceil(total / params.limit));

    return {
      data: records.map((record) => this.toRecord(record)),
      meta: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages,
        hasNextPage: params.page < totalPages,
        hasPreviousPage: params.page > 1,
      },
    };
  }

  async findActiveByPostId(postId: string): Promise<SocialPublicationRecord | null> {
    const record = await this.prisma.socialPublication.findFirst({
      where: {
        postId,
        status: {
          in: [
            "PENDING",
            "QUEUED",
            "PROCESSING",
            "GENERATING_TEXT",
            "GENERATING_IMAGE",
            "CONVERTING_IMAGE",
            "UPLOADING_IMAGE",
          ],
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return record ? this.toRecord(record) : null;
  }

  async findByIdempotencyKey(key: string): Promise<SocialPublicationRecord | null> {
    const record = await this.prisma.socialPublication.findUnique({
      where: { idempotencyKey: key },
    });

    return record ? this.toRecord(record) : null;
  }

  async findLatestScheduledPublishAt(from: Date): Promise<Date | null> {
    const record = await this.prisma.socialPublication.findFirst({
      where: {
        scheduledPublishAt: { gte: from },
        scheduledPublishJobId: { not: null },
      },
      orderBy: { scheduledPublishAt: "desc" },
      select: { scheduledPublishAt: true },
    });

    return record?.scheduledPublishAt ?? null;
  }

  async updateStatus(id: string, status: SocialPublicationStatus): Promise<void> {
    const data: Record<string, unknown> = { status };

    if (status === SocialPublicationStatus.QUEUED) {
      data.queuedAt = new Date();
    }

    await this.prisma.socialPublication.update({ where: { id }, data });
  }

  async markAsProcessing(id: string, attempt: number): Promise<void> {
    await this.prisma.socialPublication.update({
      where: { id },
      data: {
        status: "PROCESSING",
        startedAt: new Date(),
        attemptCount: attempt,
      },
    });
  }

  async setQueueJobId(id: string, jobId: string): Promise<void> {
    await this.prisma.socialPublication.update({
      where: { id },
      data: { queueJobId: jobId },
    });
  }

  async updateReview(
    id: string,
    description: string,
    socialNetworks: SocialNetwork[],
  ): Promise<void> {
    await this.prisma.socialPublication.update({
      where: { id },
      data: { generatedContent: description, socialNetworks },
    });
  }

  async schedulePublication(
    id: string,
    data: {
      scheduledPublishAt: Date;
      scheduledSocialNetworks: SocialNetwork[];
      scheduledPublishJobId: string;
      scheduledBy?: string;
    },
  ): Promise<void> {
    await this.prisma.socialPublication.update({
      where: { id },
      data: {
        scheduledPublishAt: data.scheduledPublishAt,
        scheduledSocialNetworks: data.scheduledSocialNetworks,
        scheduledPublishJobId: data.scheduledPublishJobId,
        scheduledBy: data.scheduledBy,
        socialNetworks: data.scheduledSocialNetworks,
      },
    });
  }

  async markScheduleDispatched(id: string): Promise<void> {
    await this.prisma.socialPublication.update({
      where: { id },
      data: { scheduledPublishJobId: null },
    });
  }

  async markAsPublished(
    id: string,
    network: SocialNetwork,
    result: SocialPublicationResult,
  ): Promise<void> {
    const publication = await this.prisma.socialPublication.findUniqueOrThrow({ where: { id } });
    const currentResults =
      publication.publicationResults && typeof publication.publicationResults === "object"
        ? (publication.publicationResults as SocialPublicationResults)
        : {};

    await this.prisma.socialPublication.update({
      where: { id },
      data: {
        publicationResults: {
          ...currentResults,
          [network]: result,
        } as Prisma.InputJsonValue,
      },
    });
  }

  async complete(data: CompleteSocialPublicationData): Promise<void> {
    await this.prisma.$transaction(async (transaction) => {
      const publication = await transaction.socialPublication.findUnique({
        where: { id: data.id },
        select: { parentPublicationId: true },
      });

      await transaction.socialPublication.update({
        where: { id: data.id },
        data: {
          status: "COMPLETED",
          generatedContent: data.generatedContent,
          generatedHashtags: data.generatedHashtags,
          generatedShortTitle: data.generatedShortTitle,
          generatedImageKey: data.generatedImageKey,
          generatedImageUrl: data.generatedImageUrl,
          textModel: data.textModel,
          imageModel: data.imageModel,
          promptVersion: data.promptVersion,
          processingMetadata: data.processingMetadata as Prisma.InputJsonValue,
          completedAt: new Date(),
        },
      });

      if (publication?.parentPublicationId) {
        await transaction.socialPublication.update({
          where: { id: publication.parentPublicationId },
          data: { status: "STANDBY" },
        });
      }
    });
  }

  async fail(id: string, error: FailSocialPublicationData): Promise<void> {
    await this.prisma.socialPublication.update({
      where: { id },
      data: {
        status: "FAILED",
        errorCode: error.errorCode,
        errorMessage: error.errorMessage,
        errorDetails: error.errorDetails as Prisma.InputJsonValue,
        failedAt: new Date(),
      },
    });
  }

  private toRecord(
    record: Prisma.SocialPublicationGetPayload<Record<string, never>>,
  ): SocialPublicationRecord {
    const socialNetworks = Array.isArray(record.socialNetworks)
      ? (record.socialNetworks as SocialNetwork[])
      : [];
    const scheduledSocialNetworks = Array.isArray(record.scheduledSocialNetworks)
      ? (record.scheduledSocialNetworks as SocialNetwork[])
      : [];
    const publicationResults =
      record.publicationResults && typeof record.publicationResults === "object"
        ? (record.publicationResults as SocialPublicationResults)
        : {};

    return {
      id: record.id,
      postId: record.postId,
      status: record.status as SocialPublicationStatus,
      generationMode: record.generationMode,
      parentPublicationId: record.parentPublicationId,
      imageEditInstruction: record.imageEditInstruction,
      articleUrl: record.articleUrl,
      generatedContent: record.generatedContent,
      generatedHashtags: record.generatedHashtags as string[] | null,
      generatedShortTitle: record.generatedShortTitle,
      generatedImageKey: record.generatedImageKey,
      generatedImageUrl: record.generatedImageUrl,
      socialNetworks,
      publicationResults,
      scheduledPublishAt: record.scheduledPublishAt,
      scheduledSocialNetworks,
      scheduledPublishJobId: record.scheduledPublishJobId,
      scheduledBy: record.scheduledBy,
      sourceImageKey: record.sourceImageKey,
      queueJobId: record.queueJobId,
      correlationId: record.correlationId,
      idempotencyKey: record.idempotencyKey,
      textModel: record.textModel,
      imageModel: record.imageModel,
      promptVersion: record.promptVersion,
      attemptCount: record.attemptCount,
      errorCode: record.errorCode,
      errorMessage: record.errorMessage,
      errorDetails: record.errorDetails as Record<string, unknown> | null,
      processingMetadata: record.processingMetadata as Record<string, unknown> | null,
      requestedBy: record.requestedBy,
      queuedAt: record.queuedAt,
      startedAt: record.startedAt,
      completedAt: record.completedAt,
      failedAt: record.failedAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
