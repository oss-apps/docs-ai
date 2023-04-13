import { type GetServerSidePropsContext, type NextPage } from "next";
import { type User } from "next-auth";
import Head from "next/head";
import { prisma } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";
import { type ConvoRating, type Org, type Project } from "@prisma/client";
import superjson from "superjson";
import AppNav from "~/containers/AppNav/AppNav";
import { api } from "~/utils/api";
import Link from "next/link";
import { useRouter } from "next/router";
import { MarkDown } from "~/components/MarkDown";
import { getLinkDirectory } from "~/utils/link";

const Rating: React.FC<{ rating: ConvoRating }> = ({ rating }) => {

  if (rating === 'POSITIVE') {
    return <>😃</>
  } else if (rating === 'NEGATIVE') {
    return <>😢</>
  }

  return <>😐</>
}


const Chats: NextPage<{ user: User, orgJson: string, projectJson: string }> = ({ user, orgJson, projectJson }) => {
  const org: Org = superjson.parse(orgJson)
  const project: Project = superjson.parse(projectJson)

  const router = useRouter()
  const { convoId } = router.query as { convoId: string | undefined }

  const { data: convoData, isLoading: isConvoLoading, hasNextPage, fetchNextPage } =
    api.conversation.getConversations.useInfiniteQuery({
      orgId: org.id, projectId: project.id
    }, {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    })
  const { data: currentChat, isLoading } = api.conversation.getConversation.useQuery({
    convoId: (convoId ?? convoData?.pages[0]?.conversations[0]?.id) || '',
    orgId: org.id,
    projectId: project.id
  })


  return (
    <>
      <Head>
        <title>Docs AI - Chats</title>
        <meta name="description" content="Create chat bot with your documents in 5 minutes" />
      </Head>
      <main className="h-full">
        <div className="h-full flex">
          <AppNav user={user} org={org} project={project} />
          <div className="w-full h-full">
            {convoData?.pages[0]?.conversations.length ? (
              <div className="px-0 h-full flex">
                <div className="w-1/3 border-r overflow-auto ">
                  <div className="text-gray-600 p-4 border-b">Chats</div>
                  {convoData.pages.map(p => p?.conversations.map((conversation) => (
                    <button className="w-full" key={conversation.id} onClick={() => router.replace(`/dashboard/${org.name}/${project.slug}/chats?convoId=${conversation.id}`)}>
                      <div className="p-4 flex justify-between items-center  border-b w-full">
                        <div>
                          <div className="text-start">
                            {conversation.firstMsg}
                          </div>
                          <div className="text-sm text-gray-600 mt-2 text-start">{conversation.createdAt.toLocaleString()}</div>
                        </div>
                      </div>
                    </button>
                  )))}
                  {hasNextPage ? (
                    <div className="flex p-4 justify-center">
                      <button onClick={() => fetchNextPage()} className="text-gray-700 hover:underline underline-offset-2">Load more</button>
                    </div>
                  ) : null}
                </div>
                <div className="w-2/3 overflow-auto pb-5">
                  <div className="flex justify-start items-center p-2 px-4">
                    <Link className="text-blue-500" href={`/dashboard/${org.name}/${project.slug}/new_document?docType=3&convoId=${convoId || ''}`}>
                      Suggest answer
                    </Link>
                  </div>
                  {
                    isLoading ? <div>Loading...</div> : currentChat?.conversation?.messages.map(m => (
                      <div key={m.id} className="flex mt-4 items-start even:bg-gray-100 p-2 px-4">
                        <div className="mt-1 text-xl">
                          {m.user === 'user' ? '👤' : '🤖'}
                        </div>
                        <div className="ml-10">
                          <MarkDown markdown={m.message} />
                          {m.sources ? (
                            <div className="pt-4">
                              <div className="flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-green-500">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                </svg>
                                <span>Sources: </span>
                              </div>
                              <div className="flex gap-3 mt-1 flex-shrink-0 flex-wrap">
                                {m.sources?.split(',').map(s =>
                                  <a className="border border-gray-300 hover:bg-gray-100 shrink-0 flex-wrap text-sm p-0.5 rounded-md px-2" href={s} target="_blank" key={s} rel="noreferrer">
                                    {getLinkDirectory(s)}
                                  </a>
                                )}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>))
                  }
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex justify-center mt-48">
                <div className="w-full mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-gray-600 mx-auto">
                    <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 00-1.032-.211 50.89 50.89 0 00-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 002.433 3.984L7.28 21.53A.75.75 0 016 21v-4.03a48.527 48.527 0 01-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979z" />
                    <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 001.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0015.75 7.5z" />
                  </svg>
                  <p className="text-center text-2xl text-gray-600">
                    {isConvoLoading ? 'Loading...' : 'No chats yet!'}
                  </p>
                </div>
              </div>
            )}
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
              slug: projectSlug,
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

  const props = {
    props: {
      user: session.user,
      orgJson: superjson.stringify(org.org),
      projectJson: superjson.stringify(org.org.projects[0])
    }
  }
  return props
}

export default Chats;