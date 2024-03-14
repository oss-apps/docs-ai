/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { type GetServerSidePropsContext, type NextPage } from "next";
import { type User } from "next-auth";
import Head from "next/head";
import Nav from "~/containers/Nav/Nav";
import { prisma } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";
import { type OrgUser, type Org, type Project } from "@prisma/client";
import superjson from "superjson";
import Link from "next/link";
import { Button } from "~/components/form/button";
import Avatar from "~/components/Avatar";
import { IconAdd } from "~/components/icons/icons";
import CommonSEO from "~/components/seo/Common";


const OrgDashboard: NextPage<{ user: User, orgJson: string }> = ({ user, orgJson }) => {
  const org: (OrgUser & {
    org: Org & {
      projects: Project[];
    }
  }) | null = orgJson ? superjson.parse(orgJson) : null

  return (
    <>
      <Head>
        <title>Docs AI - Dashboard</title>
        <CommonSEO />
      </Head>
      <Nav org={org?.org} image={user?.image} />
      <main className="h-full p-3 sm:p-5">
        <div className="max-w-6xl mx-auto mt-10">
          {org ? (
            <div>
              <div className="flex justify-between gap-4 flex-col sm:flex-row items-center">
                <div className="flex gap-4 items-center">
                  <Avatar src={org.org.imageUrl} uid={org.orgId} />
                  <span className="text-3xl">
                    {org.org.name}
                  </span>
                </div>
                <Link href={`/dashboard/${org.org.name}/new`}>
                  <Button className="justify-center gap-2">
                    <IconAdd className="h-5 w-5" primaryClassName="fill-slate-500" secondaryClassName="fill-slate-100" /> New Project</Button>
                </Link>
              </div>
              <div className="mt-10">
                {org.org.projects.length > 0 ? (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
                    {org.org.projects.map((project) => (
                      <Link href={`/dashboard/${org.org.name}/${project.slug}`} key={project.id}>
                        <div key={project.id} className=" bg-slate-100/50 rounded-lg shadow-sm p-4 px-8 h-36 hover:bg-slate-100">
                          <div className="flex items-center">
                            <span className="text-xl font-medium">
                              {project.name}
                            </span>
                          </div>
                          <p className="mt-1   text-slate-600  ">
                            {project.description?.slice(0, 90)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : <p className="text-2xl mt-10">You don&apos;t have any project yet. Please create one.</p>}
              </div>
            </div>
          ) : <p className="text-2xl mt-10 text-center">You are not part of this organization, request the org owner for access</p>}

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

  const org = await prisma.orgUser.findFirst({
    where: {
      userId: session.user.id,
      org: {
        name: orgname
      }
    },
    include: {
      org: {
        include: {
          projects: true
        }
      }

    }
  })

  const props = { props: { user: session.user, orgJson: org ? superjson.stringify(org) : null } }
  return props
}

export default OrgDashboard;