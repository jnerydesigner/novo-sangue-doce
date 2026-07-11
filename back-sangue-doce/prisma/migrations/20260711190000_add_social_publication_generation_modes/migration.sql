CREATE TYPE "SocialPublicationGenerationMode" AS ENUM ('NEW_PUBLICATION', 'REGENERATE_TEXT', 'REGENERATE_IMAGE');

ALTER TABLE "social_publications"
ADD COLUMN "generation_mode" "SocialPublicationGenerationMode" NOT NULL DEFAULT 'NEW_PUBLICATION',
ADD COLUMN "parent_publication_id" UUID,
ADD COLUMN "image_edit_instruction" VARCHAR(500);

CREATE INDEX "social_publications_parent_publication_id_idx" ON "social_publications"("parent_publication_id");

ALTER TABLE "social_publications"
ADD CONSTRAINT "social_publications_parent_publication_id_fkey"
FOREIGN KEY ("parent_publication_id") REFERENCES "social_publications"("id") ON DELETE SET NULL ON UPDATE CASCADE;
