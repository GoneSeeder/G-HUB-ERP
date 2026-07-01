-- AlterTable
ALTER TABLE "hr_job_level" ADD COLUMN "description" TEXT NOT NULL DEFAULT '';

-- Backfill description for seeded rows
UPDATE "hr_job_level" SET "description" = 'ประธานเจ้าหน้าที่บริหาร' WHERE "id" = 'JL-CEO';
UPDATE "hr_job_level" SET "description" = 'ผู้อำนวยการ' WHERE "id" = 'JL-E';
UPDATE "hr_job_level" SET "description" = 'ผู้จัดการ' WHERE "id" = 'JL-M';
UPDATE "hr_job_level" SET "description" = 'หัวหน้างาน' WHERE "id" = 'JL-O3';
UPDATE "hr_job_level" SET "description" = 'เจ้าหน้าที่อาวุโส' WHERE "id" = 'JL-O2';
UPDATE "hr_job_level" SET "description" = 'เจ้าหน้าที่' WHERE "id" = 'JL-O1';
UPDATE "hr_job_level" SET "description" = 'พนักงานชั่วคราว' WHERE "id" = 'JL-T';
UPDATE "hr_job_level" SET "description" = 'นักศึกษาฝึกงาน' WHERE "id" = 'JL-P';
