// src/pages/api/examples.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createOrUpdateNewConversation, getHistoryForConvo } from "~/server/api/routers/docGPT";
import { prisma } from "~/server/db";
import * as docGPT from "~/server/docGPT";
import superjson from "superjson";


const chatHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log(JSON.stringify(req.body))

  const { projectId, convoId, question } = req.body as { projectId: string, convoId?: string, question: string };
  
  const project = await prisma.project.findUnique({ where: { id: projectId } });

  if (!project) {
    return res.status(404).send({ message: 'Project not found' })
  }

  try {
    const chatHistory = convoId ? await getHistoryForConvo(convoId) : []
    const result = await docGPT.getGPTChat(projectId, question, chatHistory) as { answer: string, tokens: number };
    const convo = await createOrUpdateNewConversation(projectId, question, result.answer, result.tokens, convoId)
    
    return res.status(200).send({
      conversation: superjson.stringify(convo),
    })
  } catch(e) {
    return res.status(500).send({ message: "Something's wrong" })
  }
};

export default chatHandler;
