CREATE TABLE "Booking" (
  "id" TEXT NOT NULL,
  "importKey" TEXT NOT NULL,
  "docDate" TIMESTAMP(3) NOT NULL,
  "docTime" TEXT NOT NULL DEFAULT '',
  "agentCode" TEXT NOT NULL DEFAULT '',
  "agentName" TEXT NOT NULL DEFAULT '',
  "partyCode" TEXT NOT NULL DEFAULT '',
  "nation" TEXT NOT NULL DEFAULT '',
  "arriveDate" TIMESTAMP(3),
  "departDate" TIMESTAMP(3),
  "guideCode" TEXT NOT NULL DEFAULT '',
  "guideName" TEXT NOT NULL DEFAULT '',
  "telGuide" TEXT NOT NULL DEFAULT '',
  "telDriver" TEXT NOT NULL DEFAULT '',
  "pax" INTEGER NOT NULL DEFAULT 0,
  "carCode" TEXT NOT NULL DEFAULT '',
  "shop" TEXT NOT NULL DEFAULT '',
  "bookRemark" TEXT NOT NULL DEFAULT '',
  "dateBookJw" TIMESTAMP(3),
  "timeBookJw" TEXT NOT NULL DEFAULT '',
  "ptyStartDate" TIMESTAMP(3),
  "ptyEndDate" TIMESTAMP(3),
  "faxNo" TEXT NOT NULL DEFAULT '',
  "agentCodeRef" TEXT NOT NULL DEFAULT '',
  "partyCodeRef" TEXT NOT NULL DEFAULT '',
  "status" BOOLEAN NOT NULL DEFAULT false,
  "upload" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BookingReference" (
  "id" TEXT NOT NULL,
  "bookingId" TEXT NOT NULL,
  "orderDate" TIMESTAMP(3),
  "faxNo" TEXT NOT NULL DEFAULT '',
  "agentCode" TEXT NOT NULL DEFAULT '',
  "code" TEXT NOT NULL DEFAULT '',
  "place" TEXT NOT NULL DEFAULT '',
  "startDate" TIMESTAMP(3),
  "endDate" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BookingReference_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Booking_importKey_key" ON "Booking"("importKey");
CREATE INDEX "Booking_docDate_idx" ON "Booking"("docDate");
CREATE INDEX "Booking_agentCode_idx" ON "Booking"("agentCode");
CREATE INDEX "Booking_nation_idx" ON "Booking"("nation");
CREATE INDEX "Booking_status_idx" ON "Booking"("status");
CREATE INDEX "Booking_upload_idx" ON "Booking"("upload");
CREATE INDEX "BookingReference_bookingId_idx" ON "BookingReference"("bookingId");
CREATE INDEX "BookingReference_faxNo_idx" ON "BookingReference"("faxNo");

ALTER TABLE "BookingReference"
  ADD CONSTRAINT "BookingReference_bookingId_fkey"
  FOREIGN KEY ("bookingId") REFERENCES "Booking"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
