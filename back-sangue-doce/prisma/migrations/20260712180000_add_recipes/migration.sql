CREATE TYPE "RecipeDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

CREATE TABLE "recipes" (
    "id" UUID NOT NULL,
    "post_id" UUID NOT NULL,
    "prep_minutes" INTEGER NOT NULL,
    "cook_minutes" INTEGER NOT NULL DEFAULT 0,
    "servings" INTEGER NOT NULL,
    "serving_size" TEXT,
    "difficulty" "RecipeDifficulty" NOT NULL DEFAULT 'EASY',
    "ingredients" JSONB NOT NULL,
    "instructions" JSONB NOT NULL,
    "calories_kcal" DECIMAL(8,2),
    "carbohydrates_grams" DECIMAL(8,2),
    "fiber_grams" DECIMAL(8,2),
    "protein_grams" DECIMAL(8,2),
    "fat_grams" DECIMAL(8,2),
    "sodium_mg" DECIMAL(8,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recipes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "recipes_post_id_key" ON "recipes"("post_id");
CREATE INDEX "recipes_difficulty_idx" ON "recipes"("difficulty");

ALTER TABLE "recipes"
ADD CONSTRAINT "recipes_post_id_fkey"
FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
