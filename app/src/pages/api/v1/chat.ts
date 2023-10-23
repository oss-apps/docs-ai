import { type NextApiRequest, type NextApiResponse } from "next";
import { getAnswerFromProject } from "~/server/api/routers/docGPT";
import { prisma } from "~/server/db";
import { type HandleChat } from "../web/chat";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  try {

    const { projectId, question, conversationId, userId, additionalFields } = req.body as HandleChat

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

    const result = await getAnswerFromProject(project.orgId, projectId, question, project.botName, conversationId, undefined, project.defaultPrompt, userId, additionalFields)

  return res.status(200).send(result)
  }
  catch (err: any) {
    console.log("api ~ err:", err)
    return res.status(400).send({
      message: "Something happened! Please check your data validity or contact help"
    })

  }
}
