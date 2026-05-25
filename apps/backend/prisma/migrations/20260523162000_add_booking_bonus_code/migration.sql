ALTER TABLE "Booking" ADD COLUMN "bonusCode" TEXT NOT NULL DEFAULT '';

CREATE INDEX "Booking_bonusCode_idx" ON "Booking"("bonusCode");

UPDATE "Booking" booking
SET "bonusCode" = bonus."bonus"
FROM "BonusCard" bonus
WHERE booking."bonusCode" = ''
  AND booking."dateBookJw" = bonus."workDate"
  AND booking."partyCode" = bonus."partyCode";
