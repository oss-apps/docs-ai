import { type GetServerSidePropsContext, type NextPage } from "next";
import { prisma } from "~/server/db";

import { env } from "~/env.mjs";
import { type NotionDetails } from "~/utils/notion";
import { type Document } from "@prisma/client";
import { SecondaryButton } from "~/components/form/button";
import Link from "next/link";

const NotionCallback: NextPage = (props: any) => {
  console.log("🔥 ~ props:", props)

  return (
    <div className="flex justify-center items-center flex-col  gap-2">
      {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
      <h1 className="my-2 text-center text-xl"> {props?.error} </h1>
      <Link href='/'>
        <SecondaryButton> Go to Home </SecondaryButton></Link>
    </div>
  );
};


export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { code, state } = context.query as { code: string, state: string }

  if (!code || !state) {
    return {
      props: {
        ...context.query 
      }
    }
  }


  // return { props: {} }
  const [orgId, projectId, documentId] = state.split(',')

  if (!orgId || !projectId) {
    return {
      props: {
        error: "No orgId and ProjectId provided by the client"
      }
    }
  }

  const project = await prisma.project.findUnique({ where: { id: projectId }, include: { org: true } })
  if (!project) return {
    props: {
      error: "Invalid project Id"
    }
  }

  const encoded = Buffer.from(`${env.NEXT_PUBLIC_NOTION_CLIENT_ID}:${env.NOTION_CLIENT_SECRET}`).toString("base64");

  try {
    const detailsRes = await fetch("https://api.notion.com/v1/oauth/token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Basic ${encoded}`,
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code: context.query.code,
        redirect_uri: env.NOTION_REDIRECT_URL,
      }),
    });
    const details = await detailsRes.json() as NotionDetails
    let isUpdated = false
    let notionDoc: Document | null = null;

    if (documentId) {
      const currentDoc = await prisma.document.findFirstOrThrow({
        where: {
          id: documentId
        }
      })

      notionDoc = await prisma.document.update({
        where: { id: documentId },
        data: {
          details: { ...(currentDoc.details as NotionDetails), ...details },
          projectId,
          src: details.workspace_name,
          title: details.workspace_name,
          documentType: 'NOTION',
          indexStatus: 'FETCH_DONE'
        }
      })

      if (notionDoc?.id) {
        isUpdated = true
      }
    }

    if (!isUpdated) {
      notionDoc = await prisma.document.create({
        data: {
          details,
          projectId,
          src: details.workspace_name,
          title: details.workspace_name,
          documentType: 'NOTION',
          indexStatus: 'FETCH_DONE'
        }
      })
    }

    if (!notionDoc) {
      return {
        props: {
          error: "Something happened, please try again later!"
        }
      }
    }

    return {
      redirect: {
        destination: `/dashboard/${project.org.name}/${project.slug}/edit_document?id=${notionDoc.id}&type=NOTION`
      }
    }
  }
  catch (err) {
    console.error("🔥 ~ getServerSideProps ~ err:", err)
    return { props: { err } }

  }

}

export default NotionCallback