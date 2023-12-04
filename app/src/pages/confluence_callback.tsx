import { type GetServerSidePropsContext, type NextPage } from "next";
import { prisma } from "~/server/db";

import { env } from "~/env.mjs";
import { SecondaryButton } from "~/components/form/button";
import Link from "next/link";

const ConfluenceCallBack: NextPage = (props: any) => {
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
  console.log("🔥 ~ getServerSideProps ~ context.query :", context.query)

  if (!code || !state) {
    return {
      props: {
        ...context.query
      }
    }
  }
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

  const detailsRes = await fetch('https://auth.atlassian.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      client_id: env.NEXT_PUBLIC_CONFLUENCE_CLIENT_ID,
      client_secret: env.CONFLUENCE_SECRET,
      code,
      redirect_uri: env.CONFLUENCE_REDIRECT_URL
    })
  }
  )

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const details = await detailsRes.json()
  console.log("🔥 ~ getServerSideProps ~ detailsRes:", details)


  // return { props: {} }


  return { props: {} }
}


export default ConfluenceCallBack
