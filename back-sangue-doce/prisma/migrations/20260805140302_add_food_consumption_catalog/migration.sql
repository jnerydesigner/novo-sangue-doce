-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('BREAKFAST', 'MORNING_SNACK', 'LUNCH', 'AFTERNOON_SNACK', 'DINNER', 'SUPPER', 'OTHER');

-- CreateEnum
CREATE TYPE "FoodQuantityUnit" AS ENUM ('GRAM', 'MILLILITER', 'UNIT', 'SLICE', 'TABLESPOON', 'TEASPOON', 'CUP', 'SCOOP', 'PORTION');

-- CreateTable
CREATE TABLE "food_consumption" (
    "id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "meal_type" "MealType" NOT NULL,
    "consumed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "notes" TEXT,
    "total_carbohydrates_g" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "total_protein_g" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "total_fat_g" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "total_fiber_g" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "total_energy_kcal" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "food_consumption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_consumption_item" (
    "id" SERIAL NOT NULL,
    "consumption_id" INTEGER NOT NULL,
    "food_id" INTEGER NOT NULL,
    "quantity" DECIMAL(10,4) NOT NULL,
    "unit" "FoodQuantityUnit" NOT NULL,
    "weight_g" DECIMAL(10,4) NOT NULL,
    "carbohydrates_g" DECIMAL(10,4) NOT NULL,
    "protein_g" DECIMAL(10,4) NOT NULL,
    "fat_g" DECIMAL(10,4) NOT NULL,
    "fiber_g" DECIMAL(10,4) NOT NULL,
    "energy_kcal" DECIMAL(10,4) NOT NULL,
    "food_name_snapshot" TEXT NOT NULL,
    "food_description_snapshot" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "food_consumption_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_serving" (
    "id" SERIAL NOT NULL,
    "food_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "unit" "FoodQuantityUnit" NOT NULL,
    "quantity" DECIMAL(10,4) NOT NULL DEFAULT 1,
    "weight_g" DECIMAL(10,4) NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "food_serving_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "food_consumption_user_id_consumed_at_idx" ON "food_consumption"("user_id", "consumed_at");

-- CreateIndex
CREATE INDEX "food_consumption_item_consumption_id_idx" ON "food_consumption_item"("consumption_id");

-- CreateIndex
CREATE INDEX "food_consumption_item_food_id_idx" ON "food_consumption_item"("food_id");

-- CreateIndex
CREATE INDEX "food_serving_food_id_idx" ON "food_serving"("food_id");

-- AddForeignKey
ALTER TABLE "food_consumption" ADD CONSTRAINT "food_consumption_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_consumption_item" ADD CONSTRAINT "food_consumption_item_consumption_id_fkey" FOREIGN KEY ("consumption_id") REFERENCES "food_consumption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_consumption_item" ADD CONSTRAINT "food_consumption_item_food_id_fkey" FOREIGN KEY ("food_id") REFERENCES "foods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_serving" ADD CONSTRAINT "food_serving_food_id_fkey" FOREIGN KEY ("food_id") REFERENCES "foods"("id") ON DELETE CASCADE ON UPDATE CASCADE;
