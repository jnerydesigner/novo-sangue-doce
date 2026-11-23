CREATE TABLE "short_links" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "short_links_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "short_links_code_key" ON "short_links"("code");
