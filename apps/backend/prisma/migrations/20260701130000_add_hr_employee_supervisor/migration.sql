-- AlterTable (idempotent: a prior incomplete attempt already added this column/index
-- in this environment, but not the FK constraint — guard every step so this migration
-- is safe to (re)run anywhere)
ALTER TABLE "hr_employee" ADD COLUMN IF NOT EXISTS "supervisorId" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "hr_employee_supervisorId_idx" ON "hr_employee"("supervisorId");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'hr_employee_supervisorId_fkey'
  ) THEN
    ALTER TABLE "hr_employee"
      ADD CONSTRAINT "hr_employee_supervisorId_fkey"
      FOREIGN KEY ("supervisorId") REFERENCES "hr_employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
