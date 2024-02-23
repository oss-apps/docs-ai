export enum URLType {
  GITBOOK = 'GITBOOK',
  DOCUSARUS = 'DOCUSARUS',
  DEFAULT = 'DEFAULT'
}

export type ParsedUrls = Array<{ id: string, uniqueId: string, size: number }>

export type ParsedDocs = Array<{ pageContent: string, metadata: Record<string, string> }>

export type ChatCallback = (message: string) => void

export type AdditionFields = { name: string | undefined, avatarUrl: string | undefined, userEmail: string | undefined }
