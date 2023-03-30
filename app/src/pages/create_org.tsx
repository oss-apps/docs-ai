import { type GetServerSidePropsContext, type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Nav from "~/containers/Nav";
import { prisma } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";
import { User, type Org } from "@prisma/client";
import { CreateOrg } from "~/containers/CreateOrg";


const CreateOrgPage: NextPage<{ user: User }> = ({ user }) => {

  return (
    <div className="h-full">
      <Nav />
      <main className="p-5">
        <div className="max-w-6xl mx-auto mt-10">
					<div className=" max-w-2xl mx-auto">
						<CreateOrg />
					</div>
        </div>
      </main>
    </div>
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


  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id
    }
  })

  const props = { props: { user } }
  return props
}

export default CreateOrgPage;