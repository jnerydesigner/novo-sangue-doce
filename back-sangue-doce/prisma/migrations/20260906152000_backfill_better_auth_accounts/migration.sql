-- Backfill Better Auth credential accounts for existing local users.
--
-- Better Auth signs in with:
--   providerId = 'credential'
--   accountId  = user.id
--
-- The password hash stays in the current scrypt format and is verified by
-- src/auth/better-auth/password-hash.ts.
INSERT INTO "account" (
    "id",
    "accountId",
    "providerId",
    "userId",
    "password",
    "createdAt",
    "updatedAt"
)
SELECT
    CONCAT("users"."id"::text, ':credential'),
    "users"."id"::text,
    'credential',
    "users"."id",
    "users"."password_hash",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "users"
WHERE "users"."password_hash" IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM "account"
      WHERE "account"."userId" = "users"."id"
        AND "account"."providerId" = 'credential'
        AND "account"."accountId" = "users"."id"::text
  );
