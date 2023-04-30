-- AlterEnum
ALTER TYPE "IndexStatus" ADD VALUE 'FETCHING_FAILED';

-- CreateTable
CREATE TABLE "DocumentData" (
    "id" TEXT NOT NULL,
    "uniqueId" TEXT NOT NULL,
    "displayName" TEXT,
    "documentId" TEXT NOT NULL,
    "data" TEXT,
    "size" INTEGER NOT NULL DEFAULT 0,
    "indexed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DocumentData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DocumentData_uniqueId_documentId_key" ON "DocumentData"("uniqueId", "documentId");

-- AddForeignKey
ALTER TABLE "DocumentData" ADD CONSTRAINT "DocumentData_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
