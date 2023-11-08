import { Client } from "@notionhq/client"
import { type Document } from "@prisma/client"

export const getNotionParents = (args: any[], notionDetails: NotionDetails, skip = false) => {
  const lists = args as NotionPage[]
  const isSkipEnabled = skip && Boolean(notionDetails.skippedUrls)

  const result: NotionList[] = []
  for (let i = 0; i < lists.length; i++) {
    const each = lists[i]


    // Edge cases
    if (!each) continue
    if (each.parent.type != 'workspace') continue
    if (isSkipEnabled && notionDetails.skippedUrls[each.id]) {
      console.log("🔥 ~ skipped pages:", each.id)
      continue
    }
    const title = each.properties?.title?.title[0]?.plain_text ?? 'Untitled Document'
    const details = {
      id: each.id,
      title,
      icon: each.icon,
      url: each.url,
      object: each.object
    }
    result.push(details)
  }
  return result
}


export const getNotionPages = async (document: Document, skip = false) => {
  const notion = new Client({
    auth: (document.details as NotionDetails).access_token,
    notionVersion: "2022-02-22"
  })

  let cursor: string | undefined;
  const lists = []
  while (true) {
    const list = await notion.search({ filter: { value: "page", property: "object" }, start_cursor: cursor })
    lists.push(...list.results)
    if (list.has_more) {
      cursor = list.next_cursor as string
      continue;
    }
    else {
      break;
    }
  }

  const notionLists = getNotionParents(lists, document.details as NotionDetails, skip)
  return notionLists
}

export type NotionDetails = {
  access_token: string;
  token_type: string;
  bot_id: string;
  workspace_name: string;
  workspace_icon: string;
  workspace_id: string;
  owner: {
    type: string;
    user: {
      object: string;
      id: string;
    };
  };
  duplicated_template_id: string | null;
  request_id: string;
  skippedUrls: Record<string, boolean>
}

export type NotionPage = {
  id: string;
  created_time: string;
  last_edited_time: string;
  created_by: CreatedByOrLastEditedBy;
  last_edited_by: CreatedByOrLastEditedBy;
  cover: CoverOrIcon;
  icon: CoverOrIcon;
  parent: Parent;
  archived: boolean;
  properties: { title: Title };
  url: string;
  public_url: string;
  object: 'page' | 'database'
}
type CreatedByOrLastEditedBy = {
  object: string;
  id: string;
}
export type CoverOrIcon = {
  type: 'emoji' | 'file';
  file?: File;
  emoji?: string;
}
type File = {
  url: string;
  expiry_time: string;
}
type Parent = {
  type: string;
  workspace: boolean;
}

type Title = {
  id: string;
  type: string;
  title: (TitleEntity)[];
}

type TitleEntity = {
  type: string;
  text: {
    content: string;
    link?: null;
  };
  annotations: {
    bold: boolean;
    italic: boolean;
    strikethrough: boolean;
    underline: boolean;
    code: boolean;
    color: string;
  };
  plain_text: string;
  href?: null;
}

export type NotionList = { id: string, title: string, url: string, icon: CoverOrIcon, object: "page" | "database" }
