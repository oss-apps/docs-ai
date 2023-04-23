import { type GetServerSidePropsContext, type NextPage } from "next";
import { type User } from "next-auth";
import Head from "next/head";
import { prisma } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";
import { type ConvoRating, type Org, type Project } from "@prisma/client";
import superjson from "superjson";
import AppNav from "~/containers/Nav/AppNav";
import { api } from "~/utils/api";
import { isAbovePro } from "~/utils/license";


const ProjectDashboard: NextPage<{ user: User, orgJson: string, projectJson: string }> = ({ user, orgJson, projectJson }) => {
  const org: Org = superjson.parse(orgJson)
  const project: Project = superjson.parse(projectJson)

  const { data: dashboardData, isLoading: isDashboardLoading } = api.project.dashboardData.useQuery({ orgId: org.id, projectId: project.id })

  const weeklyRatingData = dashboardData?.weeklyConversations.reduce((acc, curr) => {
    acc[curr.rating] = curr._count.rating
    return acc
  }, {} as Record<ConvoRating, number>)

  const monthlyRatingData = dashboardData?.weeklyConversations.reduce((acc, curr) => {
    acc[curr.rating] = curr._count.rating
    return acc
  }, {} as Record<ConvoRating, number>)

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
                <div className="text-gray-600">This week</div>
                <div className="bg-gray-100 p-4 rounded-md mt-2 flex justify-between items-center">
                  <div>
                    <p className="text-zinc-500 text-center">Conversations</p>
                    <p className="text-center text-3xl mt-2">{dashboardData?.weeklyCount}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-center">Positive</p>
                    <div className="mt-2">
                      {isAbovePro(org) ? (
                        <p className="text-center text-3xl">{weeklyRatingData?.POSITIVE}</p>
                      ) : (
                        <p className="text-center">Available from Pro</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-center">Negative</p>
                    <div className="mt-2">
                      {isAbovePro(org) ? (
                        <p className="text-center text-3xl">{weeklyRatingData?.NEGATIVE}</p>
                      ) : (
                        <p className="text-center">Available from Pro</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-gray-600 mt-10">This month</div>
                <div className="bg-gray-100 p-4 rounded-md mt-2 flex justify-between items-center">
                  <div>
                    <p className="text-zinc-500 text-center">Conversations</p>
                    <p className="text-center text-3xl mt-2">{dashboardData?.monthlyConversationCount}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-center">Positive</p>
                    <div className="mt-2">
                      {isAbovePro(org) ? (
                        <p className="text-center text-3xl">{monthlyRatingData?.POSITIVE}</p>
                      ) : (
                        <p className="text-center">Available from Pro</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-center">Negative</p>
                    <div className="mt-2">
                      {isAbovePro(org) ? (
                        <p className="text-center text-3xl">{monthlyRatingData?.NEGATIVE}</p>
                      ) : (
                        <p className="text-center">Available from Pro</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className=" w-1/2 px-20">
                <div className="text-gray-600">Usage</div>
                <div className="mt-2 bg-gray-100 rounded-md p-4 w-72">
                  <div className="flex justify-between items-center">
                    <p className="text-zinc-500">Chat credits used</p>
                    <p className="">{project.chatUsed}</p>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <p className=" text-zinc-500">Document storage</p>
                    <p className="">{(Number(project.documentTokens) / 1e6).toFixed(2)} MB</p>
                  </div>
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