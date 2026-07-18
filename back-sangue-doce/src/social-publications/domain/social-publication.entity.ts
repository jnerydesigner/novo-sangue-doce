import type {
  CreateSocialPublicationData,
  SocialPublicationRecord,
} from "./social-publication.repository";
import { isTerminalStatus, type SocialPublicationStatus } from "./social-publication-status.enum";

export class SocialPublicationEntity {
  private constructor(private readonly props: SocialPublicationRecord) {}

  static create(data: CreateSocialPublicationData): SocialPublicationEntity {
    const now = new Date();

    return new SocialPublicationEntity({
      id: "",
      postId: data.postId,
      status: "PENDING" as SocialPublicationStatus,
      generationMode: data.generationMode,
      parentPublicationId: data.parentPublicationId ?? null,
      imageEditInstruction: data.imageEditInstruction ?? null,
      articleUrl: data.articleUrl,
      generatedContent: null,
      generatedHashtags: null,
      generatedShortTitle: null,
      generatedImageKey: null,
      generatedImageUrl: null,
      socialNetworks: [],
      publicationResults: {},
      scheduledPublishAt: null,
      scheduledSocialNetworks: [],
      scheduledPublishJobId: null,
      scheduledBy: null,
      sourceImageKey: data.sourceImageKey ?? null,
      queueJobId: null,
      correlationId: data.correlationId,
      idempotencyKey: data.idempotencyKey,
      textModel: null,
      imageModel: null,
      promptVersion: null,
      attemptCount: 0,
      errorCode: null,
      errorMessage: null,
      errorDetails: null,
      processingMetadata: null,
      requestedBy: data.requestedBy ?? null,
      queuedAt: null,
      startedAt: null,
      completedAt: null,
      failedAt: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static fromRecord(record: SocialPublicationRecord): SocialPublicationEntity {
    return new SocialPublicationEntity(record);
  }

  getId(): string {
    return this.props.id;
  }

  getPostId(): string {
    return this.props.postId;
  }

  getStatus(): SocialPublicationStatus {
    return this.props.status;
  }

  getCorrelationId(): string {
    return this.props.correlationId;
  }

  getGeneratedContent(): string | null {
    return this.props.generatedContent;
  }

  getGeneratedHashtags(): string[] | null {
    return this.props.generatedHashtags;
  }

  getGeneratedImageKey(): string | null {
    return this.props.generatedImageKey;
  }

  isTerminal(): boolean {
    return isTerminalStatus(this.props.status);
  }

  toRecord(): SocialPublicationRecord {
    return { ...this.props };
  }
}
