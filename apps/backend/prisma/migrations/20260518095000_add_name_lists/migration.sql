-- CreateTable
CREATE TABLE "NameList" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "partyCode" TEXT NOT NULL DEFAULT '',
    "arriveDate" TIMESTAMP(3),
    "departDate" TIMESTAMP(3),
    "agentCode" TEXT NOT NULL DEFAULT '',
    "agentName" TEXT NOT NULL DEFAULT '',
    "guideCode" TEXT NOT NULL DEFAULT '',
    "guideName" TEXT NOT NULL DEFAULT '',
    "nationCode" TEXT NOT NULL DEFAULT '',
    "nationName" TEXT NOT NULL DEFAULT '',
    "country" TEXT NOT NULL DEFAULT '',
    "province" TEXT NOT NULL DEFAULT '',
    "busCode" TEXT NOT NULL DEFAULT '',
    "pax" INTEGER NOT NULL DEFAULT 0,
    "sourceFile" TEXT NOT NULL DEFAULT '',
    "note" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NameList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NameListItem" (
    "id" TEXT NOT NULL,
    "nameListId" TEXT NOT NULL,
    "itemNo" INTEGER NOT NULL DEFAULT 0,
    "isLeader" BOOLEAN NOT NULL DEFAULT false,
    "agentCode" TEXT NOT NULL DEFAULT '',
    "code" TEXT NOT NULL DEFAULT '',
    "arriveDate" TIMESTAMP(3),
    "passportNo" TEXT NOT NULL DEFAULT '',
    "firstName" TEXT NOT NULL DEFAULT '',
    "lastName" TEXT NOT NULL DEFAULT '',
    "birthDate" TIMESTAMP(3),
    "age" INTEGER,
    "gender" TEXT NOT NULL DEFAULT '',
    "nationCode" TEXT NOT NULL DEFAULT '',
    "province" TEXT NOT NULL DEFAULT '',
    "location" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NameListItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NameList_code_key" ON "NameList"("code");

-- CreateIndex
CREATE INDEX "NameList_arriveDate_idx" ON "NameList"("arriveDate");

-- CreateIndex
CREATE INDEX "NameList_agentCode_idx" ON "NameList"("agentCode");

-- CreateIndex
CREATE INDEX "NameList_partyCode_idx" ON "NameList"("partyCode");

-- CreateIndex
CREATE INDEX "NameList_nationCode_idx" ON "NameList"("nationCode");

-- CreateIndex
CREATE INDEX "NameListItem_nameListId_idx" ON "NameListItem"("nameListId");

-- CreateIndex
CREATE INDEX "NameListItem_passportNo_idx" ON "NameListItem"("passportNo");

-- CreateIndex
CREATE INDEX "NameListItem_code_idx" ON "NameListItem"("code");

-- AddForeignKey
ALTER TABLE "NameListItem" ADD CONSTRAINT "NameListItem_nameListId_fkey" FOREIGN KEY ("nameListId") REFERENCES "NameList"("id") ON DELETE CASCADE ON UPDATE CASCADE;
