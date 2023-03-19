import { z } from "zod";

import {
  createTRPCRouter,
  orgMemberProcedure,
} from "~/server/api/trpc";
import { indexTextDocument, indexUrlDocument } from "~/server/docGPT";



export const documentRouter = createTRPCRouter({
  createUrlDocument: orgMemberProcedure
    .input(z.object({ src: z.string(), projectId: z.string(), orgId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const result = await ctx.prisma.document.create({
        data: {
          src: input.src,
          documentType: "URL",
          projectId: input.projectId,
        }
      })
      await indexUrlDocument(input.src, 'documentation', input.projectId, result.id)

      return {
        document: result,
      };
    }),
  createTextDocument: orgMemberProcedure
    .input(z.object({ content: z.string(), title: z.string(), projectId: z.string(), orgId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const result = await ctx.prisma.document.create({
        data: {
          src: input.content,
          documentType: "TEXT",
          projectId: input.projectId,
          title: input.title,
        }
      })
      await indexTextDocument(input.content, input.title, input.projectId, result.id)
      return {
        document: result,
      };
    }),
  reIndexDocument: orgMemberProcedure
    .input(z.object({ documentId: z.string(), projectId: z.string(), orgId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const document = await ctx.prisma.document.findFirst({
        where: {
          id: input.documentId,
        }
      })

      if (document?.documentType === 'URL') {
        await indexUrlDocument(document.src, 'documentation', input.projectId, document.id)
      } else if (document?.documentType === 'TEXT') {
        await indexTextDocument(document.src, document?.title || '', input.projectId, document.id)
      }


      return {
        document,
      };
    }),
  getDocuments: orgMemberProcedure
    .input(z.object({ projectId: z.string(), orgId: z.string() }))
    .query(async ({ input, ctx }) => {
      const result = await ctx.prisma.document.findMany({
        where: {
          projectId: input.projectId,
        }
      })
      return {
        documents: result,
      };
    }),
});
