-- CreateTable
CREATE TABLE "SlackInstallation" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "teamName" TEXT NOT NULL,
    "botUserId" TEXT NOT NULL,

    CONSTRAINT "SlackInstallation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SlackInstallation_projectId_key" ON "SlackInstallation"("projectId");

-- AddForeignKey
ALTER TABLE "SlackInstallation" ADD CONSTRAINT "SlackInstallation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
