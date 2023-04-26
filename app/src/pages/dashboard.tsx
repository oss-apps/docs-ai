import { type GetServerSidePropsContext, type NextPage } from "next";
import Nav from "~/containers/Nav/Nav";
import { prisma } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";
import { type User, type Org } from "@prisma/client";
import { CreateOrg } from "~/containers/CreateOrg";
import superjson from "superjson";


const Dashboard: NextPage<{ userJson: string }> = ({ userJson }) => {
  const user: User = superjson.parse(userJson);

  return (
    <div className="h-full">
      <Nav />
      <main className="p-5">
        <div className="max-w-6xl mx-auto mt-10">
          {!user.approved ? (
            <div className="flex items-center">
              <span className="text-2xl">
                Hello, {user.name}
              </span>
            </div>
          ) : null}
          <div className="mt-10">
            {!user.approved ? (
              <div className="text-xl">
                You are still on waiting list. Hang tight, we will let you in!
              </div>
            ) : (
              <div className=" max-w-2xl mx-auto">
                <CreateOrg />
              </div>
            )}
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

  const org = await prisma.orgUser.findFirst({
    where: {
      userId: session.user.id
    },
    include: {
      org: true
    }
  })

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id
    }
  })

  if (org) {
    return {
      redirect: {
        destination: `/dashboard/${org.org.name}`
      }
    }
  }
  const props = { props: { userJson: superjson.stringify(user) } }
  return props
}

export default Dashboard;