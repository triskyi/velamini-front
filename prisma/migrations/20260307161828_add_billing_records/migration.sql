-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "billingEmail" TEXT,
ADD COLUMN     "planRenewalDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "BillingRecord" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "amountRWF" INTEGER NOT NULL,
    "txRef" TEXT NOT NULL,
    "flwRef" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BillingRecord_txRef_key" ON "BillingRecord"("txRef");

-- CreateIndex
CREATE INDEX "BillingRecord_organizationId_idx" ON "BillingRecord"("organizationId");

-- CreateIndex
CREATE INDEX "BillingRecord_txRef_idx" ON "BillingRecord"("txRef");

-- AddForeignKey
ALTER TABLE "BillingRecord" ADD CONSTRAINT "BillingRecord_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
