// src/pages/api/examples.ts
import { IndexStatus } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";


const docgptHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const secret = req.headers.authorization
  if (secret !== process.env.DOCGPT_SECRET) {
    return res.status(401).send({ message: 'Wrong secret key provided' })
  }

  const { documentId, title, error } = req.body as { documentId: string, title: string, error?: string };

  await prisma.document.update({
    where: { id: documentId },
    data: {
      title,
      indexStatus: error ? IndexStatus.FAILED : IndexStatus.SUCCESS
    },
  })
  
  res.status(200).send({ message: 'success' })
};

export default docgptHandler;
