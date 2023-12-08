import { ConfluencePagesLoader } from "langchain-notion/document_loaders/web/confluence";
import { type Document as lcDocument } from "langchain/document"
import { type Document } from "@prisma/client";
import { confluenceSchema } from "~/utils/confluence";

const username = "shriharipapa@gmail.com";
const accessToken = "ATATT3xFfGF0BevFg14ufodEkhOZD14hqXV_Uw_SWwcdhr6nYaDiOWQR2rUgmmBIN0-d_Bev4oC-Em-80bwHYVYGIjDzjNo4rhRPAr2N2STUHK5SAZ_XsoOiARJH5VmbQNRPo5XFi8yPYUuq6yosaZdX3b-ydJVHvX6lRlbYBTqKytvFRD7iWFk=F17A2411";


const conflLoader = async (doc: Document) => {
  console.log("🫤 ~ confl ~ conflLoader:")
  const pages: lcDocument[] = []
  let size = 0
  const conflDetails = doc.details as confluenceSchema

  if (!conflDetails.accessToken || !conflDetails.baseUrl || !conflDetails.email) return

  for (const key of Object.keys(conflDetails.skippedUrls)) {
    if (conflDetails.skippedUrls[key]) {
      if (username && accessToken) {
        const loader = new ConfluencePagesLoader({
          baseUrl: conflDetails.baseUrl + '/wiki',
          spaceKey: key,
          username: conflDetails.email,
          accessToken: conflDetails.accessToken,
        });

        const loadedPages = await loader.load();
        loadedPages.map(each => {
          const metadata = each.metadata as { object: string }
          const pageSize = new Blob([each.pageContent]).size
          size += pageSize
          pages.push({
            pageContent: each.pageContent,
            metadata: {
              size: pageSize,
              object: metadata.object,
              confluenceId: key
            }
          })
        })
      } else {
        console.error(
          "🫤 ~ confl ~ You must provide a username and access token to run this example."
        );
        return undefined
      }
    }
  }
  console.log("🫤 ~ confl ~ conflLoader ~ pages:", pages)
  console.log("🫤 ~ confl ~ conflLoader ~ size:", size)
  return pages
}

export default conflLoader

