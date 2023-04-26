import { type Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { Document } from "langchain/document";
import { z } from "zod";

import {
  createTRPCRouter,
  orgMemberProcedure,
} from "~/server/api/trpc";
import { getRedisClient } from "~/server/cache";
import { prisma } from "~/server/db";
import * as docgpt from '~/server/docgpt/index'
import { deleteDocumentVector } from "~/server/docgpt/store";
import { type ParsedDocs } from "~/types";



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

      const docs = await docgpt.loadUrlDocument(input.src, type, input.orgId, input.projectId, result.id, input.loadAllPath, input.skipPaths)
      let parsedDocs: Array<{ url: string, size: number }> = []
      if (docs) {
        console.log('Load all path selected, so adding to temp cache')
        await (await getRedisClient()).set(`docs:${result.id}`, JSON.stringify(docs), { EX: 60 * 60 * 24 })
        parsedDocs = docs.map(d => ({ url: d.metadata.source as string, size: d.metadata.size as number }))
      }

      return {
        document: result,
        parsedDocs,
      };
    }),

  reIndexUrlDocument: orgMemberProcedure
    .input(z.object({ documentId: z.string(), projectId: z.string(), orgId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      let document = await ctx.prisma.document.findFirst({
        where: {
          id: input.documentId,
        }
      })
      let parsedDocs: Array<{ url: string, size: number }> = []

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

        if (document.tokens) {
          const p1 = ctx.prisma.project.update({
            where: { id: input.projectId },
            data: {
              documentTokens: {
                decrement: document.tokens
              }
            }
          })
          const p2 = await ctx.prisma.org.update({
            where: { id: input.orgId },
            data: {
              documentTokens: {
                decrement: document.tokens
              }
            }
          })

          await Promise.all([p1, p2])
        }

        await deleteDocumentVector(input.projectId, input.documentId)

        if (document?.documentType === 'URL') {
          const docs = await docgpt.loadUrlDocument(document.src, '', input.orgId, input.projectId, document.id, !!details.loadAllPath, details?.skipPaths?.toString())
          if (docs) {
            console.log('Load all path selected, so adding to temp cache')
            await (await getRedisClient()).set(`docs:${document.id}`, JSON.stringify(docs), { EX: 60 * 60 * 24 })
            parsedDocs = docs.map(d => ({ url: d.metadata.source as string, size: d.metadata.size as number }))
          }
        }
      }

      return {
        document,
        parsedDocs: parsedDocs
      };
    }),

  indexUrlDocument: orgMemberProcedure
    .input(z.object({
      projectId: z.string(),
      documentId: z.string(),
      orgId: z.string(),
      skipUrls: z.array(z.string()),
    }))
    .mutation(async ({ input, ctx }) => {
      const parsedDocStr = await (await getRedisClient()).get(`docs:${input.documentId}`);
      const parsedDocs = JSON.parse(parsedDocStr ?? '[]') as ParsedDocs

      if (parsedDocs.length === 0) {
        throw new TRPCError({ message: 'Docs not found in cache', code: 'INTERNAL_SERVER_ERROR' })
      }

      const skipPaths = input.skipUrls.reduce((acc, curr) => {
        acc[curr] = true
        return acc
      }, {} as Record<string, boolean>)

      const docs = parsedDocs
        .filter(d => !skipPaths[d.metadata.source as string])
        .map(d => new Document({ pageContent: d.pageContent, metadata: d.metadata }))

      await docgpt.indexUrlDocument(docs, input.orgId, input.projectId, input.documentId)
      await (await getRedisClient()).del(`docs:${input.documentId}`);
      return {
        status: 'success',
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
      await docgpt.indexTextDocument(input.content, input.title, input.orgId, input.projectId, result.id)
        .then(console.log)
        .catch(console.error)
      return {
        document: result,
      };
    }),

  reIndexTextDocument: orgMemberProcedure
    .input(z.object({ documentId: z.string(), projectId: z.string(), orgId: z.string(), title: z.string(), content: z.string() }))
    .mutation(async ({ input, ctx }) => {
      let document = await ctx.prisma.document.findFirst({
        where: {
          id: input.documentId,
        }
      })

      if (document) {
        document = await ctx.prisma.document.update({
          data: {
            indexStatus: 'INDEXING',
            src: input.content,
            title: input.title,
          },
          where: {
            id: input.documentId
          }
        })

        if (document.tokens) {
          const p1 = ctx.prisma.project.update({
            where: { id: input.projectId },
            data: {
              documentTokens: {
                decrement: document.tokens
              }
            }
          })
          const p2 = await ctx.prisma.org.update({
            where: { id: input.orgId },
            data: {
              documentTokens: {
                decrement: document.tokens
              }
            }
          })

          await Promise.all([p1, p2])
        }

        await deleteDocumentVector(input.projectId, input.documentId)
        await docgpt.indexTextDocument(input.content, input.title, input.orgId, input.projectId, document.id)
        await (await getRedisClient()).del(`docs:${input.documentId}`);
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

  getParsedDocument: orgMemberProcedure
    .input(z.object({ projectId: z.string(), orgId: z.string(), documentId: z.string() }))
    .query(async ({ input, ctx }) => {
      const parsedDocuments = JSON.parse(await (await getRedisClient())
        .get(`docs:${input.documentId}`) || '[]') as ParsedDocs

      const parsedUrls = parsedDocuments.map(d => ({ url: d.metadata.source as string, size: Number(d.metadata.size) }))

      return {
        parsedUrls,
      };
    }),
});
