import { type GetServerSidePropsContext, type NextPage } from "next";
import { prisma } from "~/server/db";
import { type Org, type Project } from "@prisma/client";
import superjson from "superjson";
import { ChatV2 } from "~/containers/Chat/ChatV2";

// Hide chat widget for chat page
if (typeof window !== "undefined") {
  const root = document.getElementById('docsai-root');
  if (root) {
    root.style.display = 'none';
  }
}



const NewChatBot: NextPage<{ orgJson: string | null, projectJson: string | null }> = ({ orgJson, projectJson }) => {

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

  return <ChatV2 org={org} project={project} showFooter />

}

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

export default NewChatBot;