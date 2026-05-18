CREATE TABLE "AgentMatching" (
    "id" TEXT NOT NULL,
    "agentCodeRef" TEXT NOT NULL,
    "agentNameRef" TEXT NOT NULL DEFAULT '',
    "agentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentMatching_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AgentMatching_agentCodeRef_key" ON "AgentMatching"("agentCodeRef");
CREATE INDEX "AgentMatching_agentId_idx" ON "AgentMatching"("agentId");
CREATE INDEX "AgentMatching_agentNameRef_idx" ON "AgentMatching"("agentNameRef");

ALTER TABLE "AgentMatching" ADD CONSTRAINT "AgentMatching_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
