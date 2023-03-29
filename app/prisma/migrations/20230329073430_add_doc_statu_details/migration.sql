-- CreateEnum
CREATE TYPE "IndexStatus" AS ENUM ('INDEXING', 'SUCCESS', 'FAILED');

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "indexStatus" "IndexStatus" NOT NULL DEFAULT 'INDEXING';
