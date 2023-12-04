import { Document } from "langchain/document"
import { WebBaseLoader } from "./base"
import { IndexStatus, DocumentType } from "@prisma/client"
import { loadDocumentsToDb } from "../store"
import { prisma } from "~/server/db"
import * as storage from "~/server/storage"
import { notionLoader } from "./notionToText"
import { getLimits } from "~/utils/license"
import conflLoader from "./confluenceToText"


async function updateStatus(projectId: string, orgId: string, documentId: string, error: boolean, title: string, tokens: number, indexStatus?: IndexStatus) {
  await prisma.document.update({
    where: { id: documentId },
    data: {
      title,
      indexStatus: indexStatus ?? (error ? IndexStatus.FAILED : IndexStatus.SUCCESS),
      tokens,
    },
  })

  await prisma.project.update({
    where: { id: projectId },
    data: {
      documentTokens: {
        increment: tokens
      }
    }
  })

  await prisma.org.update({
    where: { id: orgId },
    data: {
      documentTokens: {
        increment: tokens
      }
    }
  })
}

export async function loadUrlDocument(url: string, type: string, orgId: string, projectId: string, documentId: string, loadAllPath: boolean, skipPaths?: string, pageLimit?: number) {
  console.log('Loading url document', url)
  const loader = new WebBaseLoader(url, { shouldLoadAllPaths: loadAllPath, skipPaths: skipPaths?.split(','), loadImages: false, documentId, pageLimit })

  const docs = await loader.load()
  return { docs, isStopped: loader.isStopped }
}



export async function indexUrlDocument(docs: Document[], orgId: string, projectId: string, documentId: string) {
  let title = ''
  let error = false
  let tokens = 0

  try {
    title = docs[0]?.metadata.title as string
    tokens = docs.reduce((acc, curr) => {
      acc += curr.metadata.size
      return acc
    }, 0)
    await loadDocumentsToDb(projectId, documentId, DocumentType.URL, docs)
    console.log(`Loaded ${docs.length} documents with ${tokens} tokens`)
  } catch (e) {
    console.error(e)
    error = true
  }

  await updateStatus(projectId, orgId, documentId, error, title, tokens)
}


export async function indexTextDocument(content: string, title: string, orgId: string, projectId: string, documentId: string, source?: string) {
  const document = new Document({
    pageContent: `${title}\n${content}`,
    metadata: {
      title, projectId, documentId, source: source ?? 'MANUAL', type: DocumentType.TEXT
    }
  })

  let error = false
  let tokens = 0
  try {
    await loadDocumentsToDb(projectId, documentId, DocumentType.TEXT, [document])
    tokens = new Blob([document.pageContent]).size
  } catch (e) {
    console.error(e)
    error = true
  }

  await updateStatus(projectId, orgId, documentId, error, title, tokens)
}


export async function indexFileDocuments(orgId: string, projectId: string, documentId: string, docDataIds: string[], title: string) {
  const docs = await Promise.all(docDataIds.map(async id => {
    const { content } = await storage.downloadDocument(documentId, id)
    return new Document({
      pageContent: content,
      metadata: {
        title: title, projectId, documentId, source: 'FILE', type: DocumentType.FILES, size: new Blob([content!]).size, docDataId: id
      }
    })
  }))

  let error = false
  let tokens = 0
  try {
    await loadDocumentsToDb(projectId, documentId, DocumentType.FILES, docs)
    tokens = docs.reduce((acc, curr) => {
      acc += curr.metadata.size
      return acc
    }, 0)
  }
  catch (e) {
    console.error(e)
    error = true
  }

  const result = docs.map(async doc => {
    return await prisma.documentData.update({
      where: { id: doc.metadata.docDataId as string },
      data: {
        indexed: !error,
        size: doc.metadata.size as number,
      }
    })
  })

  await Promise.all(result)
  await updateStatus(projectId, orgId, documentId, error, title, tokens)
}

export async function indexNotionDocuments(orgId: string, projectId: string, documentId: string) {
  console.log("🔥 ~ indexNotionDocuments ~ inside:")
  const notionDoc = await prisma.document.findFirst({ where: { id: documentId } })
  const org = await prisma.org.findFirst({ where: { id: orgId } })
  if (!org || !notionDoc || !notionDoc.details) {
    return notionDoc
  }
  let docs: Document[] = []
  try {
    docs = await notionLoader(notionDoc)
  }
  catch (err) {
    console.error("🔥 ~ indexNotionDocuments ~ err:", err)
    await updateStatus(projectId, orgId, documentId, true, notionDoc.src, 0, "FAILED")
    throw new Error("INTERNAL_SERVER_ERROR")
  }

  const tokens = docs.reduce((acc, curr) => {
    acc += curr.metadata.size
    return acc
  }, 0)

  if (Number(org.documentTokens) + tokens > getLimits(org.plan).documentSize) {
    console.log("🔥 ~ indexNotionDocuments ~ tokens:", documentId, tokens)
    await updateStatus(projectId, orgId, documentId, true, notionDoc.src, 0, "SIZE_LIMIT_EXCEED")
    throw new Error('Document size limit exceeded')

  }

  await loadDocumentsToDb(projectId, documentId, DocumentType.NOTION, docs)
  await updateStatus(projectId, orgId, documentId, false, notionDoc.src, tokens, "SUCCESS")

  console.log("🔥 ~ indexNotionDocuments ~ finished:", documentId)

  return notionDoc
}

export async function indexConflDocument(orgId: string, projectId: string, documentId: string) {
  console.log("🫤 ~ confl ~ indexConflDocument ~ inside:")
  const doc = await prisma.document.findFirst({ where: { id: documentId } })
  const org = await prisma.org.findFirst({ where: { id: orgId } })
  if (!org || !doc || !doc.details) {
    return doc
  }
  let docs: Document[] | undefined = []
  try {
    docs = await conflLoader(doc)
    if (docs) {
      await loadDocumentsToDb(projectId, documentId, DocumentType.CONFLUENCE, docs)
    }
    else {
      throw new Error("🫤 ~ confl ~ No docs is present")
    }
  }
  catch (err) {
    console.error("🫤 ~ confl ~ indexConflDocument ~ err:", err)
    await updateStatus(projectId, orgId, documentId, true, doc?.title || doc.src, 0, "FAILED")
    throw new Error(`INTERNAL_SERVER_ERROR`)
  }

  const tokens = docs.reduce((acc, curr) => {
    acc += curr.metadata.size;
    return acc;
  }, 0)


  if (Number(org.documentTokens) + tokens > getLimits(org.plan).documentSize) {
    console.log("🫤 ~ confl ~ indexConflDocument ~ tokens:", documentId, tokens)
    await updateStatus(projectId, orgId, documentId, true, doc?.title || doc.src, 0, "SIZE_LIMIT_EXCEED")
    throw new Error('Document size limit exceeded')

  }

  await loadDocumentsToDb(projectId, documentId, DocumentType.NOTION, docs)
  await updateStatus(projectId, orgId, documentId, false, doc?.title || doc.src, tokens, "SUCCESS")

  console.log("🫤 ~ confl ~ indexConflDocument ~ finished:", documentId)


}
