ALTER TABLE "social_publications"
ADD COLUMN "social_networks" JSONB NOT NULL DEFAULT '[]';
