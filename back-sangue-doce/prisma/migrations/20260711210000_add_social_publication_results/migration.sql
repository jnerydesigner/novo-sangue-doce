ALTER TABLE "social_publications"
ADD COLUMN "publication_results" JSONB NOT NULL DEFAULT '{}';
