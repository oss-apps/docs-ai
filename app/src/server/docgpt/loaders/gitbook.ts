/* eslint-disable */

import type { CheerioAPI } from "cheerio";
import { Document } from "langchain/document"
import { CheerioWebBaseLoader } from "langchain/document_loaders";
import { WebBaseLoader, WebBaseLoaderParams } from "./base";


export class GitbookLoader extends WebBaseLoader {

  constructor(public webPath: string, params: WebBaseLoaderParams = {}) {
    super(webPath, params);
  }

  public async load(): Promise<Document[]> {
    console.log('here gitbook', this.webPath)
    const $ = await this.scrape();

    if (this.shouldLoadAllPaths === true) {
      return this.loadAllPaths($);
    }
    return this.loadPath($);
  }

  loadPath($: CheerioAPI, url?: string): Document[] {
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

    console.log(`Found ${relative_paths.length} paths.`, relative_paths);

    const paths = this.removeDuplicates(relative_paths)

    const documents: Document[] = [];
    for (const path of paths) {
      if (path && !this.isSkipped(path)) {
        const url = this.webPath + path;
        console.log(`Fetching text from ${url}`);
        const html = await GitbookLoader._scrape(url);
        documents.push(...this.loadPath(html, url));
      }
    }
    console.log(`Fetched ${documents.length} documents.`);
    return documents;
  }
}