-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "parent_post_id" UUID,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "posts_parent_post_id_idx" ON "posts"("parent_post_id");

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_parent_post_id_fkey" FOREIGN KEY ("parent_post_id") REFERENCES "posts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
