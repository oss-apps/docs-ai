import { type NextApiRequest, type NextApiResponse } from "next";
import { getAnswerFromProject } from "~/server/api/routers/docGPT";
import { prisma } from "~/server/db";


export default async function handleChat(req: NextApiRequest & { userId?: number }, res: NextApiResponse) {
  const { projectId, question, conversationId, userId } = req.body as { projectId: string, question: string, conversationId?: string, userId: string }

  console.log('handleChat', projectId, question, conversationId, userId)
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      org: true,
    }
  })

  if (!project) return res.status(404).send({ message: 'project not found' })
  if (!project.public) return res.status(401).send({ message: 'unauthourised request' })

  const encoder = new TextEncoder();

  const callback = (message: string) => {
    res.write(encoder.encode(message));
  }

  try {
    const convo = await getAnswerFromProject(project.orgId, project.id, question, project.botName, conversationId === 'new' ? undefined : conversationId, callback, project.defaultPrompt, userId)
    if (convo.conversationId) {
      res.write(encoder.encode(`DOCSAI_CONVO_ID:${convo.conversationId}`));
    }
    res.end()
  } catch (e) {
    console.error('Error in getting answer', e)
    res.status(500).send({ message: 'Internal server error' })
  }
}


