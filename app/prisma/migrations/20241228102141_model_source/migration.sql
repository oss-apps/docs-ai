-- AlterTable
ALTER TABLE "Org" ADD COLUMN     "model" TEXT NOT NULL DEFAULT 'gpt-3.5-turbo-0125';

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "showSources" BOOLEAN NOT NULL DEFAULT true;
