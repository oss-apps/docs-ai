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

const Rating: React.FC<{ rating: ConvoRating }> = ({ rating }) => {

  if (rating === 'POSITIVE') {
    return <>😃</>
  } else if (rating === 'NEGATIVE') {
    return <>😢</>
  }

  return <>😐</>
}


const ProjectDashboard: NextPage<{ user: User, orgJson: string, projectJson: string }> = ({ user, orgJson, projectJson }) => {
  const org: Org = superjson.parse(orgJson)
  const project: Project = superjson.parse(projectJson)

  const { data: convoData, isLoading: isConvoLoading } = api.conversation.getConversations.useQuery({ orgId: org.id, projectId: project.id })
  const { data: ratingData, isLoading } = api.conversation.getConversationRatings.useQuery({ orgId: org.id, projectId: project.id })


  return (
    <>
      <Head>
        <title>Docs AI - Dashboard</title>
        <meta name="description" content="Create chat bot with your documents in 5 minutes" />
      </Head>
      <main className="h-full">
        <div className="h-full flex">
          <AppNav user={user} org={org} project={project} />
          <div className="w-full h-full">
            <div className="p-5 px-10 overflow-auto h-full flex">
              <div className=" w-1/2">
                <div className="text-gray-600">Recent conversations</div>
                {convoData?.conversations.map((conversation) => (
                  <Link key={conversation.id} href={`/dashboard/${org.name}/${project.slug}/convo/${conversation.id}`}>
                    <div className="border p-4 mt-2 flex justify-between items-center rounded-md bg-gray-50 w-full">
                      <div>
                        <div>
                          {conversation.firstMsg}
                        </div>
                        <div className="text-sm text-gray-600 mt-2">{conversation.createdAt.toLocaleString()}</div>
                      </div>
                      <div className="text-xl"><Rating rating={conversation.rating} /></div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className=" w-1/2 px-20">
                <div>
                  <div className="text-gray-600">Rating</div>
                  {ratingData ? (
                    <div className="flex justify-between items-center py-10 mt-2">
                      <div className=" bg-green-50 border border-green-400  justify-center flex flex-col text-center rounded-2xl p-5 px-10">
                        <div className="text-2xl">😃</div>
                        <div className="mt-2 text-green-600">{(ratingData.ratings.POSITIVE / ratingData.total * 100).toFixed(0)}%</div>
                      </div>
                      <div className="bg-gray-50 border border-gray-400  justify-center flex flex-col text-center rounded-2xl p-5 px-10">
                        <div className="text-2xl">😐</div>
                        <div className="mt-2 text-gray-500">{(ratingData.ratings.NEUTRAL / ratingData.total * 100).toFixed(0)}%</div>
                      </div>
                      <div className="bg-red-50 border border-red-400  justify-center flex flex-col text-center rounded-2xl p-5 px-10">
                        <div className="text-2xl">😢</div>
                        <div className="mt-2 text-red-500">{(ratingData.ratings.NEGATIVE / ratingData.total * 100).toFixed(0)}%</div>
                      </div>
                    </div>
                  ) : null}
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

  const props = { props: { user: session.user, orgJson: superjson.stringify(org.org), projectJson: superjson.stringify(org.org.projects[0]) } }
  return props
}

export default ProjectDashboard;