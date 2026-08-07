/*
  Warnings:

  - You are about to drop the column `foodsId` on the `food_images` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "food_images" DROP CONSTRAINT "food_images_foodsId_fkey";

-- AlterTable
ALTER TABLE "food_images" DROP COLUMN "foodsId";

-- CreateTable
CREATE TABLE "_FoodImageToFoods" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_FoodImageToFoods_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_FoodImageToFoods_B_index" ON "_FoodImageToFoods"("B");

-- AddForeignKey
ALTER TABLE "_FoodImageToFoods" ADD CONSTRAINT "_FoodImageToFoods_A_fkey" FOREIGN KEY ("A") REFERENCES "food_images"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FoodImageToFoods" ADD CONSTRAINT "_FoodImageToFoods_B_fkey" FOREIGN KEY ("B") REFERENCES "foods"("id") ON DELETE CASCADE ON UPDATE CASCADE;
