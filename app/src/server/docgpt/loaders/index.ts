import { Document } from "langchain/document"
import { WebBaseLoader } from "./base"
import { GitbookLoader } from "./gitbook"
import { IndexStatus, DocumentType } from "@prisma/client"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { loadDocumentsToDb } from "../store"
import { prisma } from "~/server/db"

async function updateStatus(documentId: string, error: boolean, title: string) {
  await prisma.document.update({
    where: { id: documentId },
    data: {
      title,
      indexStatus: error ? IndexStatus.FAILED : IndexStatus.SUCCESS
    },
  })
}


export async function indexUrlDocument(url: string, type: string, projectId: string, documentId: string, loadAllPath: boolean, skipPaths?: string) {
  let loader = new WebBaseLoader(url, { shouldLoadAllPaths: loadAllPath, skipPaths: skipPaths?.split(',') })
  if (type === 'gitbook') {
    loader = new GitbookLoader(url, { shouldLoadAllPaths: loadAllPath, skipPaths: skipPaths?.split(',') })
  }

  let title = ''
  let error = false

  try {
    const docs = await loader.load()
    console.log(docs)
    title = docs[0]?.metadata.title as string
    await loadDocumentsToDb(projectId, documentId, DocumentType.URL, docs)
  } catch (e) {
    console.error(e)
    error = true
  }

  await updateStatus(documentId, error, title)
}


export async function indexTextDocument(content: string, title: string, projectId: string, documentId: string, source?: string) {
  const document = new Document({
    pageContent: `${title}\n${content}`,
    metadata: {
      title, projectId, documentId, source: source ?? 'MANUAL', type: DocumentType.TEXT
    }
  })

  let error = false
  try {
    await loadDocumentsToDb(projectId, documentId, DocumentType.TEXT, [document])
  } catch (e) {
    console.error(e)
    error = true
  }

  await updateStatus(documentId, error, title)
}