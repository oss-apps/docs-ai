import { type NextApiRequest, type NextApiResponse } from "next";
import { getAnswerFromProject } from "~/server/api/routers/docGPT";
import { prisma } from "~/server/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { projectId, question, conversationId } = req.body as { projectId: string, question: string, conversationId: string }

  const apiKey = req.headers.authorization?.split(' ')[1]

  if (!apiKey) return res.status(401).send({ message: 'unauthourised request' })

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      projectToken: true,
    }
  })

  if (!project) return res.status(404).send({ message: 'project not found' })

  if (project.projectToken?.projectApiKey !== apiKey) return res.status(401).send({ message: 'unauthourised request' })

  const result = await getAnswerFromProject(project.orgId, projectId, question, project.botName, conversationId)

  return res.status(200).send(result)
}
