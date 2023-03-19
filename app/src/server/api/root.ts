import { createTRPCRouter } from "~/server/api/trpc";
import { exampleRouter } from "~/server/api/routers/example";
import { projectRouter } from "./routers/project";
import { documentRouter } from "./routers/document";
import { docGPTRouter } from "./routers/docGPT";
import { conversationRouter } from "./routers/conversation";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  project: projectRouter,
  document: documentRouter,
  docGPT: docGPTRouter,
  conversation: conversationRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
