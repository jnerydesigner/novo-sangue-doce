-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REVOKED', 'EXPIRED');

-- CreateTable
CREATE TABLE "invites" (
    "id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "email" TEXT,
    "status" "InviteStatus" NOT NULL DEFAULT 'PENDING',
    "sender_id" UUID NOT NULL,
    "accepted_by_id" UUID,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "accepted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invites_token_hash_key" ON "invites"("token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "invites_accepted_by_id_key" ON "invites"("accepted_by_id");

-- CreateIndex
CREATE INDEX "invites_email_status_idx" ON "invites"("email", "status");

-- CreateIndex
CREATE INDEX "invites_expires_at_status_idx" ON "invites"("expires_at", "status");

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_accepted_by_id_fkey" FOREIGN KEY ("accepted_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
