import { type GetServerSidePropsContext, type NextPage } from "next";
import { type User } from "next-auth";
import Head from "next/head";
import { prisma } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";
import { type Org, type Project, DocumentType, type Document } from "@prisma/client";
import superjson from "superjson";
import AppNav from "~/containers/Nav/AppNav";
import { URLDocument } from "~/containers/NewDocument/URLDocument";
import { useRouter } from 'next/router'
import { TextDocument } from "~/containers/NewDocument/TextDocument";
import NavBack from "~/components/NavBack";
import { type ParsedUrls } from "~/types";
import { NotionDocument } from "~/containers/NewDocument/NotionDocument";
import { Client } from "@notionhq/client";
import { type NotionDetails, type NotionList, type NotionPage } from "~/types/notionTypes";

const EditDocument: NextPage<{ user: User, orgJson: string, projectJson: string, documentJson: string, integrationDetailsJson: string }> = ({ user, orgJson, projectJson, documentJson, integrationDetailsJson }) => {
  const router = useRouter()
  const { docType } = router.query as { docType: string, orgname: string, projectSlug: string }

  const org: Org = superjson.parse(orgJson)
  const project: Project = superjson.parse(projectJson)
  const document: Document & {
    documentData: {
      size: number;
      id: string;
      uniqueId: string;
    }[];
    totalSize: number;
  } = superjson.parse(documentJson)

  // type ConditionalType = boolean extends true ? string : number;
  // let variable: ConditionalType = true;

  const integrationDetails: NotionList[] = superjson.parse(integrationDetailsJson)


  return (
    <>
      <Head>
        <title>Docs AI - Dashboard</title>
      </Head>
      <main className="h-full ">
        <div className="w-full flex">
          <AppNav user={user} org={org} project={project} />
          <div className=" w-full">
            <div className="max-w-2xl mx-auto p-2">
                <NavBack href={!docType ? `/dashboard/${org.name}/${project.slug}/documents` : `/dashboard/${org.name}/${project.slug}/new_document`} />
              <div className="mt-4">
                <CreateDocumentForm org={org} project={project} docType={document.documentType} document={document} integrationDetails={integrationDetails} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

const CreateDocumentForm: React.FC<{ org: Org, project: Project, docType: DocumentType, document: Document & { documentData: ParsedUrls, totalSize: number }, integrationDetails: NotionList[] }> =
  ({ org, project, docType, document, integrationDetails }) => {
    if (docType === DocumentType.TEXT) {
      return <TextDocument org={org} project={project} document={document} />
    }
    else if (docType === DocumentType.URL) {
      return <URLDocument org={org} project={project} document={document} />
    }
    else if (docType === DocumentType.NOTION) {
      return <NotionDocument org={org} project={project} document={document} integrationDetails={integrationDetails} />
    }
    return <></>
  }


export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerAuthSession(context)

  if (!session) {
    return {
      redirect: {
        destination: '/'
      }
    }
  }

  const orgname = context.query.orgname as string
  const projectSlug = context.query.projectSlug as string
  const id = context.query.id as string

  const org = await prisma.orgUser.findFirst({
    where: {
      userId: session.user.id,
      org: {
        name: orgname,
      }
    },
    include: {
      org: {
        include: {
          projects: {
            where: {
              slug: projectSlug
            },
            include: {
              documents: {
                where: {
                  id
                },
                include: {
                  documentData: {
                    select: {
                      id: true,
                      uniqueId: true,
                      size: true,
                    },
                    where: {
                      indexed: false,
                    }
                  }
                }
              }
            }
          }
        }
      }

    }
  })

  if (!org || !org.org.projects[0] || !org.org.projects[0].documents[0]) {
    return {
      redirect: {
        destination: `/dashboard/${orgname}`
      }
    }
  }

  let totalSize = 0
  for (const doc of org.org.projects[0].documents[0].documentData) {
    totalSize += doc.size
  }

  const document = org.org.projects[0].documents[0]
  const lists = []

  if (document.documentType === 'NOTION') {
    const notion = new Client({
      auth: (document.details as NotionDetails).access_token,
      notionVersion: "2022-02-22"
    })

    let cursor: string | undefined;
    while (true) {
      const list = await notion.search({ filter: { value: "page", property: "object" }, start_cursor: cursor })
      lists.push(...list.results)
      if (list.has_more) {
        cursor = list.next_cursor as string
        continue;
      }
      else {
        break;
      }
    }
  }

  const notionLists = getNotionParents(lists)

  const props = {
    props: {
      user: session.user,
      orgJson: superjson.stringify(org.org),
      projectJson: superjson.stringify(org.org.projects[0]),
      documentJson: superjson.stringify({ ...document, totalSize }),
      integrationDetailsJson: superjson.stringify(notionLists)
    }
  }
  return props
}


const getNotionParents = (args: any[]) => {
  const lists = args as NotionPage[]
  const result: NotionList[] = []
  for (let i = 0; i < lists.length; i++) {
    const each = lists[i]

    // Edge cases
    if (!each) continue
    if (each.parent.type != 'workspace') continue

    const title = each.properties?.title?.title[0]?.plain_text ?? 'Untitled Document'
    const details = {
      id: each.id,
      title,
      icon: each.icon,
      url: each.url
      // content: each.properties.title.title[0].text
    }
    result.push(details)
  }
  return result
}

export default EditDocument;

