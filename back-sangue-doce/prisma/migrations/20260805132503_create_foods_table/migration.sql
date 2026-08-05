-- CreateTable
CREATE TABLE "taco_categories" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "taco_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "taco_foods" (
    "id" SERIAL NOT NULL,
    "food_id" INTEGER NOT NULL,
    "food_number" INTEGER NOT NULL,
    "page" INTEGER,
    "description" TEXT NOT NULL,
    "category_id" INTEGER NOT NULL,
    "moisture_percent" DECIMAL(10,4),
    "energy_kcal" DECIMAL(10,4),
    "energy_kj" DECIMAL(10,4),
    "protein_g" DECIMAL(10,4),
    "fat_g" DECIMAL(10,4),
    "cholesterol_mg" DECIMAL(10,4),
    "carbohydrates_g" DECIMAL(10,4),
    "fiber_g" DECIMAL(10,4),
    "ash_g" DECIMAL(10,4),
    "calcium_mg" DECIMAL(10,4),
    "magnesium_mg" DECIMAL(10,4),
    "manganese_mg" DECIMAL(10,4),
    "phosphorus_mg" DECIMAL(10,4),
    "iron_mg" DECIMAL(10,4),
    "sodium_mg" DECIMAL(10,4),
    "potassium_mg" DECIMAL(10,4),
    "copper_mg" DECIMAL(10,4),
    "zinc_mg" DECIMAL(10,4),
    "retinol_mcg" DECIMAL(10,4),
    "vitamin_a_re_mcg" DECIMAL(10,4),
    "vitamin_a_rae_mcg" DECIMAL(10,4),
    "thiamine_mg" DECIMAL(10,4),
    "riboflavin_mg" DECIMAL(10,4),
    "pyridoxine_mg" DECIMAL(10,4),
    "niacin_mg" DECIMAL(10,4),
    "vitamin_c_mg" DECIMAL(10,4),

    CONSTRAINT "taco_foods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "foods_category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "foods_id" INTEGER,

    CONSTRAINT "foods_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "foods" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "moisture_percent" DECIMAL(10,4),
    "energy_kcal" DECIMAL(10,4),
    "energy_kj" DECIMAL(10,4),
    "protein_g" DECIMAL(10,4),
    "fat_g" DECIMAL(10,4),
    "cholesterol_mg" DECIMAL(10,4),
    "carbohydrates_g" DECIMAL(10,4),
    "fiber_g" DECIMAL(10,4),
    "ash_g" DECIMAL(10,4),
    "calcium_mg" DECIMAL(10,4),
    "magnesium_mg" DECIMAL(10,4),
    "manganese_mg" DECIMAL(10,4),
    "phosphorus_mg" DECIMAL(10,4),
    "iron_mg" DECIMAL(10,4),
    "sodium_mg" DECIMAL(10,4),
    "potassium_mg" DECIMAL(10,4),
    "copper_mg" DECIMAL(10,4),
    "zinc_mg" DECIMAL(10,4),
    "retinol_mcg" DECIMAL(10,4),
    "thiamine_mg" DECIMAL(10,4),
    "riboflavin_mg" DECIMAL(10,4),
    "pyridoxine_mg" DECIMAL(10,4),
    "niacin_mg" DECIMAL(10,4),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "foods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "taco_categories_slug_key" ON "taco_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "taco_foods_food_id_key" ON "taco_foods"("food_id");

-- CreateIndex
CREATE UNIQUE INDEX "taco_foods_food_number_key" ON "taco_foods"("food_number");

-- CreateIndex
CREATE INDEX "taco_foods_description_idx" ON "taco_foods"("description");

-- CreateIndex
CREATE INDEX "taco_foods_category_id_idx" ON "taco_foods"("category_id");

-- CreateIndex
CREATE INDEX "foods_category_name_idx" ON "foods_category"("name");

-- CreateIndex
CREATE INDEX "foods_description_name_idx" ON "foods"("description", "name");

-- AddForeignKey
ALTER TABLE "taco_foods" ADD CONSTRAINT "taco_foods_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "taco_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "foods_category" ADD CONSTRAINT "foods_category_foods_id_fkey" FOREIGN KEY ("foods_id") REFERENCES "foods"("id") ON DELETE SET NULL ON UPDATE CASCADE;
