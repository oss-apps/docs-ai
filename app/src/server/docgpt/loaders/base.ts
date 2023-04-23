/* eslint-disable */
import type { CheerioAPI } from "cheerio";
import { Document } from "langchain/document"
import { CheerioWebBaseLoader } from "langchain/document_loaders";
import { mapLimit } from "~/utils/async";
import { render } from './cheerioToText'

export interface WebBaseLoaderParams {
  shouldLoadAllPaths?: boolean
  skipPaths?: Array<string>
  loadImages?: boolean
}

export class WebBaseLoader extends CheerioWebBaseLoader {
  shouldLoadAllPaths = false
  skipPaths: Array<string> = []
  loadImages = false

  constructor(public webPath: string, params: WebBaseLoaderParams = {}) {
    if (webPath.endsWith('/')) webPath = webPath.slice(0, -1)
    super(webPath);
    this.shouldLoadAllPaths =
      params.shouldLoadAllPaths ?? this.shouldLoadAllPaths;
    this.skipPaths = params.skipPaths ?? this.skipPaths;
    this.loadImages = params.loadImages ?? false;
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

    const pageContent = $("body main")[0] ? render($("body main")[0], true) : render($("body"), this.loadImages)

    const title = $("html h1").first().text().trim();

    return [
      new Document({
        pageContent,
        metadata: { source: url ?? this.webPath, title },
      }),
    ];
  }

  public isSkipped(path: string): boolean {
    if (this.skipPaths.length === 0) return false

    let skipped = false
    for (const skipPath of this.skipPaths) {
      if ((skipPath.endsWith('*') && path.startsWith(skipPath.slice(0, -1))) || skipPath === path) {
        skipped = true
      }
    }

    return skipped
  }

  public removeDuplicates(relativePaths: (string | undefined)[]) {
    const pathMap: Record<string, boolean> = {}
    const paths = []
    for (const path of relativePaths) {
      if (path && !pathMap[path]) {
        pathMap[path] = true
        paths.push(path)
      }
    }

    return paths
  }

  async loadAllPaths($: CheerioAPI): Promise<Document[]> {
    const relative_paths = $("a")
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