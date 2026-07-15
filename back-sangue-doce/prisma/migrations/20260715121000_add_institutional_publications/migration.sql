CREATE TABLE "institutional_publications" (
    "id" UUID NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "content" TEXT NOT NULL,
    "hashtags" JSONB NOT NULL DEFAULT '[]',
    "image_key" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "publication_results" JSONB NOT NULL DEFAULT '{}',
    "requested_by" UUID,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "institutional_publications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "institutional_publications_created_at_idx" ON "institutional_publications"("created_at");
