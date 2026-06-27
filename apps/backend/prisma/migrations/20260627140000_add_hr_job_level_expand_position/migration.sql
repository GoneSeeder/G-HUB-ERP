-- Add hr_job_level table
CREATE TABLE "hr_job_level" (
    "id"     TEXT NOT NULL,
    "nameTh" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "rank"   INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "hr_job_level_pkey" PRIMARY KEY ("id")
);

-- Expand hr_position with rich fields (all nullable / defaulted for safe migration)
ALTER TABLE "hr_position"
  ADD COLUMN "jobLevelId"       TEXT NOT NULL DEFAULT '',
  ADD COLUMN "companyId"        TEXT NOT NULL DEFAULT '',
  ADD COLUMN "employeeTypes"    JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN "salaryMin"        INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "salaryMax"        INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "overview"         TEXT NOT NULL DEFAULT '',
  ADD COLUMN "responsibilities" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "qualifications"   TEXT NOT NULL DEFAULT '',
  ADD COLUMN "hasBenefits"      BOOLEAN NOT NULL DEFAULT false;
