-- Bootstrap the independent recipe domain with the editorial profiles and
-- taxonomy that already exist. Future changes remain independent because
-- these are copies, not foreign keys to post tables.

INSERT INTO "recipe_authors" (
  "id",
  "name",
  "slug",
  "role",
  "bio",
  "email",
  "user_id",
  "created_at",
  "updated_at"
)
SELECT
  gen_random_uuid(),
  pa."name",
  pa."slug",
  pa."role",
  pa."bio",
  pa."email",
  pa."user_id",
  NOW(),
  NOW()
FROM "post_authors" pa
WHERE NOT EXISTS (
  SELECT 1 FROM "recipe_authors" ra
  WHERE ra."slug" = pa."slug" OR ra."user_id" = pa."user_id"
);

INSERT INTO "recipe_categories" (
  "id",
  "name",
  "slug",
  "color",
  "created_at",
  "updated_at"
)
SELECT
  gen_random_uuid(),
  pc."name",
  pc."slug",
  pc."color",
  NOW(),
  NOW()
FROM "post_categories" pc
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "recipe_tags" (
  "id",
  "name",
  "slug",
  "created_at",
  "updated_at"
)
SELECT
  gen_random_uuid(),
  pt."name",
  pt."slug",
  NOW(),
  NOW()
FROM "post_tags" pt
ON CONFLICT ("slug") DO NOTHING;
