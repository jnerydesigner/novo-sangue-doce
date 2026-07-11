ALTER TABLE "social_publications" RENAME COLUMN "generatedContent" TO "generated_content";
ALTER TABLE "social_publications" RENAME COLUMN "generatedHashtags" TO "generated_hashtags";
ALTER TABLE "social_publications" RENAME COLUMN "generatedShortTitle" TO "generated_short_title";
ALTER TABLE "social_publications" RENAME COLUMN "generatedImageKey" TO "generated_image_key";
ALTER TABLE "social_publications" RENAME COLUMN "generatedImageUrl" TO "generated_image_url";
ALTER TABLE "social_publications" RENAME COLUMN "sourceImageKey" TO "source_image_key";
ALTER TABLE "social_publications" RENAME COLUMN "queueJobId" TO "queue_job_id";
ALTER TABLE "social_publications" RENAME COLUMN "correlationId" TO "correlation_id";
ALTER TABLE "social_publications" RENAME COLUMN "idempotencyKey" TO "idempotency_key";
ALTER TABLE "social_publications" RENAME COLUMN "textModel" TO "text_model";
ALTER TABLE "social_publications" RENAME COLUMN "imageModel" TO "image_model";
ALTER TABLE "social_publications" RENAME COLUMN "promptVersion" TO "prompt_version";
ALTER TABLE "social_publications" RENAME COLUMN "attemptCount" TO "attempt_count";
ALTER TABLE "social_publications" RENAME COLUMN "errorCode" TO "error_code";
ALTER TABLE "social_publications" RENAME COLUMN "errorMessage" TO "error_message";
ALTER TABLE "social_publications" RENAME COLUMN "errorDetails" TO "error_details";
ALTER TABLE "social_publications" RENAME COLUMN "processingMetadata" TO "processing_metadata";
ALTER TABLE "social_publications" RENAME COLUMN "requestedBy" TO "requested_by";

ALTER INDEX "social_publications_correlationId_key" RENAME TO "social_publications_correlation_id_key";
ALTER INDEX "social_publications_idempotencyKey_key" RENAME TO "social_publications_idempotency_key_key";

CREATE UNIQUE INDEX "social_publications_queue_job_id_key" ON "social_publications"("queue_job_id");
