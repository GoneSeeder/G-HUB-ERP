CREATE TABLE "hr_json_store" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL DEFAULT '{}',
    CONSTRAINT "hr_json_store_pkey" PRIMARY KEY ("key")
);
