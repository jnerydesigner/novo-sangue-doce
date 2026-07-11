import type { SocialPublicationGenerationMode } from "../dto/create-social-publication.dto";
import type { SocialNetwork } from "../dto/update-social-publication.dto";
import type { SocialPublicationStatus } from "./social-publication-status.enum";

export type CreateSocialPublicationData = {
  postId: string;
  correlationId: string;
  idempotencyKey: string;
  requestedBy?: string;
  sourceImageKey?: string;
  generationMode: SocialPublicationGenerationMode;
  parentPublicationId?: string;
  imageEditInstruction?: string;
  articleUrl: string;
};

export type SocialPublicationRecord = {
  id: string;
  postId: string;
  status: SocialPublicationStatus;
  generationMode: SocialPublicationGenerationMode;
  parentPublicationId: string | null;
  imageEditInstruction: string | null;
  articleUrl: string | null;
  generatedContent: string | null;
  generatedHashtags: string[] | null;
  generatedShortTitle: string | null;
  generatedImageKey: string | null;
  generatedImageUrl: string | null;
  socialNetworks: SocialNetwork[];
  publicationResults: SocialPublicationResults;
  sourceImageKey: string | null;
  queueJobId: string | null;
  correlationId: string;
  idempotencyKey: string;
  textModel: string | null;
  imageModel: string | null;
  promptVersion: string | null;
  attemptCount: number;
  errorCode: string | null;
  errorMessage: string | null;
  errorDetails: Record<string, unknown> | null;
  processingMetadata: Record<string, unknown> | null;
  requestedBy: string | null;
  queuedAt: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
  failedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type SocialPublicationResult = {
  status: "PUBLISHED";
  externalPostId: string | null;
  mediaUrn: string | null;
  publishedAt: string;
};

export type SocialPublicationResults = Partial<Record<SocialNetwork, SocialPublicationResult>>;

export type CompleteSocialPublicationData = {
  id: string;
  generatedContent: string;
  generatedHashtags: string[];
  generatedShortTitle: string;
  generatedImageKey: string;
  generatedImageUrl?: string;
  textModel: string;
  imageModel: string;
  promptVersion: string;
  processingMetadata?: Record<string, unknown>;
};

export type FailSocialPublicationData = {
  errorCode: string;
  errorMessage: string;
  errorDetails?: Record<string, unknown>;
};

export type SocialPublicationPaginationParams = {
  page: number;
  limit: number;
};

export type PaginatedSocialPublications = {
  data: SocialPublicationRecord[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export abstract class SocialPublicationRepository {
  abstract create(data: CreateSocialPublicationData): Promise<SocialPublicationRecord>;
  abstract findById(id: string): Promise<SocialPublicationRecord | null>;
  abstract findLatestCompletedByPostId(postId: string): Promise<SocialPublicationRecord | null>;
  abstract findByPostId(
    postId: string,
    params?: SocialPublicationPaginationParams,
  ): Promise<PaginatedSocialPublications>;
  abstract findAll(
    params?: SocialPublicationPaginationParams,
  ): Promise<PaginatedSocialPublications>;
  abstract findActiveByPostId(postId: string): Promise<SocialPublicationRecord | null>;
  abstract findByIdempotencyKey(key: string): Promise<SocialPublicationRecord | null>;
  abstract updateStatus(id: string, status: SocialPublicationStatus): Promise<void>;
  abstract markAsProcessing(id: string, attempt: number): Promise<void>;
  abstract setQueueJobId(id: string, jobId: string): Promise<void>;
  abstract updateReview(
    id: string,
    description: string,
    socialNetworks: SocialNetwork[],
  ): Promise<void>;
  abstract markAsPublished(
    id: string,
    network: SocialNetwork,
    result: SocialPublicationResult,
  ): Promise<void>;
  abstract complete(data: CompleteSocialPublicationData): Promise<void>;
  abstract fail(id: string, error: FailSocialPublicationData): Promise<void>;
}
