-- CreateTable
CREATE TABLE "food_images" (
    "id" TEXT NOT NULL,
    "foodsId" INTEGER,
    "normalized_name" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "s3_key" TEXT NOT NULL,
    "source_url" TEXT,
    "source_name" TEXT,
    "license" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "food_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "food_images_normalized_name_key" ON "food_images"("normalized_name");

-- CreateIndex
CREATE INDEX "food_images_normalized_name_idx" ON "food_images"("normalized_name");

-- AddForeignKey
ALTER TABLE "food_images" ADD CONSTRAINT "food_images_foodsId_fkey" FOREIGN KEY ("foodsId") REFERENCES "foods"("id") ON DELETE SET NULL ON UPDATE CASCADE;
