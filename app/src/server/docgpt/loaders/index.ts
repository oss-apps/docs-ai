import { Document } from "langchain/document"
import { WebBaseLoader } from "./base"
import { GitbookLoader } from "./gitbook"
import { IndexStatus, DocumentType, Project, Org } from "@prisma/client"
import { loadDocumentsToDb } from "../store"
import { prisma } from "~/server/db"

async function updateStatus(projectId: string, orgId: string, documentId: string, error: boolean, title: string, tokens: number) {
  await prisma.document.update({
    where: { id: documentId },
    data: {
      title,
      indexStatus: error ? IndexStatus.FAILED : IndexStatus.SUCCESS,
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