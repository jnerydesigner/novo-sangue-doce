-- CreateEnum
CREATE TYPE "DiabetesType" AS ENUM ('TYPE_1', 'TYPE_2', 'GESTATIONAL', 'OTHER', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "ReadingContext" AS ENUM ('FASTING', 'BEFORE_MEAL', 'AFTER_MEAL', 'BEDTIME', 'EXERCISE', 'MANUAL', 'RANDOM');

-- CreateEnum
CREATE TYPE "MeasurementSource" AS ENUM ('MANUAL', 'SENSOR', 'IMPORT');

-- CreateEnum
CREATE TYPE "MeasurementNoteType" AS ENUM ('FASTING_WAKE_UP', 'BEFORE_BREAKFAST', 'AFTER_BREAKFAST', 'MORNING_RANDOM_CHECK', 'BEFORE_LUNCH', 'AFTER_LUNCH', 'AFTERNOON_RANDOM_CHECK', 'BEFORE_DINNER', 'AFTER_DINNER', 'BEFORE_SLEEP', 'NIGHT_RANDOM_CHECK', 'BEFORE_EXERCISE', 'AFTER_EXERCISE', 'FEELING_UNWELL', 'ROUTINE_CHECK', 'DAWN_RANDOM_CHECK');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "birth_date" TIMESTAMP(3),
    "diabetes_type" "DiabetesType" NOT NULL DEFAULT 'UNKNOWN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "measurements" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "measured_at" TIMESTAMP(3) NOT NULL,
    "glucose_value_mg_dl" INTEGER NOT NULL,
    "reading_context" "ReadingContext" NOT NULL DEFAULT 'MANUAL',
    "source" "MeasurementSource" NOT NULL DEFAULT 'MANUAL',
    "note_type" "MeasurementNoteType",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "measurements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "measurements_user_id_measured_at_idx" ON "measurements"("user_id", "measured_at" DESC);

-- AddForeignKey
ALTER TABLE "measurements" ADD CONSTRAINT "measurements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
