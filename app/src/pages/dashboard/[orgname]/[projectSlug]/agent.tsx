import { type GetServerSidePropsContext, type NextPage } from "next";
import { type User } from "next-auth";
import Head from "next/head";
import { prisma } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";
import { type Org, type Project } from "@prisma/client";
import superjson from "superjson";
import AppNav from "~/containers/AppNav/AppNav";
import { QnA } from "~/containers/QnA/QnA";
import { ChatBox } from "~/containers/Chat/Chat";
import PrimaryButton, { SmallButton } from "~/components/form/button";
import { env } from "~/env.mjs";
import { useState } from "react";


const QnAPage: NextPage<{ user: User, orgJson: string, projectJson: string }> = ({ user, orgJson, projectJson }) => {
  const [shareText, setShareText] = useState('Share')

  const org: Org = superjson.parse(orgJson)
  const project: Project = superjson.parse(projectJson)

  const onShareClick = () => {
    navigator.clipboard.writeText(`${location.origin}/chat/${project.id}`)
    setShareText('Copied')
    setTimeout(() => {
      setShareText('Share')
    }, 2000)
  }

  return (
    <>
      <Head>
        <title>Docs AI - Dashboard</title>
        <meta name="description" content="Create chat bot with your documents in 5 minutes" />
      </Head>
      <main className="h-full">
        <div className="h-full flex">
          <AppNav user={user} org={org} project={project} />
          <div className="w-full">
            <div className="mt-5 p-5 px-10">
              <div className="max-w-5xl mx-auto">
                <div className="flex justify-end">
                  <SmallButton onClick={onShareClick} className="mb-5 w-20">
                    {shareText}
                  </SmallButton>
                </div>
                <ChatBox org={org} project={project} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerAuthSession(context)

  if (!session) {
    return {
      redirect: {
        destination: '/'
      }
    }
  }

  const orgname = context.query.orgname as string
  const projectSlug = context.query.projectSlug as string

  const org = await prisma.orgUser.findFirst({
    where: {
      userId: session.user.id,
      org: {
        name: orgname,
      }
    },
    include: {
      org: {
        include: {
          projects: {
            where: {
              slug: projectSlug
            }
          }
        }
      }

    }
  })

  if (!org || org.org.projects.length === 0) {
    return {
      redirect: {
        destination: `/dashboard/${orgname}`
      }
    }
  }

  const props = { props: { user: session.user, orgJson: superjson.stringify(org.org), projectJson: superjson.stringify(org.org.projects[0]) } }
  return props
}

export default QnAPage;