-- CreateEnum
CREATE TYPE "SocialPublicationStatus" AS ENUM ('PENDING', 'QUEUED', 'PROCESSING', 'GENERATING_TEXT', 'GENERATING_IMAGE', 'CONVERTING_IMAGE', 'UPLOADING_IMAGE', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "social_publications" (
    "id" UUID NOT NULL,
    "postId" UUID NOT NULL,
    "status" "SocialPublicationStatus" NOT NULL DEFAULT 'PENDING',
    "generatedContent" TEXT,
    "generatedHashtags" JSONB,
    "generatedShortTitle" TEXT,
    "generatedImageKey" TEXT,
    "generatedImageUrl" TEXT,
    "sourceImageKey" TEXT,
    "queueJobId" TEXT,
    "correlationId" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "textModel" TEXT,
    "imageModel" TEXT,
    "promptVersion" TEXT,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "errorDetails" JSONB,
    "processingMetadata" JSONB,
    "requestedBy" UUID,
    "queued_at" TIMESTAMP(3),
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "failed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_publications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "social_publications_correlationId_key" ON "social_publications"("correlationId");

-- CreateIndex
CREATE UNIQUE INDEX "social_publications_idempotencyKey_key" ON "social_publications"("idempotencyKey");

-- CreateIndex
CREATE INDEX "social_publications_postId_idx" ON "social_publications"("postId");

-- CreateIndex
CREATE INDEX "social_publications_status_idx" ON "social_publications"("status");

-- CreateIndex
CREATE INDEX "social_publications_created_at_idx" ON "social_publications"("created_at");

-- AddForeignKey
ALTER TABLE "social_publications" ADD CONSTRAINT "social_publications_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
