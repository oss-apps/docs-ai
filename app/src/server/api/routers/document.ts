import * as Prisma from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { Document } from "langchain/document";
import { z } from "zod";

import {
  createTRPCRouter,
  orgMemberProcedure,
} from "~/server/api/trpc";
import { prisma } from "~/server/db";
import * as docgpt from '~/server/docgpt/index'
import { deleteDocumentVector } from "~/server/docgpt/store";
import { type ParsedUrls } from "~/types";
import { getLimits } from "~/utils/license";
import * as storage from '~/server/storage'
import { DocumentType } from "@prisma/client";
import { type JsonObject } from "@prisma/client/runtime/library";

import { getNotionPages } from "~/utils/notion";
import { type confluenceSchema, getConfluenceSpaces } from "~/utils/confluence";


const loadUrlDocument = async (src: string, type: string, orgId: string, projectId: string, documentId: string, loadAllPath: boolean, skipPaths: string, pageLimit: number) => {
  const { isStopped } = await docgpt.loadUrlDocument(src, type, orgId, projectId, documentId, loadAllPath, skipPaths, pageLimit)
  let parsedDocs: ParsedUrls = []
  let totalSize = 0
  parsedDocs = await prisma.documentData.findMany({
    where: {
      documentId,
    },
    select: {
      id: true,
      uniqueId: true,
      size: true,
    },
    orderBy: {
      size: 'desc',
    }
  })

  totalSize = parsedDocs.reduce((acc, curr) => {
    acc += curr.size
    return acc
  }, 0)


  await prisma.document.update({
    data: {
      indexStatus: Prisma.IndexStatus.FETCH_DONE
    },
    where: {
      id: documentId
    }
  })

  return { parsedDocs, totalSize, isStopped }
}


const resetTokens = async (document: Prisma.Document, orgId: string, projectId: string) => {
  if (document.tokens) {
    const p1 = prisma.project.update({
      where: { id: projectId },
      data: {
        documentTokens: {
          decrement: document.tokens
        }
      }
    })
    const p2 = prisma.org.update({
      where: { id: orgId },
      data: {
        documentTokens: {
          decrement: document.tokens
        }
      }
    })

    await Promise.all([p1, p2])
  }
}



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

      const { parsedDocs, totalSize, isStopped } = await loadUrlDocument(input.src, type, input.orgId, input.projectId, result.id, input.loadAllPath, input.skipPaths || '', getLimits(ctx.org?.plan || Prisma.Plan.FREE).pageLimit)

      return {
        document: result,
        parsedDocs,
        totalSize,
        isStopped,
      };
    }),

  reIndexUrlDocument: orgMemberProcedure
    .input(z.object({ documentId: z.string(), projectId: z.string(), orgId: z.string(), loadAllPath: z.boolean().optional(), skipPaths: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const document = await ctx.prisma.document.findFirst({
        where: {
          id: input.documentId,
        }
      })
      let parsedDocs: ParsedUrls = []
      let totalSize = 0
      let isStopped = false

      if (document) {
        const details = { ...document.details as Prisma.Prisma.JsonObject, skipPaths: input.skipPaths, loadAllPath: input.loadAllPath }

        await ctx.prisma.document.update({
          data: {
            indexStatus: 'FETCHING',
            details,
          },
          where: {
            id: input.documentId,
          }
        })

        await resetTokens(document, input.orgId, input.projectId)
        await deleteDocumentVector(input.projectId, input.documentId)
        await ctx.prisma.documentData.deleteMany({
          where: {
            documentId: input.documentId
          }
        })

        const data = await loadUrlDocument(document.src, '', input.orgId, input.projectId, document.id, !!details.loadAllPath, details?.skipPaths?.toString() || '', getLimits(ctx.org?.plan || Prisma.Plan.FREE).pageLimit)

        parsedDocs = data.parsedDocs
        totalSize = data.totalSize
        isStopped = data.isStopped
      }

      return {
        document,
        parsedDocs: parsedDocs,
        totalSize,
        isStopped,
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
      // Delete skipped docs
      await ctx.prisma.documentData.deleteMany({
        where: {
          id: {
            in: input.skipUrls
          }
        }
      })

      await ctx.prisma.document.update({
        data: {
          indexStatus: 'INDEXING'
        },
        where: {
          id: input.documentId
        }
      })


      const parsedDocs = await ctx.prisma.documentData.findMany({
        where: {
          documentId: input.documentId
        },
      })

      if (parsedDocs.length === 0) {
        throw new TRPCError({ message: 'Docs not found in cache', code: 'INTERNAL_SERVER_ERROR' })
      }


      const docs: Document[] = []
      let totalSize = 0

      for (const doc of parsedDocs) {
        docs.push(new Document({ pageContent: doc.data ?? '', metadata: { source: doc.uniqueId, size: doc.size, title: doc.displayName } }))
        totalSize += doc.size
      }

      if (ctx.org && Number(ctx.org?.documentTokens) + totalSize > getLimits(ctx.org?.plan).documentSize) {
        throw new TRPCError({ message: 'Document size limit exceeded', code: 'INTERNAL_SERVER_ERROR' })
      }

      await docgpt.indexUrlDocument(docs, input.orgId, input.projectId, input.documentId)

      await ctx.prisma.documentData.updateMany({
        where: {
          documentId: input.documentId
        },
        data: {
          data: null,
          indexed: true,
        }
      })

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

        await resetTokens(document, input.orgId, input.projectId)
        await deleteDocumentVector(input.projectId, input.documentId)
        await docgpt.indexTextDocument(input.content, input.title, input.orgId, input.projectId, document.id)
      }

      return {
        document,
      };
    }),

  createUploadFileUrls: orgMemberProcedure
    .input(z.object({ projectId: z.string(), orgId: z.string(), fileNames: z.string().array().min(1), title: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {

      const result = await ctx.prisma.document.create({
        data: {
          src: input.fileNames[0] || 'File',
          documentType: DocumentType.FILES,
          projectId: input.projectId,
          title: input.title,
          documentData: {
            createMany: {
              data: input.fileNames.map(fileName => ({
                uniqueId: fileName,
                displayName: fileName,
              }))
            }
          }
        }
      })

      const docIds = await ctx.prisma.documentData.findMany({
        where: {
          documentId: result.id
        },
        select: {
          id: true
        }
      })

      const urls = await storage.getDocumentUploadUrls(result.id, docIds.map(doc => doc.id))

      return {
        urls,
        document: result,
      }
    }),

  indexFileDocument: orgMemberProcedure
    .input(z.object({ projectId: z.string(), orgId: z.string(), documentId: z.string() }))
    .mutation(async ({ input, ctx }) => {

      await ctx.prisma.document.update({ data: { indexStatus: 'INDEXING' }, where: { id: input.documentId } })
      const document = await ctx.prisma.document.findFirst({
        where: {
          id: input.documentId,
        },
        include: {
          documentData: true
        }
      })

      if (!document) {
        throw new TRPCError({ message: 'Document not found', code: 'INTERNAL_SERVER_ERROR' })
      }

      await docgpt.indexFileDocuments(input.orgId, input.projectId, document.id, document.documentData.map(d => d.id), document.title || document.src)
      return {
        status: 'success',
      };
    }),

  createNotionDocument: orgMemberProcedure
    .input(z.object({ projectId: z.string(), orgId: z.string(), details: z.any(), documentId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const details = input.details as JsonObject
      await ctx.prisma.document.update({ data: { indexStatus: 'INDEXING', details }, where: { id: input.documentId } })
      const val = await docgpt.indexNotionDocuments(input.orgId, input.projectId, input.documentId)
      return val
    }),

  createConfluenceDocument: orgMemberProcedure
    .input(z.object({ projectId: z.string(), orgId: z.string(), details: z.any() }))
    .mutation(async ({ input, ctx }) => {
      const details = input.details as JsonObject
      const doc = await ctx.prisma.document.create({
        data: {
          src: details.baseUrl as string,
          documentType: "CONFLUENCE",
          projectId: input.projectId,
          title: details.baseUrl as string,
          indexStatus: "FETCH_DONE",
          details: { ...details, selectedSpace: [], skippedUrls: {} }
        }
      })
      return doc
    }),

  indexConfluenceDocument: orgMemberProcedure
    .input(z.object({ projectId: z.string(), orgId: z.string(), details: z.any(), documentId: z.string(), src: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const details = input.details as JsonObject
      const doc = await ctx.prisma.document.update({ data: { indexStatus: 'FETCH_DONE', details, src: input.src }, where: { id: input.documentId } })
      const val = await docgpt.indexConflDocument(input.orgId, input.projectId, input.documentId)
      return val
    }),

  deleteDocument: orgMemberProcedure
    .input(z.object({ projectId: z.string(), orgId: z.string(), documentId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const document = await ctx.prisma.document.findFirst({
        where: {
          id: input.documentId,
        }
      })

      if (!document) {
        throw new TRPCError({ message: 'Document not found', code: 'INTERNAL_SERVER_ERROR' })
      }

      if (document.documentType === 'FILES') {
        await storage.deleteFileDocument(document.id)
      }

      await resetTokens(document, input.orgId, input.projectId)
      try {
        await deleteDocumentVector(input.projectId, input.documentId)
      }
      catch (err) {
        console.error("🤯 ~ delete doc vector error", err)
      }
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

      const parsedDocuments = await ctx.prisma.documentData.findMany({
        where: {
          documentId: input.documentId,
        },
        select: {
          id: true,
          documentId: true,
          displayName: true,
          size: true,
          indexed: true,
          uniqueId: true,
        }
      })

      return {
        parsedDocuments
      };
    }),

  getOneDocument: orgMemberProcedure
    .input(z.object({ documentId: z.string() }))
    .query(async ({ input, ctx }) => {
      const document = await ctx.prisma.document.findFirst({
        where: {
          id: input.documentId
        }
      })
      if (!document) {
        throw new Error('Document not found , go back!')
      }

      if (document.documentType === 'NOTION') {
        const notionLists = await getNotionPages(document)
        return { document, integrationDetails: notionLists }
      }
      else if (document.documentType === 'CONFLUENCE') {
        const spaceLists = await getConfluenceSpaces(document.details as confluenceSchema, true)
        return { document, integrationDetails: spaceLists }
      }
      else return { document }
    })
});
