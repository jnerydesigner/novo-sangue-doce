export enum SocialPublicationStatus {
  PENDING = "PENDING",
  QUEUED = "QUEUED",
  PROCESSING = "PROCESSING",
  GENERATING_TEXT = "GENERATING_TEXT",
  GENERATING_IMAGE = "GENERATING_IMAGE",
  CONVERTING_IMAGE = "CONVERTING_IMAGE",
  UPLOADING_IMAGE = "UPLOADING_IMAGE",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
  STANDBY = "STANDBY",
}

const TERMINAL_STATUSES: SocialPublicationStatus[] = [
  SocialPublicationStatus.COMPLETED,
  SocialPublicationStatus.FAILED,
  SocialPublicationStatus.CANCELLED,
  SocialPublicationStatus.STANDBY,
];

const PROCESSING_STATUSES: SocialPublicationStatus[] = [
  SocialPublicationStatus.PROCESSING,
  SocialPublicationStatus.GENERATING_TEXT,
  SocialPublicationStatus.GENERATING_IMAGE,
  SocialPublicationStatus.CONVERTING_IMAGE,
  SocialPublicationStatus.UPLOADING_IMAGE,
];

export function isTerminalStatus(status: SocialPublicationStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}

export function isProcessingStatus(status: SocialPublicationStatus): boolean {
  return PROCESSING_STATUSES.includes(status);
}

export function canRetry(status: SocialPublicationStatus): boolean {
  return status === SocialPublicationStatus.FAILED;
}

export function canCancel(status: SocialPublicationStatus): boolean {
  return status === SocialPublicationStatus.PENDING || status === SocialPublicationStatus.QUEUED;
}
