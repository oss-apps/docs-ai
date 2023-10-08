-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "customFields" JSONB,
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "askUserId" TEXT DEFAULT 'Enter your email address to be notified of updates.';
