import { type GetServerSidePropsContext, type NextPage } from "next";
import { type User } from "next-auth";
import Nav from "~/containers/Nav/Nav";
import { prisma } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";
import { type OrgUser, type Org, type Project } from "@prisma/client";
import superjson from "superjson";
import PrimaryButton from "~/components/form/button";
import Image from "next/image";
import Link from "next/link";

const Users: NextPage<{ user: User, orgJson: string }> = ({ user, orgJson }) => {

  const org: (OrgUser & {
    org: Org & {
      projects: Project[];
    }
  }) | null = orgJson ? superjson.parse(orgJson) : null
  return (
    <>
      {/*
        This example requires updating your template:

        ```
        <html class="h-full">
        <body class="h-full">
        ```
      */}
      <Nav org={org?.org} image={user?.image} />
      <main className="grid  place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
        <div className="text-center">
          {/* <p className="text-base font-semibold text-slate-600">User management</p> */}
          <h1 className="mt-4 text-lg font-bold tracking-tight text-gray-900 sm:text-3xl">User management is under construction</h1>
          {/* <p className="mt-6 text-base leading-7 text-gray-600">Sorry, we couldn’t find the page you’re looking for.</p> */}
          <div className="mt-10 flex items-center justify-center flex-col gap-x-6">
            <Image src="/illus/under-construct.svg" width={400} height={400} alt="under consuryctions"></Image>
            <PrimaryButton className="mt-8">
              <Link href="/">
                Go back
              </Link>
            </PrimaryButton>

          </div>
        </div>
      </main>
    </>
  )
}


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

export default Users