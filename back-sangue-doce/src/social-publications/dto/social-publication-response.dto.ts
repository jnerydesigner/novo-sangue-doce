import type { SocialPublicationResults } from "../domain/social-publication.repository";
import type { SocialPublicationStatus } from "../domain/social-publication-status.enum";
import type { SocialPublicationGenerationMode } from "./create-social-publication.dto";
import type { SocialNetwork } from "./update-social-publication.dto";

export type SocialPublicationResponseDto = {
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
  generatedImageUrl: string | null;
  socialNetworks: SocialNetwork[];
  publicationResults: SocialPublicationResults;
  scheduledPublishAt: string | null;
  scheduledSocialNetworks: SocialNetwork[];
  scheduledPublishJobId: string | null;
  textModel: string | null;
  imageModel: string | null;
  promptVersion: string | null;
  attemptCount: number;
  errorCode: string | null;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
};

export type SocialPublicationListResponseDto = {
  data: SocialPublicationResponseDto[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export type EnqueueSocialPublicationResponseDto = {
  id: string;
  postId: string;
  status: SocialPublicationStatus;
  message: string;
};
