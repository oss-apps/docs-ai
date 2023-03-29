import { type GetServerSidePropsContext, type NextPage } from "next";
import { type User } from "next-auth";
import Head from "next/head";
import { prisma } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";
import { type Org, type Project } from "@prisma/client";
import superjson from "superjson";
import AppNav from "~/containers/AppNav/AppNav";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import ReactMarkdown from 'react-markdown'
import Link from "next/link";
import { MarkDown } from "~/components/MarkDown";

const ConvoPage: NextPage<{ user: User, orgJson: string, projectJson: string }> = ({ user, orgJson, projectJson }) => {
  const org: Org = superjson.parse(orgJson)
  const project: Project = superjson.parse(projectJson)

  const { convoId } = useRouter().query as { convoId: string }

  const { data, isLoading } = api.conversation.getConversation.useQuery({ convoId, orgId: org.id, projectId: project.id })

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
            <div className="mt-10">
              <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center">
                  <Link className="text-gray-500 hover:underline" href={`/dashboard/${org.name}/${project.slug}`}>
                    Back
                  </Link>
                  <Link className="text-blue-500" href={`/dashboard/${org.name}/${project.slug}/new_document?docType=3&convoId=${convoId}`}>
                    Suggest answer
                  </Link>
                </div>
                {data?.conversation?.summary ? (
                  <>
                    <div className="text-xl mt-5">Summary</div>
                    <div>
                      {data?.conversation?.summary}
                    </div>
                  </>
                ) : null}

                <div className="mt-5 mx-auto border border-gray-200 rounded-md lg:h-[75vh] h-[85vh] mb-5 overflow-auto">
                  {isLoading ? <div>Loading...</div> : data?.conversation?.messages.map(m => (
                    <div key={m.id} className="flex mt-4 items-start even:bg-gray-100 p-2 px-4">
                      <div className="mt-1 text-xl">
                        {m.user === 'user' ? '👤' : '🤖'}
                      </div>
                      <div className="ml-10">
                        <MarkDown markdown={m.message} />
                      </div>
                    </div>
                  ))}
                </div>
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

export default ConvoPage;