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
import { getLimits } from "~/utils/license";


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
      const parsedDocs: Array<{ url: string, size: number }> = []
      let totalSize = 0
      if (docs) {
        console.log('Load all path selected, so adding to temp cache')
        await (await getRedisClient()).set(`docs:${result.id}`, JSON.stringify(docs), { EX: 60 * 60 * 24 })
        for (const doc of docs) {
          totalSize += doc.metadata.size as number
          parsedDocs.push({ url: doc.metadata.source as string, size: doc.metadata.size as number })
        }
      }

      return {
        document: result,
        parsedDocs,
        totalSize,
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
      const parsedDocs: Array<{ url: string, size: number }> = []
      let totalSize = 0

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
            for (const doc of docs) {
              totalSize += doc.metadata.size as number
              parsedDocs.push({ url: doc.metadata.source as string, size: doc.metadata.size as number })
            }
          }
        }
      }

      return {
        document,
        parsedDocs: parsedDocs,
        totalSize,
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

      const docs: Document[] = []
      let totalSize = 0
      const filtredDocs = parsedDocs
        .filter(d => !skipPaths[d.metadata.source as string])

      for (const doc of filtredDocs) {
        docs.push(new Document({ pageContent: doc.pageContent, metadata: doc.metadata }))
        totalSize += Number(doc.metadata.size)
      }

      if (ctx.org && Number(ctx.org?.documentTokens) + totalSize > getLimits(ctx.org?.plan).documentSize) {
        throw new TRPCError({ message: 'Document size limit exceeded', code: 'INTERNAL_SERVER_ERROR' })
      }

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

      if (ctx.org && Number(ctx.org?.documentTokens) + new Blob([input.content]).size > getLimits(ctx.org?.plan).documentSize) {
        throw new TRPCError({ message: 'Document size limit exceeded', code: 'INTERNAL_SERVER_ERROR' })
      }

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

      const parsedUrls = []
      let totalSize = 0
      for (const doc of parsedDocuments) {
        parsedUrls.push({ url: doc.metadata.source as string, size: Number(doc.metadata.size) })
        totalSize += Number(doc.metadata.size)
      }


      return {
        parsedUrls,
        totalSize,
      };
    }),
});
