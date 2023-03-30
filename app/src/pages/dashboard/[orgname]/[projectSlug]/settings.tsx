import { type GetServerSidePropsContext, type NextPage } from "next";
import { type User } from "next-auth";
import Head from "next/head";
import { prisma } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";
import { type Org, type Project } from "@prisma/client";
import superjson from "superjson";
import AppNav from "~/containers/AppNav/AppNav";


const SettingsPage: NextPage<{ user: User, orgJson: string, projectJson: string }> = ({ user, orgJson, projectJson }) => {
  const org: Org = superjson.parse(orgJson)
  const project: Project & {
    slackInstalation: {
        id: string;
        teamName: string;
    } | null } = superjson.parse(projectJson)


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
            <div className="mt-10 p-5 px-10">
              <div className="max-w-5xl mx-auto">
								<p className="text-gray-800 text-lg">Integrations</p>
								<div className="mt-4 border-t" />
								<div className="mt-4 flex p-4 bg-gray-100 rounded-md items-center justify-between">
									{ project.slackInstalation ? (
										<div>
											Slack connected with the workspace <span className="bg-orange-100 text-orange-500 p-1 rounded">{project.slackInstalation.teamName}</span>
										</div>
									) : (
										<>
											<p>Connect slack to ask questions in your channels</p>
											<a href={`https://slack.com/oauth/v2/authorize?client_id=5026673231779.5023868711141&scope=app_mentions:read,chat:write,commands&state=${project.id}`}>
												<img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" />
											</a>
										</>
									)}
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
            },
						include: {
							slackInstalation: {
								select: {
									id: true,
									teamName: true,
								}
							},
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

  const props = { props: { 
    user: session.user,
    orgJson: superjson.stringify(org.org),
    projectJson: superjson.stringify(org.org.projects[0]),
	}}
  return props
}

export default SettingsPage;