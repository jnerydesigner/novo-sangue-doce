CREATE TABLE "page_visit_daily" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "page_path" TEXT NOT NULL,
    "visited_on" DATE NOT NULL,
    "total_visits" INTEGER NOT NULL DEFAULT 0,
    "unique_visitors" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_visit_daily_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "page_visitor_daily" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "page_path" TEXT NOT NULL,
    "visited_on" DATE NOT NULL,
    "ip_hash" TEXT NOT NULL,
    "user_agent_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_visitor_daily_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "page_visit_daily_page_path_visited_on_key"
ON "page_visit_daily"("page_path", "visited_on");

CREATE INDEX "page_visit_daily_visited_on_idx"
ON "page_visit_daily"("visited_on");

CREATE UNIQUE INDEX "page_visitor_daily_page_path_visited_on_ip_hash_key"
ON "page_visitor_daily"("page_path", "visited_on", "ip_hash");

CREATE INDEX "page_visitor_daily_visited_on_idx"
ON "page_visitor_daily"("visited_on");
