CREATE TABLE "hr_account" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "authSource" TEXT NOT NULL DEFAULT 'hr',
    "accountStatus" TEXT NOT NULL DEFAULT 'pending',
    "membershipStatus" TEXT NOT NULL DEFAULT 'none',
    "hasGhubLink" BOOLEAN NOT NULL DEFAULT false,
    "employeeId" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "hr_account_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "hr_account_email_key" ON "hr_account"("email");
CREATE UNIQUE INDEX "hr_account_employeeId_key" ON "hr_account"("employeeId");

CREATE TABLE "hr_link_code" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "hr_link_code_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "hr_link_code_code_key" ON "hr_link_code"("code");

ALTER TABLE "hr_link_code" ADD CONSTRAINT "hr_link_code_accountId_fkey"
    FOREIGN KEY ("accountId") REFERENCES "hr_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
