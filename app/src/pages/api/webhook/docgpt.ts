// src/pages/api/examples.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";


const docgptHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log(JSON.stringify(req.body))

  const secret = req.headers.authorization
  if (secret !== process.env.DOCGPT_SECRET) {
    return res.status(401).send({ message: 'Wrong secret key provided' })
  }

  const { documentId, title } = req.body as { documentId: string, title: string };
  await prisma.document.update({
    where: { id: documentId },
    data: {
      indexed: true,
      title,
    },
  })
  
  res.status(200).send({ message: 'success' })
};

export default docgptHandler;
