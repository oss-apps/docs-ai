import { type GetServerSidePropsContext, type NextPage } from "next";
import { type User } from "next-auth";
import Head from "next/head";
import { prisma } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";
import { type OrgUser, type Org, type Project, DocumentType } from "@prisma/client";
import superjson from "superjson";
import AppNav from "~/containers/Nav/AppNav";
import { Tab } from '@headlessui/react'
import classNames from "classnames";
import { URLDocument } from "~/containers/NewDocument/URLDocument";
import { useRouter } from 'next/router'
import { TextDocument } from "~/containers/NewDocument/TextDocument";
import NavBack from "~/components/NavBack";
import { useState } from "react";


function getDocType(type: number) {
  if (type === 1) return DocumentType.TEXT

  return DocumentType.URL
}

enum NewDocumentType {
  URL= 1,
  GITBOOK,
  TEXT,
}

const NewDocument: NextPage<{ user: User, orgJson: string, projectJson: string }> = ({ user, orgJson, projectJson }) => {
  const router = useRouter()
  const { docType, orgname, projectSlug } = router.query as { docType: string, orgname: string, projectSlug: string }


  const org: Org = superjson.parse(orgJson)
  const project: Project = superjson.parse(projectJson)


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
              <NavBack href={!docType ? `/dashboard/${org.name}/${project.slug}/documents` : `/dashboard/${org.name}/${project.slug}/new_document`} />
              <p className="mt-10 text-lg text-gray-800">{!docType ? 'Available sources' : null}</p>
              { docType ? (
                <div className="max-w-2xl mx-auto">
                  <CreateDocumentForm org={org} project={project} docType={Number(docType)} />
                </div>
              ) : (

                <div className="flex gap-12 flex-wrap mt-10">
                  <DocumentSource name="Web" url={`/dashboard/${org.name}/${project.slug}/new_document?docType=${NewDocumentType.URL}`} />
                  <DocumentSource name="Gitbook" url={`/dashboard/${org.name}/${project.slug}/new_document?docType=${NewDocumentType.GITBOOK}`} />
                  <DocumentSource name="Text" url={`/dashboard/${org.name}/${project.slug}/new_document?docType=${NewDocumentType.TEXT}`} />
                  <DocumentSource name="Notion" />
                  <DocumentSource name="PDF" />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

const CreateDocumentForm: React.FC<{ org: Org, project: Project, docType: NewDocumentType }> = ({ org, project, docType}) => {
  if (docType === NewDocumentType.GITBOOK) {
    return <URLDocument org={org} project={project} urlType="gitbook" />
  }

  if (docType === NewDocumentType.TEXT) {
    return <TextDocument org={org} project={project} />
  }

  return <URLDocument org={org} project={project} />
}


const DocumentSource: React.FC<{ name: string, url?: string }> = ({ name, url }) => {
  const router = useRouter()

  return (
    <button className="border rounded-md h-32 w-32 flex justify-center items-center flex-col" onClick={() => url ? router.push(url) : null}>
      <div className="text-3xl font-light text-gray-800">{name}</div>
      <p className="text-xs text-gray-600">{!url ? 'Comming soon' : ''}</p>
    </button>
  )
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
            }
          }
        }
      }

    }
  })

  if (!org) {
    return {
      redirect: {
        destination: `/dashboard/${orgname}`
      }
    }
  }

  const props = {
    props: {
      user: session.user,
      orgJson: superjson.stringify(org.org),
      projectJson: superjson.stringify(org.org.projects[0])
    }
  }
  return props
}

export default NewDocument;