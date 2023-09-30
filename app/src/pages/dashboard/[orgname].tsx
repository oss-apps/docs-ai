/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { type GetServerSidePropsContext, type NextPage } from "next";
import { type User } from "next-auth";
import Head from "next/head";
import Image from "next/image";
import Nav from "~/containers/Nav/Nav";
import { prisma } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";
import { type OrgUser, type Org, type Project } from "@prisma/client";
import superjson from "superjson";
import Link from "next/link";
import PrimaryButton from "~/components/form/button";
import Avatar from "~/components/Avatar";
import { IconAdd } from "~/components/icons/icons";


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
      </Head>
      <Nav org={org?.org} />
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
                  <PrimaryButton className="justify-center gap-2">
                    <IconAdd className="h-5 w-5" primaryClassName="fill-slate-500" secondaryClassName="fill-slate-100" /> New Project</PrimaryButton>
                </Link>
              </div>
              <div className="mt-10">
                {org.org.projects.length > 0 ? (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
                    {org.org.projects.map((project) => (
                      <Link href={`/dashboard/${org.org.name}/${project.slug}`} key={project.id}>
                        <div key={project.id} className=" bg-gray-100 rounded-lg shadow-sm p-4 px-8 h-36 hover:bg-gray-200">
                          <div className="flex items-center">
                            <span className="text-xl">
                              {project.name}
                            </span>
                          </div>
                          <p className="mt-1 text-gray-500">
                            {project.description}
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