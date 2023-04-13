import { type Prisma } from "@prisma/client";
import { z } from "zod";

import {
  createTRPCRouter,
  orgMemberProcedure,
} from "~/server/api/trpc";
import { prisma } from "~/server/db";
import * as docgpt from '~/server/docgpt/index'
import { deleteDocumentVector } from "~/server/docgpt/store";



export const documentRouter = createTRPCRouter({
  createUrlDocument: orgMemberProcedure
    .input(z.object({
      src: z.string(), projectId: z.string(), orgId: z.string(), loadAllPath: z.boolean(), type: z.string().optional(), skipPaths: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      const type = !input.type ? 'documentation' : 'gitbook'
      const result = await ctx.prisma.document.create({
        data: {
          src: input.src,
          documentType: "URL",
          projectId: input.projectId,
          details: {
            loadAllPath: input.loadAllPath,
            type,
            skipPaths: input.skipPaths
          }
        }
      })

      docgpt.indexUrlDocument(input.src, type, input.projectId, result.id, input.loadAllPath, input.skipPaths)
        .then(console.log)
        .catch(console.error)

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
      docgpt.indexTextDocument(input.content, input.title, input.projectId, result.id)
        .then(console.log)
        .catch(console.error)
      return {
        document: result,
      };
    }),


  reIndexDocument: orgMemberProcedure
    .input(z.object({ documentId: z.string(), projectId: z.string(), orgId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      let document = await ctx.prisma.document.findFirst({
        where: {
          id: input.documentId,
        }
      })

      if (document) {
        const details = document.details as Prisma.JsonObject

        document = await ctx.prisma.document.update({
          data: {
            indexStatus: 'INDEXING'
          },
          where: {
            id: input.documentId
          }
        })

        console.log('Deleting document')

        await deleteDocumentVector(input.projectId, input.documentId)

        if (document?.documentType === 'URL') {
          docgpt.indexUrlDocument(document.src, details.type?.toString() || 'documentation', input.projectId, document.id, !!details.loadAllPath, details?.skipPaths?.toString())
            .then(console.log)
            .catch(console.error)
        } else if (document?.documentType === 'TEXT') {
          docgpt.indexTextDocument(document.src, document?.title || '', input.projectId, document.id)
            .then(console.log)
            .catch(console.error)
        }
      }

      return {
        document,
      };
    }),

  deleteDocument: orgMemberProcedure
    .input(z.object({ projectId: z.string(), orgId: z.string(), documentId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await deleteDocumentVector(input.projectId, input.documentId)
      await ctx.prisma.document.delete({ where: { id: input.documentId } })
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
