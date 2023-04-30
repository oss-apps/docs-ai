export enum URLType {
  GITBOOK = 'GITBOOK',
  DOCUSARUS = 'DOCUSARUS',
  DEFAULT = 'DEFAULT'
}

export type ParsedUrls = Array<{ id: string, uniqueId: string, size: number }>

export type ParsedDocs = Array<{ pageContent: string, metadata: Record<string, string> }> 