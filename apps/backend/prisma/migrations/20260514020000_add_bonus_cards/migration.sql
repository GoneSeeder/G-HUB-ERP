CREATE TABLE "BonusCard" (
    "id" TEXT NOT NULL,
    "workDate" TIMESTAMP(3) NOT NULL,
    "bonus" TEXT NOT NULL,
    "bonusName" TEXT NOT NULL,
    "agentCode" TEXT NOT NULL,
    "agentName" TEXT NOT NULL,
    "guide" TEXT NOT NULL,
    "guideName" TEXT NOT NULL,
    "partyCode" TEXT NOT NULL,
    "nation" TEXT NOT NULL DEFAULT 'CN',
    "adult" INTEGER NOT NULL DEFAULT 0,
    "child" INTEGER NOT NULL DEFAULT 0,
    "tourLeader" INTEGER NOT NULL DEFAULT 0,
    "carCode" TEXT NOT NULL DEFAULT '',
    "shop" TEXT NOT NULL DEFAULT '',
    "hotel" TEXT NOT NULL DEFAULT '',
    "comeFrom" TEXT NOT NULL DEFAULT '',
    "busType" TEXT NOT NULL DEFAULT '',
    "tourIn" TEXT NOT NULL DEFAULT '',
    "tourOut" TEXT NOT NULL DEFAULT '',
    "comment" TEXT NOT NULL DEFAULT '',
    "imageDataUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BonusCard_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BonusCard_workDate_idx" ON "BonusCard"("workDate");
