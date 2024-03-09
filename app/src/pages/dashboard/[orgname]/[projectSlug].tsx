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
import { Button } from "~/components/form/button";
import Link from "next/link";
import { IconChatHistory } from "~/components/icons/icons";
import CommonSEO from "~/components/seo/Common";


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
        <title>Docs AI | Dashboard</title>
        <CommonSEO />
      </Head>
      <main >
        <div className=" flex">
          <AppNav user={user} org={org} project={project} />
          <div className="p-2 sm:p-5  flex flex-wrap w-full">
            <div className="w-full sm:w-7/12">
              <div className="m-2">
                <div className="text-gray-600">This week</div>
                <div className="bg-gray-100 p-4 rounded-md mt-2 flex gap-3 flex-wrap justify-center sm:justify-between items-center">
                  <div className="text-center">
                    <p className="text-zinc-500 text-center">Conversations</p>
                    <p className="text-center text-3xl mt-2">{dashboardData?.weeklyCount}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-center">Positive</p>
                    <div className="mt-2">
                      {isAbovePro(org) ? (
                        <p className="text-center text-3xl">{weeklyRatingData?.POSITIVE ?? '0'}</p>
                      ) : (
                        <p className="text-center">Available from Pro</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-center">Negative</p>
                    <div className="mt-2">
                      {isAbovePro(org) ? (
                        <p className="text-center text-3xl">{weeklyRatingData?.NEGATIVE ?? '0'}</p>
                      ) : (
                        <p className="text-center">Available from Pro</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="m-2">
                <div className="text-gray-600 m-2">This month</div>
                <div className="bg-gray-100 p-4 rounded-md mt-2 flex gap-3  flex-wrap justify-center sm:justify-between items-center">
                  <div>
                    <p className="text-zinc-500 text-center">Conversations</p>
                    <p className="text-center text-3xl mt-2">{dashboardData?.monthlyConversationCount}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-center">Positive</p>
                    <div className="mt-2">
                      {isAbovePro(org) ? (
                        <p className="text-center text-3xl">{monthlyRatingData?.POSITIVE ?? '0'}</p>
                      ) : (
                        <p className="text-center">Available from Pro</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-center">Negative</p>
                    <div className="mt-2">
                      {isAbovePro(org) ? (
                        <p className="text-center text-3xl">{monthlyRatingData?.NEGATIVE ?? '0'}</p>
                      ) : (
                        <p className="text-center">Available from Pro</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="my-6 text-center">
                  {project.documentTokens ? (
                    <Link href={`/dashboard/${org.name}/${project.slug}/yourbot`}>
                    <Button className="mx-auto justify-center gap-2">
                        <IconChatHistory className="w-5 h-5" primaryClassName="fill-slate-500" secondaryClassName="fill-slate-100" />
                      Talk to your docs</Button>
                    </Link>
                  ) : (
                    <Link className="mx-auto" href={`/dashboard/${org.name}/${project.slug}/new_document`}>
                      <Button className="mx-auto">Add document</Button>
                    </Link>
                  )}
                </div>
              </div>
            <div className="w-full sm:w-5/12">
              <div className="m-2">
                <p className="text-gray-600">Usage</p>
                <div className="mt-2 bg-gray-100 rounded-md p-4">
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