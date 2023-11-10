import { type GetServerSidePropsContext, type NextPage } from "next";
import Head from "next/head";
import { prisma } from "~/server/db";
import { type Org, type Project } from "@prisma/client";
import superjson from "superjson";
import Avatar from "~/components/Avatar";
import { ChatBox } from "~/containers/Chat/Chat";

// Hide chat widget for chat page
if (typeof window !== "undefined") {
  const root = document.getElementById('docsai-root');
  if (root) {
    root.style.display = 'none';
  }
}

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
        <meta property="og:title" content={project.botName} />
        <meta name="description" content={project.description || 'Create AI Support Agents with your docs'} />
        <meta property="og:image" content="https://docsai.app/images/og-app.jpeg" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:width" content="1200" />
        <meta property="twitter:title" content={project.botName} />
        <meta property="og:url" content={`https://docsai.app/chat/${project.id}`}></meta>
        <meta property="twitter:description" content={project.description || 'Create AI Support Agents with your docs'} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:image" content="https://docsai.app/images/og-app.jpeg" />
        <meta property="og:type" content="website"></meta>
        <link rel="icon" href="/images/favicon.ico" />
      </Head>
      <main className="h-full">
        <div className="h-full flex">
          <div className="w-full">
            <div className="lg:p-5 lg:px-10 p-0">
              <div className="lg:max-w-5xl mx-auto max-w-full">
                <div className="lg:flex items-center mb-4 justify-center hidden">
                  <Avatar src={org.imageUrl} uid={org.id} size={20} />
                  <div className="text-xl ml-2">{org.name}/{project.name}</div>
                </div>
                <ChatBox org={org} project={project} />
              </div>
            </div>
            <div className="text-center text-xs font-light">Powered by <a target="_blank" href="https://docsai.app" className="text-cyan-500" rel="noreferrer">DocsAI.app</a></div>
          </div>
        </div>
      </main>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const projectId = context.query.projectId as string

  const project = await prisma.project.findUnique({
    where: {
      id: projectId
    },
    include: {
      org: true
    }
  })

  const props = {
    props: {
      orgJson: project?.org ? superjson.stringify(project.org) : null,
      projectJson: project ? superjson.stringify(project) : null
    }
  }
  return props
}

export default QnAPage;