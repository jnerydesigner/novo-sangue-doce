-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PostAccentColor" AS ENUM ('GREEN', 'TOMATO', 'BLUE');

-- CreateTable
CREATE TABLE "post_authors" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "bio" TEXT,
    "avatar_url" TEXT,
    "email" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_authors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_categories" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "color" "PostAccentColor" NOT NULL DEFAULT 'GREEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_tags" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "standfirst" TEXT,
    "content" JSONB NOT NULL DEFAULT '[]',
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "reading_minutes" INTEGER NOT NULL DEFAULT 5,
    "cover_image_url" TEXT NOT NULL,
    "cover_image_alt" TEXT,
    "cover_caption" TEXT,
    "vertical_image_url" TEXT,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "author_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_tag_relations" (
    "post_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,

    CONSTRAINT "post_tag_relations_pkey" PRIMARY KEY ("post_id","tag_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "post_authors_slug_key" ON "post_authors"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "post_authors_email_key" ON "post_authors"("email");

-- CreateIndex
CREATE UNIQUE INDEX "post_categories_slug_key" ON "post_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "post_tags_slug_key" ON "post_tags"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "posts_slug_key" ON "posts"("slug");

-- CreateIndex
CREATE INDEX "posts_status_published_at_idx" ON "posts"("status", "published_at" DESC);

-- CreateIndex
CREATE INDEX "posts_featured_published_at_idx" ON "posts"("featured", "published_at" DESC);

-- CreateIndex
CREATE INDEX "posts_category_id_published_at_idx" ON "posts"("category_id", "published_at" DESC);

-- CreateIndex
CREATE INDEX "posts_author_id_idx" ON "posts"("author_id");

-- CreateIndex
CREATE INDEX "post_tag_relations_tag_id_idx" ON "post_tag_relations"("tag_id");

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "post_authors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "post_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_tag_relations" ADD CONSTRAINT "post_tag_relations_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_tag_relations" ADD CONSTRAINT "post_tag_relations_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "post_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
