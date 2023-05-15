import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "~/server/db";
import { runCorsMiddleware } from "~/utils/api";
import { getContrastColor } from "~/utils/color";

export default async function handleProject(req: NextApiRequest, res: NextApiResponse) {
  await runCorsMiddleware(req, res)

  const { projectId } = req.query
  if (!projectId) {
    res.status(400).send({ message: 'Bad Requeest , No projectId' })
    return
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId?.toString() },
    select: {
      id: true,
      name: true,
      primaryColor: true,
      initialQuestion: true,
    }
  })

  if (!project) {
    res.status(404).send({ message: 'Project Not Found' })
    return
  }
  const projectDetails = { ...project, textColor: getContrastColor(project?.primaryColor) }
  res.send(projectDetails)
}
