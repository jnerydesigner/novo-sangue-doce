/*
  Warnings:

  - You are about to drop the column `foods_id` on the `foods_category` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `foods_category` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `category_id` to the `foods` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "foods_category" DROP CONSTRAINT "foods_category_foods_id_fkey";

-- DropIndex
DROP INDEX "foods_description_name_idx";

-- AlterTable
ALTER TABLE "foods" ADD COLUMN     "category_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "foods_category" DROP COLUMN "foods_id";

-- CreateIndex
CREATE INDEX "foods_category_id_idx" ON "foods"("category_id");

-- CreateIndex
CREATE INDEX "foods_name_description_idx" ON "foods"("name", "description");

-- CreateIndex
CREATE UNIQUE INDEX "foods_category_name_key" ON "foods_category"("name");

-- AddForeignKey
ALTER TABLE "foods" ADD CONSTRAINT "foods_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "foods_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
