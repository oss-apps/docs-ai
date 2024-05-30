import { Pinecone } from "@pinecone-database/pinecone";
import { type DocumentType } from "@prisma/client";
import { Document } from "langchain/document";
import { OpenAIEmbeddings } from "langchain/embeddings";
//import { PineconeStore } from "langchain/vectorstores";
import { env } from "~/env.mjs";
import { RecursiveCharacterTextSplitter } from "./textSplitter";
import { PineconeStore } from "@langchain/pinecone";

export const getVectorIndex = () => {
  const client = new Pinecone({
    apiKey: env.PINECONE_API_KEY,
  });

  return client.Index(env.PINECONE_INDEX);
};

export const loadDocumentsToDb = async (
  projectId: string,
  documentId: string,
  docType: DocumentType,
  docs: Array<Document>,
) => {
  const pineconeIndex = getVectorIndex();
  const documents = docs.map(
    (d) =>
      new Document({
        pageContent: d.pageContent,
        metadata: { ...d.metadata, projectId, documentId, type: docType },
      }),
  );

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 2000,
    chunkOverlap: 100,
  });

  const splitDocuments = await splitter.splitDocuments(documents);
  await PineconeStore.fromDocuments(splitDocuments, new OpenAIEmbeddings(), {
    pineconeIndex,
    namespace: projectId,
  });
};

export const getVectorDB = async (projectId: string) => {
  const pineconeIndex = getVectorIndex();

  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings(),
    { pineconeIndex, namespace: projectId },
  );

  return vectorStore;
};

export const deleteDocumentVector = async (
  projectId: string,
  documentId: string,
) => {
  const index = getVectorIndex().namespace(projectId);
  if (index) {
    // const page = index.listPaginated()
    // await index.de({
    //   deleteRequest: { namespace: projectId, filter: { documentId } },
    // });

    return Promise.resolve(true);
  }
};
