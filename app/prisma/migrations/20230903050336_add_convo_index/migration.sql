-- CreateIndex
CREATE INDEX "Conversation_projectId_createdAt_rating_idx" ON "Conversation"("projectId", "createdAt" DESC, "rating");
