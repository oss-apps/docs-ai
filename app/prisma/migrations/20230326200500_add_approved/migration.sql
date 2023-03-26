-- AlterTable
ALTER TABLE "Org" ADD COLUMN     "displayName" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "approved" BOOLEAN NOT NULL DEFAULT false;
