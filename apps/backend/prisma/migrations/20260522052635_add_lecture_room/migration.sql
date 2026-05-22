-- DropIndex
DROP INDEX "BonusCard_workDate_idx";

-- CreateTable
CREATE TABLE "LectureRoom" (
    "id" TEXT NOT NULL,
    "roomCode" TEXT NOT NULL,
    "roomName" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LectureRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Speaker" (
    "id" TEXT NOT NULL,
    "speakerCode" TEXT NOT NULL,
    "speakerName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Speaker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LectureSession" (
    "id" TEXT NOT NULL,
    "partyCode" TEXT NOT NULL,
    "bonusCardId" TEXT,
    "roomId" TEXT NOT NULL,
    "roomCode" TEXT NOT NULL,
    "roomName" TEXT NOT NULL,
    "speakerId" TEXT NOT NULL,
    "speakerCode" TEXT NOT NULL,
    "speakerName" TEXT NOT NULL,
    "attendeeCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'arriving',
    "startedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LectureSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LectureHistory" (
    "id" TEXT NOT NULL,
    "partyCode" TEXT NOT NULL,
    "bonusCardId" TEXT,
    "roomId" TEXT NOT NULL,
    "roomCode" TEXT NOT NULL,
    "roomName" TEXT NOT NULL,
    "speakerId" TEXT NOT NULL,
    "speakerCode" TEXT NOT NULL,
    "speakerName" TEXT NOT NULL,
    "attendeeCount" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3) NOT NULL,
    "durationSeconds" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LectureHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LectureRoom_roomCode_key" ON "LectureRoom"("roomCode");

-- CreateIndex
CREATE UNIQUE INDEX "Speaker_speakerCode_key" ON "Speaker"("speakerCode");

-- CreateIndex
CREATE UNIQUE INDEX "LectureSession_roomId_key" ON "LectureSession"("roomId");

-- AddForeignKey
ALTER TABLE "LectureSession" ADD CONSTRAINT "LectureSession_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "LectureRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LectureSession" ADD CONSTRAINT "LectureSession_speakerId_fkey" FOREIGN KEY ("speakerId") REFERENCES "Speaker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LectureSession" ADD CONSTRAINT "LectureSession_bonusCardId_fkey" FOREIGN KEY ("bonusCardId") REFERENCES "BonusCard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LectureHistory" ADD CONSTRAINT "LectureHistory_bonusCardId_fkey" FOREIGN KEY ("bonusCardId") REFERENCES "BonusCard"("id") ON DELETE SET NULL ON UPDATE CASCADE;
