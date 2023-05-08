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
import { FileDocument } from "~/containers/NewDocument/FileDocument";


function getDocType(type: number) {
  if (type === 1) return DocumentType.TEXT

  return DocumentType.URL
}


const NewDocument: NextPage<{ user: User, orgJson: string, projectJson: string }> = ({ user, orgJson, projectJson }) => {
  const router = useRouter()
  const { docType } = router.query as { docType: DocumentType, orgname: string, projectSlug: string }


  const org: Org = superjson.parse(orgJson)
  const project: Project = superjson.parse(projectJson)


  return (
    <>
      <Head>
        <title>Docs AI - Dashboard</title>
      </Head>
      <main className="h-full">
        <div className="h-full flex">
          <AppNav user={user} org={org} project={project} />
          <div className="w-full">
            <div className="max-w-4xl mx-auto mt-5">
              <NavBack href={!docType ? `/dashboard/${org.name}/${project.slug}/documents` : `/dashboard/${org.name}/${project.slug}/new_document`} />
              <p className="mt-10 text-lg text-gray-800">{!docType ? 'Available sources' : null}</p>
              {docType ? (
                <div className="max-w-2xl mx-auto">
                  <CreateDocumentForm org={org} project={project} docType={docType} />
                </div>
              ) : (

                <div className="flex gap-12 flex-wrap mt-10">
                  <DocumentSource name="Web" url={`/dashboard/${org.name}/${project.slug}/new_document?docType=${DocumentType.URL}`} />
                  <DocumentSource name="Text" url={`/dashboard/${org.name}/${project.slug}/new_document?docType=${DocumentType.TEXT}`} />
                  <DocumentSource name="Files" url={`/dashboard/${org.name}/${project.slug}/new_document?docType=${DocumentType.FILES}`} />
                  <DocumentSource name="Notion" />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

const CreateDocumentForm: React.FC<{ org: Org, project: Project, docType: DocumentType }> = ({ org, project, docType }) => {
  if (docType === DocumentType.TEXT) {
    return <TextDocument org={org} project={project} />
  } else if (docType === DocumentType.FILES) {
    return <FileDocument project={project} org={org} />
  }

  return <URLDocument org={org} project={project} />
}


const DocumentSource: React.FC<{ name: string, url?: string }> = ({ name, url }) => {
  const router = useRouter()

  return (
    <button className="border rounded-md h-32 w-32 flex justify-center items-center flex-col" onClick={() => url ? router.push(url) : null}>
      <div className="text-3xl font-light text-gray-800">{name}</div>
      <p className="text-xs text-gray-600">{!url ? 'Coming soon' : ''}</p>
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