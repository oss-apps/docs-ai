/*
  Warnings:

  - A unique constraint covering the columns `[stripeCustomerId]` on the table `Org` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('FREE', 'BASIC', 'PROFESSIONAL', 'ENTERPRISE');

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "tokens" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Org" ADD COLUMN     "chatCredits" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "documentTokens" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paymentsUpdatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "plan" "Plan" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "stripeCustomerId" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "chatUsed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "documentTokens" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "generateSummary" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "priceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "currentStart" TIMESTAMP(3),
    "currentEnd" TIMESTAMP(3),

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Org_stripeCustomerId_key" ON "Org"("stripeCustomerId");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE CASCADE ON UPDATE CASCADE;
