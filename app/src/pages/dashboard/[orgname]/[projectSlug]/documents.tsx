import { type GetServerSidePropsContext, type NextPage } from "next";
import { type User } from "next-auth";
import Head from "next/head";
import { prisma } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";
import { type Document, DocumentType, IndexStatus, type Org, type Project } from "@prisma/client";
import superjson from "superjson";
import PrimaryButton, { SecondaryButton, SmallButton } from "~/components/form/button";
import AppNav from "~/containers/Nav/AppNav";
import { api } from "~/utils/api";
import Link from "next/link";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { IconChatHistory } from "~/components/icons/icons";

const Status = ({ status }: { status: IndexStatus }) => {
  switch (status) {
    case IndexStatus.SUCCESS:
      return <div className="text-sm text-green-600 bg-green-200 p-0.5 rounded-md px-2 h-fit">Indexed</div>
    case IndexStatus.INDEXING:
      return <div className="text-sm text-orange-600 bg-orange-200 p-0.5 rounded-md px-2 h-fit">Indexing</div>
    case IndexStatus.FETCHING:
      return <div className="text-sm text-orange-600 bg-orange-200 p-0.5 rounded-md px-2 h-fit">Fetching</div>
    case IndexStatus.FETCH_DONE:
      return <div className="text-sm text-orange-600 bg-orange-200 p-0.5 rounded-md px-2 h-fit">Fetching done</div>
    case IndexStatus.FETCHING_FAILED:
      return <div className="text-sm text-red-600 bg-red-200 p-0.5 rounded-md px-2 h-fit">Fetching failed</div>
    case IndexStatus.FAILED:
      return <div className="text-sm text-red-600 bg-red-200 p-0.5 rounded-md px-2 h-fit">Failed</div>
  }
}


const Documents: NextPage<{ user: User, orgJson: string, projectJson: string }> = ({ user, orgJson, projectJson }) => {
  const [docToDelete, setDocToDelete] = useState<Document | null>(null)

  const org: Org = superjson.parse(orgJson)
  const project: Project = superjson.parse(projectJson)

  const { data, isLoading, refetch } = api.document.getDocuments.useQuery({ orgId: org.id, projectId: project.id })
  const deleteDocument = api.document.deleteDocument.useMutation()

  const onDelete = async (documentId: string) => {
    await deleteDocument.mutateAsync({ orgId: org.id, projectId: project.id, documentId })
    await refetch()
    setDocToDelete(null)
  }

  const onClose = () => {
    setDocToDelete(null)
  }

  return (
    <>
      <Head>
        <title>Docs AI - Documents</title>
      </Head>
      <main className="h-full">
        <div className="h-full flex">
          <AppNav user={user} org={org} project={project} />
          <div className="w-full">
            <div className="p-2 sm:p-5">
              <div className="flex justify-between items-center m-2 ">
                <h2 className="text-lg text-left">Documents</h2>
                <div className="flex justify-end gap-4">
                  {project.documentTokens ? (
                    <Link href={`/dashboard/${org.name}/${project.slug}/yourbot`} className="hidden sm:block">
                      <SecondaryButton className="mx-auto justify-center gap-2">
                        <IconChatHistory className="w-5 h-5" />
                        Talk to your Docs</SecondaryButton>
                    </Link>
                  ) : null}
                  <Link href={`/dashboard/${org.name}/${project.slug}/new_document`} >
                    <PrimaryButton>
                      Add <span className="hidden sm:block"> &nbsp; document </span>
                    </PrimaryButton>
                </Link>
                </div>
              </div>
              {isLoading ? <div>Loading...</div> :
                data?.documents?.length === 0 ? (
                  <div className="mt-4 border-t">
                    <p className="text-center mt-10">No documents added yet!</p>
                  </div>
                ) : (
                  <div className="border mt-4  rounded-md">
                    <ul>
                      {data?.documents.map((document) => (
                        <li key={document.id} className="p-2 flex gap-3 flex-wrap sm:p-5  sm:grid  sm:grid-cols-3 sm:gap-20 border-b last:border-none">
                          <div className="">
                            <div className="font-semibold">{document.title}</div>
                            <div className="text-sm text-gray-500 ">
                              {document.documentType === DocumentType.URL ?
                                <a href={document.src} className="hover:underline underline-offset-1" target="_blank" rel="noreferrer">
                                  {document.src.slice(0, 60) + (document.src.length > 60 ? '...' : '')}
                                </a> :
                                document.src.slice(0, 60) + (document.src.length > 60 ? '...' : '')} 
                            </div>
                          </div>
                          <div className="flex  items-center gap-4">
                            <Status status={document.indexStatus} />
                            {
                              document.indexStatus !== IndexStatus.SUCCESS && document.documentType !== "FILES" ? (
                                <Link href={`/dashboard/${org.name}/${project.slug}/edit_document?id=${document.id}`}>
                                  <SmallButton>Complete setup</SmallButton>
                                </Link>
                              ) : null
                            }

                          </div>
                          <div className="flex items-center gap-2  ml-auto">
                            {document.documentType !== "FILES" ? (
                              <button>
                                <Link href={`/dashboard/${org.name}/${project.slug}/edit_document?id=${document.id}`}>
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                                  </svg>
                                </Link>
                              </button>
                            ) : null}

                            <button onClick={() => setDocToDelete(document)}>
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>

                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              }
            </div>
          </div>
        </div>
        <Transition appear show={!!docToDelete} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={onClose}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      Are you sure?
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        You are trying to delete the document and this action cannot be reversed.
                      </p>
                    </div>

                    <div className="mt-4 justify-end flex gap-4">
                      <SecondaryButton className="justify-center border border-red-500 text-red-500" onClick={() => onDelete(docToDelete?.id || '')} disabled={deleteDocument.isLoading} loading={deleteDocument.isLoading}>
                        Yes, Delete
                      </SecondaryButton>
                      <PrimaryButton className="border border-gray-700" onClick={onClose}>
                        Cancel
                      </PrimaryButton>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
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

  if (!org || org.org.projects.length === 0) {
    return {
      redirect: {
        destination: `/dashboard/${orgname}`
      }
    }
  }

  const props = { props: { user: session.user, orgJson: superjson.stringify(org.org), projectJson: superjson.stringify(org.org.projects[0]) } }
  return props
}

export default Documents;