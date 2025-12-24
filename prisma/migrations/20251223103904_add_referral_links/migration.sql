-- CreateEnum
CREATE TYPE "RegistrationSource" AS ENUM ('NORMAL', 'REFERRAL');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "referrerId" TEXT,
ADD COLUMN     "registrationSource" "RegistrationSource" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "trialDaysGranted" INTEGER;

-- CreateTable
CREATE TABLE "ReferralLink" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "displayName" TEXT,
    "trialDays" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdByUserId" TEXT,

    CONSTRAINT "ReferralLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReferralLink_slug_key" ON "ReferralLink"("slug");

-- CreateIndex
CREATE INDEX "ReferralLink_slug_idx" ON "ReferralLink"("slug");

-- CreateIndex
CREATE INDEX "ReferralLink_isActive_idx" ON "ReferralLink"("isActive");

-- CreateIndex
CREATE INDEX "User_referrerId_idx" ON "User"("referrerId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "ReferralLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralLink" ADD CONSTRAINT "ReferralLink_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
