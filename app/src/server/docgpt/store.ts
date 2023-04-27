import { PineconeClient } from "@pinecone-database/pinecone";
import { type DocumentType } from "@prisma/client";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "langchain/document";
import { OpenAIEmbeddings } from "langchain/embeddings";
import { PineconeStore } from "langchain/vectorstores";
import { env } from "~/env.mjs";

const client = new PineconeClient()

export const getVectorIndex = async () => {
  await client.init({
    apiKey: env.PINECONE_API_KEY,
    environment: env.PINECONE_ENVIRONMENT,
  });

  return client.Index(env.PINECONE_INDEX)
}

export const loadDocumentsToDb = async (projectId: string, documentId: string, docType: DocumentType, docs: Array<Document>) => {
  const pineconeIndex = await getVectorIndex()
  const documents = docs.map(d => new Document({
    pageContent: d.pageContent, metadata: { ...d.metadata, projectId, documentId, type: docType }
  }))

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  })

  const splitDocuments = await splitter.splitDocuments(documents)
  await PineconeStore.fromDocuments(splitDocuments, new OpenAIEmbeddings(), { pineconeIndex, namespace: projectId })
}


export const getVectorDB = async (projectId: string) => {
  const pineconeIndex = await getVectorIndex()

  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings(),
    { pineconeIndex, namespace: projectId }
  );

  return vectorStore
}

export const deleteDocumentVector = async (projectId: string, documentId: string) => {
  const index = await getVectorIndex()
  await index._delete({ deleteRequest: { namespace: projectId, filter: { documentId } } })
}