-- AlterEnum
ALTER TYPE "DocumentType" ADD VALUE 'CONFLUENCE';

-- AlterEnum
ALTER TYPE "IndexStatus" ADD VALUE 'SIZE_LIMIT_EXCEED';

-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "defaultPrompt" SET DEFAULT 'You are given the following context and a question. Prefer list over table when possible. Do NOT make up a hyperlink that is not listed. If the question includes a request for code, provide a code block directly from the documentation. If you don''t know the answer, just say that you don''t know, don''t try to make up an answer. If the question is not about given context, politely inform them that you are tuned to only answer questions about the context.';
