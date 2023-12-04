import { z } from "zod";

export const confluenceSchema = z.object({
  accessToken: z.string().min(10),
  baseUrl: z.string().url().endsWith("/"),
  email: z.string().email(),
})

export type confluenceSchema = z.infer<typeof confluenceSchema> & { skippedUrls: Record<string, boolean>, selectedSpace: string[] };

export const getConfluenceSpaces = async (data: confluenceSchema, recursive = false) => {

  const results = []
  let err = {}
  let url = `${data.baseUrl}/wiki/api/v2/spaces`

  while (true) {
    const spaces = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(
          `${data.email}:${data.accessToken}`
        ).toString('base64')}`,
        'Accept': 'application/json'
      }
    })

    if (spaces.status != 200) {
      console.error(`🫤 confl ~ data ~ result `, data, spaces)
      switch (spaces.status || 400) {
        case 401: err = { message: "Unauthorized access, check credentials.", status: spaces.status }
        case 404: err = { message: "Page unavailable, check your domain.", status: spaces.status }
        default: err = { message: "Something happend, " + spaces.statusText, status: spaces.status }
      }
      break
    }
    const currentResults = await spaces.json() as ConfluenceSpace
    currentResults.results && results.push(...currentResults.results)
    if (!recursive) break;
    if (currentResults._links.next) {
      url = `${data.baseUrl}/${currentResults._links.next}`
      continue
    }
    else break
  }
  return { results, status: 200, ...err }

}

export type ConfluenceSpace = {
  results: (Space)[] | null;
  status: number;
  message: string;
  _links: { next: string }
}
export type Space = {
  createdAt: string;
  authorId: string;
  homepageId: string;
  icon?: null;
  name: string;
  key: string;
  id: string;
  type: string;
  description?: null;
  status: string;
  _links: Links;
}
export type Links = {
  webui: string;
}



