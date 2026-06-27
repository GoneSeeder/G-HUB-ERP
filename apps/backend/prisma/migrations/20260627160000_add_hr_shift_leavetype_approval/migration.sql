-- ── hr_shift ──────────────────────────────────────────────────────────────────
CREATE TABLE "hr_shift" (
  "id"                     TEXT NOT NULL,
  "code"                   TEXT NOT NULL,
  "name"                   TEXT NOT NULL,
  "type"                   TEXT NOT NULL DEFAULT '',
  "time"                   TEXT NOT NULL DEFAULT '',
  "companyScope"           TEXT NOT NULL DEFAULT '',
  "groupKey"               TEXT NOT NULL DEFAULT 'same-day',
  "enabled"                BOOLEAN NOT NULL DEFAULT true,
  "description"            TEXT,
  "timezone"               TEXT,
  "color"                  TEXT,
  "attendanceRule"         TEXT,
  "flexibleEntryEnabled"   BOOLEAN,
  "flexibleMinutes"        INTEGER,
  "minimumWorkHours"       DOUBLE PRECISION,
  "trackBreak"             BOOLEAN,
  "shiftAllowanceEnabled"  BOOLEAN,
  "shiftAllowanceAmount"   DOUBLE PRECISION,
  "prorateShiftAllowance"  BOOLEAN,
  "holidayPremiumEnabled"  BOOLEAN,
  "overtimePremiumEnabled" BOOLEAN,
  "updatedBy"              TEXT,
  "updatedAt"              TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "hr_shift_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "hr_shift_code_key" ON "hr_shift"("code");

-- ── hr_leave_type ─────────────────────────────────────────────────────────────
CREATE TABLE "hr_leave_type" (
  "id"          TEXT NOT NULL,
  "code"        TEXT NOT NULL,
  "nameTh"      TEXT NOT NULL,
  "nameEn"      TEXT NOT NULL DEFAULT '',
  "tag"         TEXT NOT NULL DEFAULT '',
  "color"       TEXT NOT NULL DEFAULT '#6366f1',
  "unit"        TEXT NOT NULL DEFAULT 'day',
  "statutory"   BOOLEAN NOT NULL DEFAULT false,
  "enabled"     BOOLEAN NOT NULL DEFAULT true,
  "rules"       JSONB NOT NULL DEFAULT '{}',
  "eligibility" JSONB NOT NULL DEFAULT '{}',
  "quota"       JSONB NOT NULL DEFAULT '{}',
  "approval"    JSONB NOT NULL DEFAULT '{}',
  CONSTRAINT "hr_leave_type_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "hr_leave_type_code_key" ON "hr_leave_type"("code");

-- ── hr_document_approval_config ───────────────────────────────────────────────
CREATE TABLE "hr_document_approval_config" (
  "docType"   TEXT NOT NULL,
  "labelTh"   TEXT NOT NULL,
  "mechanism" TEXT NOT NULL DEFAULT 'position_structure',
  "steps"     TEXT NOT NULL DEFAULT '1',
  CONSTRAINT "hr_document_approval_config_pkey" PRIMARY KEY ("docType")
);

-- ── hr_person_approver ────────────────────────────────────────────────────────
CREATE TABLE "hr_person_approver" (
  "employeeId" TEXT NOT NULL,
  "approverId" TEXT,
  CONSTRAINT "hr_person_approver_pkey" PRIMARY KEY ("employeeId")
);
