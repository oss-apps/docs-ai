import { type GetServerSidePropsContext, type NextPage } from "next";
import { type User } from "next-auth";
import Head from "next/head";
import { prisma } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";
import { type OrgUser, type Org, type Project, DocumentType } from "@prisma/client";
import superjson from "superjson";
import AppNav from "~/containers/AppNav/AppNav";
import { Tab } from '@headlessui/react'
import classNames from "classnames";
import { URLDocument } from "~/containers/NewDocument/URLDocument";
import { useRouter } from 'next/router'
import { TextDocument } from "~/containers/NewDocument/TextDocument";


function getDocType(type: number) {
  if (type === 1) return DocumentType.TEXT

  return DocumentType.URL
}

const NewDocument: NextPage<{ user: User, orgJson: string, projectJson: string }> = ({ user, orgJson, projectJson }) => {
  const org: Org = superjson.parse(orgJson)
  const project: Project = superjson.parse(projectJson)
  const router = useRouter()

  const { docType, orgname, projectSlug } = router.query as { docType: string, orgname: string, projectSlug: string }

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
            <div className="max-w-4xl mx-auto mt-20">
              <div className="mx-auto">
                <Tab.Group defaultIndex={docType === DocumentType.TEXT ? 1 : 0} onChange={index => router.push(`/dashboard/${orgname}/${projectSlug}/new_document?docType=${getDocType(index)}`, undefined, { shallow: true })} >
                  <Tab.List className="flex space-x-2 rounded-md border p-2 border-black max-w-sm mx-auto">
                    <Tab className={({ selected }) =>
                      classNames(
                        'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                        'ring-white ring-opacity-60 ring-offset-2 ring-offset-white focus:outline-none focus:ring-2',
                        selected
                          ? 'bg-black shadow text-white'
                          : 'text-black hover:bg-gray-100'
                      )
                    }>URL</Tab>
                    <Tab className={({ selected }) =>
                      classNames(
                        'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                        'ring-white ring-opacity-60 ring-offset-2 ring-offset-white focus:outline-none focus:ring-2',
                        selected
                          ? 'bg-black shadow text-white'
                          : 'text-black hover:bg-gray-100'
                      )
                    }>Text</Tab>
                  </Tab.List>
                  <Tab.Panels>
                    <Tab.Panel className="mt-10"><URLDocument org={org} project={project} /></Tab.Panel>
                    <Tab.Panel className="mt-10"><TextDocument org={org} project={project} /></Tab.Panel>
                  </Tab.Panels>
                </Tab.Group>
              </div>

            </div>
          </div>
        </div>
      </main>
    </>
  );
};


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