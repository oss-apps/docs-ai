import { Document } from "langchain/document"
import { WebBaseLoader } from "./base"
import { GitbookLoader } from "./gitbook"
import { IndexStatus, DocumentType } from "@prisma/client"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { loadDocumentsToDb } from "../store"
import { prisma } from "~/server/db"

export async function indexUrlDocument(url: string, type: string, projectId: string, documentId: string, loadAllPath: boolean, skipPaths?: string) {
  let loader = new WebBaseLoader(url, { shouldLoadAllPaths: loadAllPath, skipPaths: skipPaths?.split(',') })
  if (type === 'gitbook') {
    loader = new GitbookLoader(url, { shouldLoadAllPaths: loadAllPath, skipPaths: skipPaths?.split(',') })
  }

  let title = ''
  let error = false

  try {
    const docs = await loader.load()
    title = docs[0]?.metadata.title as string
    await loadDocumentsToDb(projectId, documentId, DocumentType.URL, docs)
  } catch (e) {
    console.error(e)
    error = true
  }

  console.log('indexing done', title, error)

  await prisma.document.update({
    where: { id: documentId },
    data: {
      title,
      indexStatus: error ? IndexStatus.FAILED : IndexStatus.SUCCESS
    },
  })
}