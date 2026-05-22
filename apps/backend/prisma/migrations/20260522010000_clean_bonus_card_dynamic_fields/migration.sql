ALTER TABLE "BonusCard"
  ADD COLUMN IF NOT EXISTS "student" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "companyCode" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "memberCode" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "supervisorCode" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "province" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "charterCode" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "extraGuides" JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "narratorGroup" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "narratorPax" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "narrators" JSONB NOT NULL DEFAULT '[]'::jsonb;

UPDATE "BonusCard"
SET "extraGuides" = COALESCE(
  (
    SELECT jsonb_agg(guide_row)
    FROM (
      SELECT jsonb_build_object(
        'code', "guide2",
        'name', "guide2Name",
        'phone', "guide2Phone"
      ) AS guide_row
      WHERE COALESCE("guide2", '') <> ''
         OR COALESCE("guide2Name", '') <> ''
         OR COALESCE("guide2Phone", '') <> ''
      UNION ALL
      SELECT jsonb_build_object(
        'code', "guide3",
        'name', "guide3Name",
        'phone', "guide3Phone"
      ) AS guide_row
      WHERE COALESCE("guide3", '') <> ''
         OR COALESCE("guide3Name", '') <> ''
         OR COALESCE("guide3Phone", '') <> ''
    ) guide_rows
  ),
  '[]'::jsonb
)
WHERE "extraGuides" = '[]'::jsonb;

UPDATE "BonusCard"
SET "narrators" = COALESCE(
  (
    SELECT jsonb_agg(narrator_row)
    FROM (
      SELECT jsonb_build_object(
        'code', "narratorCode",
        'name', "narratorName"
      ) AS narrator_row
      WHERE COALESCE("narratorCode", '') <> ''
         OR COALESCE("narratorName", '') <> ''
    ) narrator_rows
  ),
  '[]'::jsonb
)
WHERE "narrators" = '[]'::jsonb;

ALTER TABLE "BonusCard"
  DROP COLUMN IF EXISTS "guide2",
  DROP COLUMN IF EXISTS "guide2Name",
  DROP COLUMN IF EXISTS "guide2Phone",
  DROP COLUMN IF EXISTS "guide3",
  DROP COLUMN IF EXISTS "guide3Name",
  DROP COLUMN IF EXISTS "guide3Phone",
  DROP COLUMN IF EXISTS "guide4",
  DROP COLUMN IF EXISTS "guide4Name",
  DROP COLUMN IF EXISTS "guide4Phone",
  DROP COLUMN IF EXISTS "guide5",
  DROP COLUMN IF EXISTS "guide5Name",
  DROP COLUMN IF EXISTS "guide5Phone",
  DROP COLUMN IF EXISTS "guide6",
  DROP COLUMN IF EXISTS "guide6Name",
  DROP COLUMN IF EXISTS "guide6Phone",
  DROP COLUMN IF EXISTS "narratorCode",
  DROP COLUMN IF EXISTS "narratorName",
  DROP COLUMN IF EXISTS "narratorPhone",
  DROP COLUMN IF EXISTS "narratorCode2",
  DROP COLUMN IF EXISTS "narratorName2",
  DROP COLUMN IF EXISTS "narratorPhone2",
  DROP COLUMN IF EXISTS "narratorRoom",
  DROP COLUMN IF EXISTS "narratorRoom2",
  DROP COLUMN IF EXISTS "narratorAdult",
  DROP COLUMN IF EXISTS "narratorChild";
