import { type GetServerSidePropsContext, type NextPage } from "next";
import { type User } from "next-auth";
import Head from "next/head";
import { prisma } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";
import { type OrgUser, type Org, type Project, DocumentType, type Document } from "@prisma/client";
import superjson from "superjson";
import AppNav from "~/containers/Nav/AppNav";
import { URLDocument } from "~/containers/NewDocument/URLDocument";
import { useRouter } from 'next/router'
import { TextDocument } from "~/containers/NewDocument/TextDocument";
import NavBack from "~/components/NavBack";
import { api } from "~/utils/api";
import { type ParsedDocs, type ParsedUrls } from "~/types";
import { getRedisClient } from "~/server/cache";


const EditDocument: NextPage<{ user: User, orgJson: string, projectJson: string, documentJson: string }> = ({ user, orgJson, projectJson, documentJson }) => {
  const router = useRouter()
  const { docType } = router.query as { docType: string, orgname: string, projectSlug: string }


  const org: Org = superjson.parse(orgJson)
  const project: Project = superjson.parse(projectJson)
  const document: Document & { parsedUrls: ParsedUrls } = superjson.parse(documentJson)

  console.log(document.parsedUrls)

  return (
    <>
      <Head>
        <title>Docs AI - Dashboard</title>
        <meta name="description" content="Create chat bot with your documents in 5 minutes" />
      </Head>
      <main className="h-full">
        <div className="h-full flex">
          <AppNav user={user} org={org} project={project} />
          <div className="w-full">
            <div className="max-w-4xl mx-auto mt-5">
              <div className="max-w-2xl mx-auto">
                <NavBack href={!docType ? `/dashboard/${org.name}/${project.slug}/documents` : `/dashboard/${org.name}/${project.slug}/new_document`} />
                <div className="mt-10">
                  <CreateDocumentForm org={org} project={project} docType={document.documentType} document={document} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

const CreateDocumentForm: React.FC<{ org: Org, project: Project, docType: DocumentType, document: Document & { parsedUrls: ParsedUrls } }> =
  ({ org, project, docType, document }) => {
    if (docType === DocumentType.TEXT) {
      return <TextDocument org={org} project={project} document={document} />
    }

    return <URLDocument org={org} project={project} document={document} />
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

  const parsedDocuments = JSON.parse(await (await getRedisClient())
    .get(`docs:${id}`) || '[]') as ParsedDocs

  const parsedUrls = parsedDocuments.map(d => ({ url: d.metadata.source as string, size: Number(d.metadata.size) }))

  const props = {
    props: {
      user: session.user,
      orgJson: superjson.stringify(org.org),
      projectJson: superjson.stringify(org.org.projects[0]),
      documentJson: superjson.stringify({ ...org.org.projects[0].documents[0], parsedUrls })
    }
  }
  return props
}

export default EditDocument;