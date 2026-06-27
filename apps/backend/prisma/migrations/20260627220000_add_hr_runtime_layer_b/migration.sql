-- Layer B runtime tables

CREATE TABLE "hr_shift_assignment" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "shiftId" TEXT,
    "isOff" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "hr_shift_assignment_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "hr_shift_assignment_employeeId_date_key" ON "hr_shift_assignment"("employeeId", "date");
CREATE INDEX "hr_shift_assignment_date_idx" ON "hr_shift_assignment"("date");
CREATE INDEX "hr_shift_assignment_employeeId_idx" ON "hr_shift_assignment"("employeeId");

CREATE TABLE "hr_attendance_record" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "clockIn" TEXT,
    "clockOut" TEXT,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "hr_attendance_record_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "hr_attendance_record_employeeId_date_key" ON "hr_attendance_record"("employeeId", "date");
CREATE INDEX "hr_attendance_record_employeeId_idx" ON "hr_attendance_record"("employeeId");
CREATE INDEX "hr_attendance_record_date_idx" ON "hr_attendance_record"("date");

CREATE TABLE "hr_leave_request" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "leaveTypeId" TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "unitCount" DOUBLE PRECISION NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attachments" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "hr_leave_request_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "hr_leave_request_employeeId_idx" ON "hr_leave_request"("employeeId");
CREATE INDEX "hr_leave_request_status_idx" ON "hr_leave_request"("status");

CREATE TABLE "hr_leave_balance" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "leaveTypeId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "entitled" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "used" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "carriedOver" DOUBLE PRECISION NOT NULL DEFAULT 0,
    CONSTRAINT "hr_leave_balance_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "hr_leave_balance_employeeId_leaveTypeId_year_key" ON "hr_leave_balance"("employeeId", "leaveTypeId", "year");
CREATE INDEX "hr_leave_balance_employeeId_idx" ON "hr_leave_balance"("employeeId");

CREATE TABLE "hr_document_request" (
    "id" TEXT NOT NULL,
    "docType" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "hr_document_request_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "hr_document_request_employeeId_idx" ON "hr_document_request"("employeeId");
CREATE INDEX "hr_document_request_docType_status_idx" ON "hr_document_request"("docType", "status");

CREATE TABLE "hr_approval_instance" (
    "id" TEXT NOT NULL,
    "docType" TEXT NOT NULL,
    "leaveRequestId" TEXT,
    "docRequestId" TEXT,
    "state" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "hr_approval_instance_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "hr_approval_instance_leaveRequestId_key" ON "hr_approval_instance"("leaveRequestId");
CREATE UNIQUE INDEX "hr_approval_instance_docRequestId_key" ON "hr_approval_instance"("docRequestId");
ALTER TABLE "hr_approval_instance" ADD CONSTRAINT "hr_approval_instance_leaveRequestId_fkey"
    FOREIGN KEY ("leaveRequestId") REFERENCES "hr_leave_request"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "hr_approval_instance" ADD CONSTRAINT "hr_approval_instance_docRequestId_fkey"
    FOREIGN KEY ("docRequestId") REFERENCES "hr_document_request"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "hr_approval_step" (
    "id" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "stepOrder" INTEGER NOT NULL,
    "approverId" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'pending',
    "actedAt" TIMESTAMP(3),
    "comment" TEXT,
    CONSTRAINT "hr_approval_step_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "hr_approval_step_instanceId_idx" ON "hr_approval_step"("instanceId");
ALTER TABLE "hr_approval_step" ADD CONSTRAINT "hr_approval_step_instanceId_fkey"
    FOREIGN KEY ("instanceId") REFERENCES "hr_approval_instance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "hr_payroll_run" (
    "id" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "hr_payroll_run_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "hr_payroll_run_periodId_idx" ON "hr_payroll_run"("periodId");

CREATE TABLE "hr_payslip" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "gross" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deductions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "net" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lines" JSONB NOT NULL DEFAULT '[]',
    CONSTRAINT "hr_payslip_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "hr_payslip_runId_employeeId_key" ON "hr_payslip"("runId", "employeeId");
CREATE INDEX "hr_payslip_employeeId_idx" ON "hr_payslip"("employeeId");
ALTER TABLE "hr_payslip" ADD CONSTRAINT "hr_payslip_runId_fkey"
    FOREIGN KEY ("runId") REFERENCES "hr_payroll_run"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
