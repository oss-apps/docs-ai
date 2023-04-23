/* eslint-disable */

import type { CheerioAPI } from "cheerio";
import { Document } from "langchain/document"
import { CheerioWebBaseLoader } from "langchain/document_loaders";
import { mapLimit } from "~/utils/async";
import { WebBaseLoader, WebBaseLoaderParams } from "./base";


export class GitbookLoader extends WebBaseLoader {

  constructor(webPath: string, params: WebBaseLoaderParams = {}) {
    super(webPath, params);
  }

  public async load(): Promise<Document[]> {
    const $ = await this.scrape();

    if (this.shouldLoadAllPaths === true) {
      return this.loadAllPaths($);
    }
    return this.loadPath($);
  }

  loadPath($: CheerioAPI, url?: string): Document[] {
    $('script').remove()
    $('styles').remove()

    const pageContent = $("main *")
      .contents()
      .toArray()
      .map((element) =>
        element.type === "text" ? $(element).text().trim() : null
      )
      .filter((text) => text)
      .join("\n");

    const title = $("main h1").first().text().trim();

    return [
      new Document({
        pageContent,
        metadata: { source: url ?? this.webPath, title },
      }),
    ];
  }

  async loadAllPaths($: CheerioAPI): Promise<Document[]> {
    const relative_paths = $("nav a")
      .toArray()
      .map((element) => $(element).attr("href"))
      .filter((text) => text && text[0] === "/");

    const paths = this.removeDuplicates(relative_paths)

    const documents: Document[] = [];
    const basePath = new URL(this.webPath).origin

    const resultDocuments = await mapLimit(paths, 5, async (path) => {
      if (path && !this.isSkipped(path)) {
        const url = basePath + path;
        console.log(`Fetching text from ${url}`);
        const html = await WebBaseLoader._scrape(url);
        return this.loadPath(html, url);
      }

      return null
    })

    for (const resultDocument of resultDocuments) {
      if (resultDocument) {
        documents.push(...resultDocument)
      }
    }
    console.log(`Fetched ${documents.length} documents.`);
    return documents;
  }
}