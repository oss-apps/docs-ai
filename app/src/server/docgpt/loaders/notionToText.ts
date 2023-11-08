import { NotionAPILoader } from "langchain-notion/document_loaders/web/notionapi";
import { type Document } from "@prisma/client";
import { getNotionPages, type NotionDetails } from "~/utils/notion";
import { type Document as lcDocument } from "langchain/document"

const notionLoader = async (doc: Document) => {
  const notionDetails = doc.details as NotionDetails
  const notionLists = await getNotionPages(doc, true)
  const pages: lcDocument[] = []

  for (const eachNotion of notionLists) {
    console.log(doc.id, " 🔥 ~ notionLoader ~ eachNotion:", eachNotion.id)
    // return pages
    const pageLoader = new NotionAPILoader({
      clientOptions: { auth: notionDetails.access_token },
      id: eachNotion.id,
      type: eachNotion.object,
      callerOptions: {
        maxConcurrency: 64
      },
      onDocumentLoaded: (current, total, currentTitle) => {
        console.log(doc.id, ` ⭐️ Sub Loaded Page: ${currentTitle ?? "ss"} (${current}/${total})`);
      }
    });
    const loadedPages = await pageLoader.load()
    loadedPages.map(each => {
      const metadata = each.metadata as { object: string, notionId: string }
      pages.push({
        pageContent: each.pageContent,
        metadata: {
          size: new Blob([each.pageContent]).size,
          object: metadata.object,
          notionId: metadata.notionId
        }
      })
    })
  }
  return pages
}

export { notionLoader }