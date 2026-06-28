-- Keep the newest image row per post before adding the unique constraint.
DELETE FROM "post_images" old_image
USING "post_images" newest_image
WHERE old_image."post_id" = newest_image."post_id"
  AND (
    old_image."updated_at" < newest_image."updated_at"
    OR (
      old_image."updated_at" = newest_image."updated_at"
      AND old_image."id"::text < newest_image."id"::text
    )
  );

CREATE UNIQUE INDEX IF NOT EXISTS "post_images_post_id_key" ON "post_images"("post_id");

ALTER TABLE "post_images" DROP CONSTRAINT IF EXISTS "post_images_post_id_fkey";

ALTER TABLE "post_images"
ADD CONSTRAINT "post_images_post_id_fkey"
FOREIGN KEY ("post_id") REFERENCES "posts"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
