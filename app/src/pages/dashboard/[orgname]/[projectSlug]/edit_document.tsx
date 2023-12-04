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
import { ConfluenceDocument } from "~/containers/NewDocument/ConfluenceDocument";

const EditDocument: NextPage<{ user: User, orgJson: string, projectJson: string, documentJson: string }> = ({ user, orgJson, projectJson, documentJson }) => {
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
                <CreateDocumentForm org={org} project={project} docType={document.documentType} document={document} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

const CreateDocumentForm: React.FC<{ org: Org, project: Project, docType: DocumentType, document: Document & { documentData: ParsedUrls, totalSize: number } }> =
  ({ org, project, docType, document }) => {
    if (docType === DocumentType.TEXT) {
      return <TextDocument org={org} project={project} document={document} />
    }
    else if (docType === DocumentType.URL) {
      return <URLDocument org={org} project={project} document={document} />
    }
    else if (docType === DocumentType.NOTION) {
      return <NotionDocument org={org} project={project} document={document} />
    }
    else if (docType === DocumentType.CONFLUENCE) {
      return <ConfluenceDocument org={org} project={project} document={document} />
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


  const props = {
    props: {
      user: session.user,
      orgJson: superjson.stringify(org.org),
      projectJson: superjson.stringify(org.org.projects[0]),
      documentJson: superjson.stringify({ ...document, totalSize }),
    }
  }
  return props
}




export default EditDocument;

