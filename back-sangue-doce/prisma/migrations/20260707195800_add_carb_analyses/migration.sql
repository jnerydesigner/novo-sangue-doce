-- CreateTable
CREATE TABLE "carb_analyses" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "image_url" TEXT,
    "result" JSONB NOT NULL,
    "estimated_glucose" INTEGER,
    "total_carbs_grams" INTEGER,
    "confidence" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carb_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "carb_analyses_user_id_created_at_idx" ON "carb_analyses"("user_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "carb_analyses" ADD CONSTRAINT "carb_analyses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
