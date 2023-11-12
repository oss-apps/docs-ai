import { type Org, type Project, type Document } from "@prisma/client"
import { Button } from "~/components/form/button"
import { IconConfluence } from "~/components/icons/icons";
import { env } from "~/env.mjs";

export const ConfluenceDocument: React.FC<{ org: Org, project: Project, newDocument?: boolean, document?: Document }> = ({ project, org, newDocument = false, document, }) => {
  const url = `${env.NEXT_PUBLIC_CONFLUENCE_AUTHORIZATION_URL}&state=${org.id},${project.id}`

  console.log("🔥 ~ url:", url)
  return (<>
    Hi i am new confluence
    <div className="text-center mt-4">
      <Button variant='outline' size="sm">
        <a href={url} className="flex gap-2"><IconConfluence /> Confluence</a>
      </Button>
    </div>
  </>)
}