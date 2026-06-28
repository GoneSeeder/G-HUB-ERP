UPDATE "hr_position"
SET "jobLevelId" = CASE "jobLevelId"
  WHEN 'JL-EXEC' THEN 'JL-E'
  WHEN 'JL-MGR' THEN 'JL-M'
  WHEN 'JL-SUP' THEN 'JL-O3'
  WHEN 'JL-STF' THEN 'JL-O1'
  ELSE "jobLevelId"
END
WHERE "jobLevelId" IN ('JL-EXEC', 'JL-MGR', 'JL-SUP', 'JL-STF');

DELETE FROM "hr_job_level"
WHERE "id" IN ('JL-EXEC', 'JL-MGR', 'JL-SUP', 'JL-STF');

INSERT INTO "hr_job_level" ("id", "nameTh", "nameEn", "rank", "active")
VALUES
  ('JL-CEO', 'CEO', 'CEO', 1, true),
  ('JL-E', 'E', 'E', 2, true),
  ('JL-M', 'M', 'M', 3, true),
  ('JL-O3', 'O3', 'O3', 4, true),
  ('JL-O2', 'O2', 'O2', 5, true),
  ('JL-O1', 'O1', 'O1', 6, true),
  ('JL-T', 'T', 'T', 7, true),
  ('JL-P', 'P', 'P', 8, true)
ON CONFLICT ("id") DO UPDATE SET
  "nameTh" = EXCLUDED."nameTh",
  "nameEn" = EXCLUDED."nameEn",
  "rank" = EXCLUDED."rank",
  "active" = true;
