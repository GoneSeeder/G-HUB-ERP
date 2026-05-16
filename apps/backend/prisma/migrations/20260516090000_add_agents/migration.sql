CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "agentCode" TEXT NOT NULL,
    "codeCenter" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',
    "nation" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "fax" TEXT NOT NULL DEFAULT '',
    "contactPerson" TEXT NOT NULL DEFAULT '',
    "marketing" TEXT NOT NULL DEFAULT '',
    "agentHO" TEXT NOT NULL DEFAULT '',
    "typeCenter" TEXT NOT NULL DEFAULT '',
    "agentType" TEXT NOT NULL DEFAULT 'AGENT',
    "typeGroup" TEXT NOT NULL DEFAULT '',
    "navCode" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "taxId" TEXT NOT NULL DEFAULT '',
    "branch" TEXT NOT NULL DEFAULT '',
    "bankName" TEXT NOT NULL DEFAULT '',
    "bankBranch" TEXT NOT NULL DEFAULT '',
    "bankAccount" TEXT NOT NULL DEFAULT '',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AgentAlias" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "pattern" TEXT NOT NULL,
    "matchType" TEXT NOT NULL DEFAULT 'contains',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentAlias_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Booking" ADD COLUMN "agentId" TEXT;

CREATE UNIQUE INDEX "Agent_agentCode_key" ON "Agent"("agentCode");
CREATE INDEX "Agent_name_idx" ON "Agent"("name");
CREATE INDEX "Agent_nation_idx" ON "Agent"("nation");
CREATE INDEX "Agent_active_idx" ON "Agent"("active");
CREATE INDEX "Agent_typeGroup_idx" ON "Agent"("typeGroup");
CREATE INDEX "AgentAlias_pattern_idx" ON "AgentAlias"("pattern");
CREATE UNIQUE INDEX "AgentAlias_agentId_pattern_matchType_key" ON "AgentAlias"("agentId", "pattern", "matchType");
CREATE INDEX "Booking_agentId_idx" ON "Booking"("agentId");

ALTER TABLE "AgentAlias" ADD CONSTRAINT "AgentAlias_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
