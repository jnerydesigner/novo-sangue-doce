-- AlterTable
ALTER TABLE "carb_analyses" ADD COLUMN "queue_job_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "carb_analyses_queue_job_id_key" ON "carb_analyses"("queue_job_id");
