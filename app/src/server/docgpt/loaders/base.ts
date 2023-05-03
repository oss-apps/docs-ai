/* eslint-disable */
import type { CheerioAPI } from "cheerio";
import { Document } from "langchain/document"
import { CheerioWebBaseLoader } from "langchain/document_loaders";
import { mapLimit } from "~/utils/async";
import { render } from './cheerioToText'
import { prisma } from "~/server/db";
import { AsyncCaller } from "~/utils/async_caller";
import { load } from "cheerio";
import fetch from "node-fetch";

export interface WebBaseLoaderParams {
  documentId?: string
  shouldLoadAllPaths?: boolean
  skipPaths?: Array<string>
  loadImages?: boolean
  pageLimit?: number
}

export class WebBaseLoader extends CheerioWebBaseLoader {
  shouldLoadAllPaths = false
  skipPaths: Array<string> = []
  loadImages = false
  visitedUrls = new Set();
  documentId = ''
  caller: AsyncCaller;
  isStopped = false
  pageLimit = 30

  constructor(public webPath: string, params: WebBaseLoaderParams = {}) {
    if (webPath.endsWith('/')) webPath = webPath.slice(0, -1)
    super(webPath);
    this.shouldLoadAllPaths =
      params.shouldLoadAllPaths ?? this.shouldLoadAllPaths;
    this.skipPaths = params.skipPaths ?? this.skipPaths;
    this.loadImages = params.loadImages ?? false;
    this.documentId = params.documentId ?? ''
    this.caller = new AsyncCaller({ maxRetries: 2 })
    this.pageLimit = params.pageLimit ?? this.pageLimit
  }

  static async _scrapeNew(
    url: string,
    caller: AsyncCaller,
  ): Promise<CheerioAPI> {
    const response = await caller.call(fetch, url, { redirect: "follow", follow: 2 });
    const html = await response.text();
    return load(html);
  }

  async scrape(): Promise<CheerioAPI> {
    return WebBaseLoader._scrapeNew(this.webPath, this.caller);
  }

  public async load(): Promise<Document[]> {
    const $ = await this.scrape();

    if (this.shouldLoadAllPaths === true) {
      this.isStopped = await this.loadPageRecursively()
      return []
    }

    const { document } = await loadDocAndGetLink(this.webPath, this.documentId, this.caller)
    return [document];
  }

  loadPath($: CheerioAPI, url?: string): Document[] {
    $('script').remove()
    $('styles').remove()
    $('noscript').remove()

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

  async loadPageRecursively(): Promise<boolean> {
    return loadPageRecursively(this.webPath, this.documentId, this.pageLimit)
  }
}


function getDocumentFromPage($: CheerioAPI, url: string) {
  $('script').remove()
  $('styles').remove()
  $('noscript').remove()

  const pageContent = $("body main")[0] ? render($("body main")[0], false) : render($("body"), false)

  const title = $("html h1").first().text().trim();


  return new Document({
    pageContent,
    metadata: { source: url, title, size: new Blob([pageContent]).size },
  })
}

function getRelativePaths($: CheerioAPI, basePath: string) {
  return $("a")
    .toArray()
    .map((element) => $(element).attr("href"))
    .filter((text) => text && (text[0] === "/" || text.startsWith(basePath)));
}

async function loadDocAndGetLink(url: string, documentId: string, caller: AsyncCaller) {
  try {
    const $ = await WebBaseLoader._scrapeNew(url, caller);
    const document = getDocumentFromPage($, url)
    await prisma.documentData.upsert({
      where: {
        uniqueId_documentId: {
          documentId: documentId,
          uniqueId: url,
        }
      },
      update: {
        documentId: documentId,
        uniqueId: url,
        size: document.metadata.size,
        data: document.pageContent,
        displayName: document.metadata.title,
        indexed: false,
      },
      create: {
        documentId: documentId,
        uniqueId: url,
        size: document.metadata.size,
        data: document.pageContent,
        displayName: document.metadata.title,
        indexed: false,
      }
    })
    const basePath = new URL(url).origin

    const relativePaths = getRelativePaths($, basePath)

    return { relativePaths, document }
  } catch (e) {
    console.log('Fetch failed for', url, e)
    return { relativePaths: [], document: new Document() }
  }
}



async function loadPageRecursively(rootUrl: string, documentId: string, allowedCount = 30) {
  console.log('Loading recursively', rootUrl, documentId, allowedCount)
  const visitedUrls = new Set();
  const basePath = new URL(rootUrl).origin
  let isStopped = false

  const sanitizeUrl = (url: string) => {
    const urlObj = new URL(url);
    urlObj.search = '';
    urlObj.hash = '';

    url = urlObj.toString()
    const surl = url.endsWith('/') ? url.slice(0, -1) : url
    return surl
  }

  const caller = new AsyncCaller({})

  const loadPage = async (paramUrl: string) => {
    const url = sanitizeUrl(paramUrl)
    if (visitedUrls.has(url)) return []

    if (visitedUrls.size > allowedCount) {
      isStopped = true
      return []
    }

    visitedUrls.add(url)
    console.log(`Scraping ${url}`);

    const { relativePaths } = await loadDocAndGetLink(url, documentId, caller)

    await mapLimit(relativePaths, 5, async (path) => {
      if (path) {
        const url = path.startsWith('/') ? basePath + path : path;
        return loadPage(url);
      }

      return null
    })

    return []
  }

  await loadPage(rootUrl)
  return isStopped
}
