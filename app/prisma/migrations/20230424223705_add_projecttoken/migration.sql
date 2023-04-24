-- CreateTable
CREATE TABLE "ProjectToken" (
    "id" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,
    "projectApiKey" TEXT NOT NULL,

    CONSTRAINT "ProjectToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectToken_projectId_key" ON "ProjectToken"("projectId");

-- AddForeignKey
ALTER TABLE "ProjectToken" ADD CONSTRAINT "ProjectToken_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
