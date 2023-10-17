/*
  Warnings:

  - You are about to drop the column `customFields` on the `Conversation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "customFields",
ADD COLUMN     "additionalFields" JSONB;
