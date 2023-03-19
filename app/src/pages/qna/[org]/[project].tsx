import { type GetServerSidePropsContext, type NextPage } from "next";
import Head from "next/head";
import { prisma } from "~/server/db";
import { type Org, type Project } from "@prisma/client";
import superjson from "superjson";
import { QnA } from "~/containers/QnA/QnA";
import Avatar from "~/components/Avatar";

const QnAPage: NextPage<{ orgJson: string | null, projectJson: string | null }> = ({ orgJson, projectJson }) => {

  const org: Org | null = orgJson ? superjson.parse(orgJson) : null
  const project: Project | null = projectJson ? superjson.parse(projectJson) : null

  if (!org || !project) {
    return (
      <div className="h-full flex">
        <div className="w-full flex justify-center items-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold">404</h1>
            <p className="text-xl">Project not found</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{org.name}</title>
        <meta name="description" content="Create chat bot with your documents in 5 minutes" />
      </Head>
      <main className="h-full">
        <div className="h-full flex">
          <div className="w-full">
            <div className="p-5 px-10">
              <div className=" max-w-5xl mx-auto">
                <div className="flex items-center mt-20 mb-20 justify-center">
                  <Avatar src={org.imageUrl} uid={org.id} />
                  <div className="text-3xl ml-2">{org.name}/{project.name}</div>
                </div>
                <QnA org={org} project={project} />
              </div>
            </div>
            <div className="text-center sticky bottom-0 text-sm">Powered by <a href="https://docsai.app" className="text-cyan-500">DocsAI.app</a></div>
          </div>
        </div>
      </main>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const orgname = context.query.org as string
  const projectSlug = context.query.project as string

  const org = await prisma.org.findFirst({
    where: {
      name: orgname,
      projects: {
        some: {
          slug: projectSlug
        }
      }
    },
    include: {
      projects: true
    }
  })

  const props = {
    props: {
      orgJson: org ? superjson.stringify(org) : null,
      projectJson: org?.projects[0] ? superjson.stringify(org?.projects[0]) : null
    }
  }
  return props
}

export default QnAPage;