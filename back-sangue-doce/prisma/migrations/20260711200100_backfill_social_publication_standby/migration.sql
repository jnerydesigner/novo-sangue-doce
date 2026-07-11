UPDATE "social_publications" AS older
SET "status" = 'STANDBY'
WHERE older."status" = 'COMPLETED'
  AND EXISTS (
    SELECT 1
    FROM "social_publications" AS newer
    WHERE newer."postId" = older."postId"
      AND newer."status" = 'COMPLETED'
      AND newer."created_at" > older."created_at"
  );
