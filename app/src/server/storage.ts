import {
  S3Client,
  ListBucketsCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectsCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "~/env.mjs";

const S3 = new S3Client({
  region: "auto",
  endpoint: `https://3271ef4cb6db5c4cc6a264a9774ee379.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY,
    secretAccessKey: env.R2_SECRET_KEY,
  },
});


export const getDocumentUploadUrls = async (documentId: string, documentDataIds: string[]) => {
  const urls = documentDataIds.map(id => {
    return getSignedUrl(S3, new PutObjectCommand({ Bucket: env.R2_DOCS_BUCKET, Key: `${documentId}/${id}.txt`, ContentType: 'text/plain' }), { expiresIn: 3600 })
  })

  return await Promise.all(urls)
}

export const downloadDocument = async (documentId: string, documentDataId: string) => {
  const resp = await S3.send(new GetObjectCommand({ Bucket: env.R2_DOCS_BUCKET, Key: `${documentId}/${documentDataId}.txt` }))
  return { content: await resp.Body?.transformToString(), size: resp.ContentLength }
}

export const deleteFileDocument = async (documentId: string) => {
  const resp = await S3.send(new ListObjectsV2Command({ Bucket: env.R2_DOCS_BUCKET, Prefix: `${documentId}/` }))
  if (resp.Contents?.length === 0) return;

  await S3.send(new DeleteObjectsCommand({
    Bucket: env.R2_DOCS_BUCKET,
    Delete: {
      Objects: resp.Contents?.map(({ Key }) => ({ Key: Key! })) ?? []
    }
  }))
}