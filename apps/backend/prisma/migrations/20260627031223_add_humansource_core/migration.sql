-- CreateTable
CREATE TABLE "hr_org_node" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "code" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "parentId" TEXT,

    CONSTRAINT "hr_org_node_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_company" (
    "id" TEXT NOT NULL,
    "orgNodeId" TEXT NOT NULL,
    "legalNameTh" TEXT NOT NULL,
    "tradeName" TEXT NOT NULL,
    "taxId" TEXT NOT NULL,
    "socialSecurityCode" TEXT NOT NULL,
    "address" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "workConditions" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "hr_company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_position" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nameTh" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "hr_position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_employee_type" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nameTh" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "tax" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "hr_employee_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_employee" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "empType" TEXT NOT NULL,
    "schedule" TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "salary" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "companyId" TEXT NOT NULL,
    "branchNodeId" TEXT NOT NULL,
    "departmentNodeId" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    "employeeTypeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr_employee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hr_company_orgNodeId_key" ON "hr_company"("orgNodeId");

-- CreateIndex
CREATE UNIQUE INDEX "hr_employee_code_key" ON "hr_employee"("code");

-- CreateIndex
CREATE INDEX "hr_employee_branchNodeId_idx" ON "hr_employee"("branchNodeId");

-- CreateIndex
CREATE INDEX "hr_employee_departmentNodeId_idx" ON "hr_employee"("departmentNodeId");

-- AddForeignKey
ALTER TABLE "hr_org_node" ADD CONSTRAINT "hr_org_node_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "hr_org_node"("id") ON DELETE SET NULL ON UPDATE CASCADE;
