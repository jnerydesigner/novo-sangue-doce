/*
  Warnings:

  - Added the required column `user_id` to the `post_authors` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "post_authors" ADD COLUMN     "user_id" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "post_authors" ADD CONSTRAINT "post_authors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
