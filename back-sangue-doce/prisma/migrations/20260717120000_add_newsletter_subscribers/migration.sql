CREATE TYPE "NewsletterSubscriberStatus" AS ENUM ('PENDING', 'CONFIRMED', 'UNSUBSCRIBED', 'BOUNCED', 'BLOCKED');

CREATE TABLE "newsletter_subscribers" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "normalizedEmail" TEXT NOT NULL,
    "name" TEXT,
    "status" "NewsletterSubscriberStatus" NOT NULL DEFAULT 'PENDING',
    "confirmationHash" TEXT,
    "confirmationExpiry" TIMESTAMP(3),
    "unsubscribeHash" TEXT,
    "source" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "unsubscribedAt" TIMESTAMP(3),
    "bouncedAt" TIMESTAMP(3),
    "blockedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "newsletter_subscribers_email_key" ON "newsletter_subscribers"("email");
CREATE UNIQUE INDEX "newsletter_subscribers_normalizedEmail_key" ON "newsletter_subscribers"("normalizedEmail");
CREATE INDEX "newsletter_subscribers_status_idx" ON "newsletter_subscribers"("status");
CREATE INDEX "newsletter_subscribers_createdAt_idx" ON "newsletter_subscribers"("createdAt");
