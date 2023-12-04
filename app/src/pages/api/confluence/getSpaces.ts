import { type NextApiRequest, type NextApiResponse } from "next";
import { ConfluenceSpace, getConfluenceSpaces, type confluenceSchema } from "~/utils/confluence";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const body = req.body as confluenceSchema
  const spaces = await getConfluenceSpaces(body)
  console.log("🔥 ~ handler ~ spaces:", spaces)
  return res.status(spaces.status).send(spaces)

}
