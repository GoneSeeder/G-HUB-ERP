-- ── hr_holiday_calendar ───────────────────────────────────────────────────────
CREATE TABLE "hr_holiday_calendar" (
  "id"        TEXT NOT NULL,
  "name"      TEXT NOT NULL,
  "color"     TEXT NOT NULL,
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "hr_holiday_calendar_pkey" PRIMARY KEY ("id")
);

-- ── hr_holiday_entry ──────────────────────────────────────────────────────────
CREATE TABLE "hr_holiday_entry" (
  "id"          TEXT NOT NULL,
  "calendarId"  TEXT NOT NULL,
  "year"        INTEGER NOT NULL,
  "date"        TEXT NOT NULL,
  "title"       TEXT NOT NULL,
  "type"        TEXT NOT NULL DEFAULT 'company',
  "country"     TEXT NOT NULL DEFAULT '',
  "appliesTo"   TEXT NOT NULL DEFAULT '',
  "description" TEXT NOT NULL DEFAULT '',
  "source"      TEXT NOT NULL DEFAULT 'custom',
  CONSTRAINT "hr_holiday_entry_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "hr_holiday_entry_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "hr_holiday_calendar"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "hr_holiday_entry_calendarId_year_idx" ON "hr_holiday_entry"("calendarId", "year");

-- ── hr_holiday_override ───────────────────────────────────────────────────────
CREATE TABLE "hr_holiday_override" (
  "officialId"  TEXT NOT NULL,
  "date"        TEXT,
  "title"       TEXT,
  "description" TEXT,
  "type"        TEXT,
  "deleted"     BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "hr_holiday_override_pkey" PRIMARY KEY ("officialId")
);

-- ── hr_announcement_category ──────────────────────────────────────────────────
CREATE TABLE "hr_announcement_category" (
  "id"     TEXT NOT NULL,
  "nameTh" TEXT NOT NULL,
  "color"  TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "hr_announcement_category_pkey" PRIMARY KEY ("id")
);

-- ── hr_announcement ───────────────────────────────────────────────────────────
CREATE TABLE "hr_announcement" (
  "id"          TEXT NOT NULL,
  "title"       TEXT NOT NULL,
  "bodyMd"      TEXT NOT NULL DEFAULT '',
  "imageBase64" TEXT NOT NULL DEFAULT '',
  "attachments" JSONB NOT NULL DEFAULT '[]',
  "categoryId"  TEXT NOT NULL,
  "audience"    JSONB NOT NULL DEFAULT '{"scope":"all","companyIds":[],"orgNodeIds":[],"employeeTypeIds":[],"employeeIds":[]}',
  "status"      TEXT NOT NULL DEFAULT 'draft',
  "publishAt"   TEXT,
  "publishEnd"  TEXT,
  "pinned"      BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "hr_announcement_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "hr_announcement_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "hr_announcement_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ── hr_employee_defaults ──────────────────────────────────────────────────────
CREATE TABLE "hr_employee_defaults" (
  "id"                    TEXT NOT NULL,
  "codePrefix"            TEXT NOT NULL DEFAULT 'EMP',
  "codePadding"           INTEGER NOT NULL DEFAULT 4,
  "defaultEmployeeTypeId" TEXT NOT NULL DEFAULT 'ET001',
  "defaultStatus"         TEXT NOT NULL DEFAULT 'NORMAL',
  "startDateMode"         TEXT NOT NULL DEFAULT 'today',
  CONSTRAINT "hr_employee_defaults_pkey" PRIMARY KEY ("id")
);

-- ── hr_running_number_config ──────────────────────────────────────────────────
CREATE TABLE "hr_running_number_config" (
  "id"         TEXT NOT NULL,
  "docLabelTh" TEXT NOT NULL,
  "prefix"     TEXT NOT NULL,
  "dateToken"  TEXT NOT NULL DEFAULT 'none',
  "padding"    INTEGER NOT NULL DEFAULT 4,
  "nextNumber" INTEGER NOT NULL DEFAULT 1,
  "active"     BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "hr_running_number_config_pkey" PRIMARY KEY ("id")
);

-- ── hr_master_option ──────────────────────────────────────────────────────────
CREATE TABLE "hr_master_option" (
  "id"       TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "nameTh"   TEXT NOT NULL,
  "nameEn"   TEXT NOT NULL DEFAULT '',
  "active"   BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "hr_master_option_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "hr_master_option_category_idx" ON "hr_master_option"("category");

-- ── hr_payroll_general_config ─────────────────────────────────────────────────
CREATE TABLE "hr_payroll_general_config" (
  "id"                  TEXT NOT NULL,
  "cycleStartDay"       TEXT NOT NULL DEFAULT '1',
  "cycleEndDay"         TEXT NOT NULL DEFAULT 'EOM',
  "ssoEmployeeRate"     DOUBLE PRECISION NOT NULL DEFAULT 5,
  "ssoEmployerRate"     DOUBLE PRECISION NOT NULL DEFAULT 5,
  "ssoMonthlyWageFloor" DOUBLE PRECISION NOT NULL DEFAULT 1650,
  "ssoMonthlyWageCap"   DOUBLE PRECISION NOT NULL DEFAULT 17500,
  "ssoIncludeOT"        BOOLEAN NOT NULL DEFAULT true,
  "ssoIncludeBonus"     BOOLEAN NOT NULL DEFAULT true,
  "ssoIncludeWelfare"   BOOLEAN NOT NULL DEFAULT true,
  "currency"            TEXT NOT NULL DEFAULT 'THB',
  "moneyRounding"       TEXT NOT NULL DEFAULT 'nearest-baht',
  "preventWrongOtType"  BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "hr_payroll_general_config_pkey" PRIMARY KEY ("id")
);

-- ── hr_payroll_employment_type ────────────────────────────────────────────────
CREATE TABLE "hr_payroll_employment_type" (
  "id"                TEXT NOT NULL,
  "code"              TEXT NOT NULL,
  "nameTh"            TEXT NOT NULL,
  "nameEn"            TEXT NOT NULL DEFAULT '',
  "payType"           TEXT NOT NULL,
  "paidPublicHoliday" BOOLEAN NOT NULL DEFAULT true,
  "paidHourly"        BOOLEAN NOT NULL DEFAULT false,
  "calcConditions"    JSONB NOT NULL DEFAULT '[]',
  "employeeTypeId"    TEXT,
  "active"            BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "hr_payroll_employment_type_pkey" PRIMARY KEY ("id")
);

-- ── hr_pay_item ───────────────────────────────────────────────────────────────
CREATE TABLE "hr_pay_item" (
  "id"                   TEXT NOT NULL,
  "kind"                 TEXT NOT NULL,
  "code"                 TEXT NOT NULL,
  "nameTh"               TEXT NOT NULL,
  "nameEn"               TEXT NOT NULL DEFAULT '',
  "revenueCategory"      TEXT,
  "rounding"             TEXT NOT NULL DEFAULT 'none',
  "taxCalcMethod"        TEXT,
  "payoutScope"          TEXT NOT NULL DEFAULT 'every-period',
  "taxable"              BOOLEAN NOT NULL DEFAULT false,
  "linkSSO"              BOOLEAN NOT NULL DEFAULT false,
  "linkProvidentFund"    BOOLEAN NOT NULL DEFAULT false,
  "offCycle"             BOOLEAN NOT NULL DEFAULT false,
  "carryPrevPeriod"      BOOLEAN NOT NULL DEFAULT false,
  "payOnce"              BOOLEAN,
  "payoutScopeOnce"      BOOLEAN,
  "calcByActualWorkdays" BOOLEAN,
  "linkOvertime"         BOOLEAN,
  "linkLateAbsent"       BOOLEAN,
  "isWelfare"            BOOLEAN NOT NULL DEFAULT false,
  "enabled"              BOOLEAN NOT NULL DEFAULT true,
  "isSystem"             BOOLEAN NOT NULL DEFAULT false,
  "isCustom"             BOOLEAN NOT NULL DEFAULT false,
  "accountMapping"       JSONB NOT NULL DEFAULT '{}',
  CONSTRAINT "hr_pay_item_pkey" PRIMARY KEY ("id")
);

-- ── hr_account_category ───────────────────────────────────────────────────────
CREATE TABLE "hr_account_category" (
  "id"        TEXT NOT NULL,
  "nameTh"    TEXT NOT NULL,
  "enabled"   BOOLEAN NOT NULL DEFAULT true,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "hr_account_category_pkey" PRIMARY KEY ("id")
);

-- ── hr_pay_period_config ──────────────────────────────────────────────────────
CREATE TABLE "hr_pay_period_config" (
  "id"                 TEXT NOT NULL,
  "year"               INTEGER NOT NULL,
  "frequency"          TEXT NOT NULL DEFAULT 'monthly',
  "firstPeriodStart"   TEXT NOT NULL,
  "payDayOfMonth"      TEXT NOT NULL DEFAULT 'EOM',
  "payNextMonth"       BOOLEAN NOT NULL DEFAULT false,
  "payBeforeIfHoliday" BOOLEAN NOT NULL DEFAULT false,
  "hasOffCycle"        BOOLEAN NOT NULL DEFAULT false,
  "offCycleStart"      TEXT,
  "employmentTypeIds"  JSONB NOT NULL DEFAULT '[]',
  CONSTRAINT "hr_pay_period_config_pkey" PRIMARY KEY ("id")
);

-- ── hr_generated_period ───────────────────────────────────────────────────────
CREATE TABLE "hr_generated_period" (
  "id"          TEXT NOT NULL,
  "configId"    TEXT NOT NULL,
  "index"       INTEGER NOT NULL,
  "label"       TEXT NOT NULL,
  "periodStart" TEXT NOT NULL,
  "periodEnd"   TEXT NOT NULL,
  "payDate"     TEXT NOT NULL,
  CONSTRAINT "hr_generated_period_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "hr_generated_period_configId_fkey" FOREIGN KEY ("configId") REFERENCES "hr_pay_period_config"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
