CREATE TABLE "post_author_social_media" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "author_id" UUID NOT NULL,
  "nome_rede_social" TEXT NOT NULL,
  "slug_rede_social" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "position" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "post_author_social_media_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "post_author_social_media_author_id_slug_rede_social_key"
  ON "post_author_social_media"("author_id", "slug_rede_social");

CREATE INDEX "post_author_social_media_author_id_position_idx"
  ON "post_author_social_media"("author_id", "position");

ALTER TABLE "post_author_social_media"
  ADD CONSTRAINT "post_author_social_media_author_id_fkey"
  FOREIGN KEY ("author_id") REFERENCES "post_authors"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
