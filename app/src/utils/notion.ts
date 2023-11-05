export const getNotionParents = (args: any[]) => {
  const lists = args as NotionPage[]
  const result: NotionList[] = []
  for (let i = 0; i < lists.length; i++) {
    const each = lists[i]

    // Edge cases
    if (!each) continue
    if (each.parent.type != 'workspace') continue

    const title = each.properties?.title?.title[0]?.plain_text ?? 'Untitled Document'
    const details = {
      id: each.id,
      title,
      icon: each.icon,
      url: each.url
      // content: each.properties.title.title[0].text
    }
    result.push(details)
  }
  return result
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

export type NotionList = { id: string, title: string, url: string, icon: CoverOrIcon }
