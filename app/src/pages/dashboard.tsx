import { type GetServerSidePropsContext, type NextPage } from "next";
import { type User } from "next-auth";
import Head from "next/head";
import Image from "next/image";
import Nav from "~/containers/Nav";
import { prisma } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";
import { type Org } from "@prisma/client";


const Dashboard: NextPage<{ user: User }> = ({ user }) => {
  return (
    <>
      <Nav />
      <main className="h-full p-5">
        <div className="max-w-6xl mx-auto mt-10">
          <div className="flex items-center">
            {user.image ? (<Image className="rounded-full" alt="profile-pic" src={user.image} width={30} height={30} />) : <div className=" w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" />}

            <span className="ml-4 text-3xl">
              {user.name}
            </span>
          </div>
          <div>
            <p className="text-xl">You don&apos;t have any organization yet. Please create one.</p>
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

  const org = await prisma.orgUser.findFirst({
    where: {
      userId: session.user.id
    },
    include: {
      org: true
    }
  })

  if (org) {
    return {
      redirect: {
        destination: `/dashboard/${org.org.name}`
      }
    }
  }
  const props = { props: { user: session.user } }
  return props
}

export default Dashboard;