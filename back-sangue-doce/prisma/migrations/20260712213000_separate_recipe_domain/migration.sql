CREATE TYPE "RecipeStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

CREATE TABLE "recipe_authors" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "bio" TEXT,
  "email" TEXT,
  "user_id" UUID NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "recipe_authors_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "recipe_categories" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "color" "PostAccentColor" NOT NULL DEFAULT 'GREEN',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "recipe_categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "recipe_tags" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "recipe_tags_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "recipe_tag_relations" (
  "recipe_id" UUID NOT NULL,
  "tag_id" UUID NOT NULL,
  CONSTRAINT "recipe_tag_relations_pkey" PRIMARY KEY ("recipe_id", "tag_id")
);

INSERT INTO "recipe_authors" ("id", "name", "slug", "role", "bio", "email", "user_id", "created_at", "updated_at")
SELECT gen_random_uuid(), pa."name", pa."slug", pa."role", pa."bio", pa."email", pa."user_id", NOW(), NOW()
FROM "post_authors" pa
WHERE EXISTS (SELECT 1 FROM "recipes" r JOIN "posts" p ON p."id" = r."post_id" WHERE p."author_id" = pa."id");

INSERT INTO "recipe_categories" ("id", "name", "slug", "color", "created_at", "updated_at")
SELECT gen_random_uuid(), pc."name", pc."slug", pc."color", NOW(), NOW()
FROM "post_categories" pc
WHERE EXISTS (SELECT 1 FROM "recipes" r JOIN "posts" p ON p."id" = r."post_id" WHERE p."category_id" = pc."id");

INSERT INTO "recipe_tags" ("id", "name", "slug", "created_at", "updated_at")
SELECT gen_random_uuid(), pt."name", pt."slug", NOW(), NOW()
FROM "post_tags" pt
WHERE EXISTS (SELECT 1 FROM "recipes" r JOIN "post_tag_relations" ptr ON ptr."post_id" = r."post_id" WHERE ptr."tag_id" = pt."id");

ALTER TABLE "recipes"
  ADD COLUMN "slug" TEXT,
  ADD COLUMN "title" TEXT,
  ADD COLUMN "excerpt" TEXT,
  ADD COLUMN "content" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN "status" "RecipeStatus" NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "reading_minutes" INTEGER NOT NULL DEFAULT 5,
  ADD COLUMN "cover_image_url" TEXT,
  ADD COLUMN "cover_image_alt" TEXT,
  ADD COLUMN "meta_title" TEXT,
  ADD COLUMN "meta_description" TEXT,
  ADD COLUMN "published_at" TIMESTAMP(3),
  ADD COLUMN "author_id" UUID,
  ADD COLUMN "category_id" UUID;

UPDATE "recipes" r SET
  "slug" = p."slug", "title" = p."title", "excerpt" = p."excerpt", "content" = p."content",
  "status" = p."status"::text::"RecipeStatus", "featured" = p."featured",
  "reading_minutes" = p."reading_minutes", "cover_image_url" = p."cover_image_url",
  "cover_image_alt" = p."cover_image_alt", "meta_title" = p."meta_title",
  "meta_description" = p."meta_description", "published_at" = p."published_at",
  "author_id" = ra."id", "category_id" = rc."id"
FROM "posts" p
JOIN "post_authors" pa ON pa."id" = p."author_id"
JOIN "recipe_authors" ra ON ra."slug" = pa."slug"
JOIN "post_categories" pc ON pc."id" = p."category_id"
JOIN "recipe_categories" rc ON rc."slug" = pc."slug"
WHERE p."id" = r."post_id";

INSERT INTO "recipe_tag_relations" ("recipe_id", "tag_id")
SELECT r."id", rt."id" FROM "recipes" r
JOIN "post_tag_relations" ptr ON ptr."post_id" = r."post_id"
JOIN "post_tags" pt ON pt."id" = ptr."tag_id"
JOIN "recipe_tags" rt ON rt."slug" = pt."slug";

ALTER TABLE "recipes" ALTER COLUMN "slug" SET NOT NULL, ALTER COLUMN "title" SET NOT NULL,
  ALTER COLUMN "excerpt" SET NOT NULL, ALTER COLUMN "author_id" SET NOT NULL,
  ALTER COLUMN "category_id" SET NOT NULL;

CREATE UNIQUE INDEX "recipe_authors_slug_key" ON "recipe_authors"("slug");
CREATE UNIQUE INDEX "recipe_authors_email_key" ON "recipe_authors"("email");
CREATE UNIQUE INDEX "recipe_categories_slug_key" ON "recipe_categories"("slug");
CREATE UNIQUE INDEX "recipe_tags_slug_key" ON "recipe_tags"("slug");
CREATE UNIQUE INDEX "recipes_slug_key" ON "recipes"("slug");
CREATE INDEX "recipes_status_published_at_idx" ON "recipes"("status", "published_at" DESC);
CREATE INDEX "recipes_category_id_published_at_idx" ON "recipes"("category_id", "published_at" DESC);
CREATE INDEX "recipes_author_id_idx" ON "recipes"("author_id");
CREATE INDEX "recipe_tag_relations_tag_id_idx" ON "recipe_tag_relations"("tag_id");

ALTER TABLE "recipe_authors" ADD CONSTRAINT "recipe_authors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "recipe_authors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "recipe_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "recipe_tag_relations" ADD CONSTRAINT "recipe_tag_relations_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "recipe_tag_relations" ADD CONSTRAINT "recipe_tag_relations_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "recipe_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "recipes" DROP CONSTRAINT "recipes_post_id_fkey";

DELETE FROM "posts" WHERE "id" IN (SELECT "post_id" FROM "recipes");

DROP INDEX "recipes_post_id_key";
ALTER TABLE "recipes" DROP COLUMN "post_id";
