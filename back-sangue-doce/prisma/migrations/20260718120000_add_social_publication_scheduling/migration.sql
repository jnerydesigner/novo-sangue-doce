ALTER TABLE "social_publications"
ADD COLUMN "scheduled_publish_at" TIMESTAMP(3),
ADD COLUMN "scheduled_social_networks" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN "scheduled_publish_job_id" TEXT,
ADD COLUMN "scheduled_by" UUID;

CREATE UNIQUE INDEX "social_publications_scheduled_publish_job_id_key"
ON "social_publications"("scheduled_publish_job_id");

CREATE INDEX "social_publications_scheduled_publish_at_idx"
ON "social_publications"("scheduled_publish_at");

CREATE UNIQUE INDEX "social_publications_scheduled_publish_at_active_key"
ON "social_publications"("scheduled_publish_at")
WHERE "scheduled_publish_at" IS NOT NULL AND "scheduled_publish_job_id" IS NOT NULL;
