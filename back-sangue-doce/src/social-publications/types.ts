export type SocialPublicationJobData = {
  socialPublicationId: string;
  postId: string;
  correlationId: string;
  requestedBy: string;
};

export type ScheduledSocialPublicationJobData = {
  socialPublicationId: string;
  requestedBy: string;
};

export type GenerateSocialContentInput = {
  title: string;
  markdown: string;
  category?: string;
  tags?: string[];
};

export type GenerateSocialContentOutput = {
  content: string;
  hashtags: string[];
  shortTitle: string;
  model: string;
  requestId?: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
  };
};

export type GenerateSocialImageInput = {
  sourceImage: Buffer;
  mimeType: string;
  title: string;
  summary: string;
  targetAspectRatio: "1:1" | "4:5" | "16:9";
  editInstruction?: string;
};

export type GenerateSocialImageOutput = {
  image: Buffer;
  mimeType: string;
  model: string;
  requestId?: string;
  revisedPrompt?: string;
};

export type SocialPublicationErrorCode =
  | "POST_NOT_FOUND"
  | "POST_CONTENT_EMPTY"
  | "POST_BANNER_MISSING"
  | "SOURCE_IMAGE_NOT_FOUND"
  | "SOURCE_IMAGE_INVALID"
  | "TEXT_GENERATION_FAILED"
  | "TEXT_RESPONSE_INVALID"
  | "IMAGE_GENERATION_FAILED"
  | "IMAGE_RESPONSE_INVALID"
  | "IMAGE_CONVERSION_FAILED"
  | "IMAGE_UPLOAD_FAILED"
  | "DATABASE_UPDATE_FAILED"
  | "JOB_TIMEOUT"
  | "UNKNOWN_PROCESSING_ERROR";
