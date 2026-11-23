CREATE TABLE "short_link_locations" (
  "id" UUID NOT NULL,
  "short_link_id" UUID NOT NULL,
  "country" TEXT NOT NULL,
  "region" TEXT NOT NULL DEFAULT '',
  "visits" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "short_link_locations_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "short_link_locations_short_link_id_fkey" FOREIGN KEY ("short_link_id") REFERENCES "short_links"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "short_link_locations_short_link_id_country_region_key" ON "short_link_locations"("short_link_id", "country", "region");
