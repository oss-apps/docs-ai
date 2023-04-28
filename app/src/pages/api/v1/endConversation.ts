import { type NextApiRequest, type NextApiResponse } from "next";
import { summarizeConversation } from "~/server/api/routers/conversation";
import { prisma } from "~/server/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { projectId, conversationId } = req.body as { projectId: string, conversationId: string }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      org: true,
    }
  })

  if (!project) return res.status(404).send({ message: 'project not found' })

  const result = await summarizeConversation(project.org, project, conversationId)

  return res.status(200).send(result)
}
