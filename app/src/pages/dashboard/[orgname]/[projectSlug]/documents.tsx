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


const Documents: NextPage<{ user: User, orgJson: string, projectJson: string }> = ({ user, orgJson, projectJson }) => {
  const [docToDelete, setDocToDelete] = useState<Document | null>(null)
  const [docToReIndex, setDocToReIndex] = useState<Document | null>(null)

  const org: Org = superjson.parse(orgJson)
  const project: Project = superjson.parse(projectJson)

  const { data, isLoading, refetch } = api.document.getDocuments.useQuery({ orgId: org.id, projectId: project.id })
  const retry = api.document.reIndexDocument.useMutation()
  const deleteDocument = api.document.deleteDocument.useMutation()

  const onRetry = async (documentId: string) => {
    await retry.mutateAsync({ orgId: org.id, projectId: project.id, documentId })
    await refetch()
    setDocToReIndex(null)
  }

  const onDelete = async (documentId: string) => {
    await deleteDocument.mutateAsync({ orgId: org.id, projectId: project.id, documentId })
    await refetch()
    setDocToDelete(null)
  }

  const onClose = () => {
    setDocToDelete(null)
    setDocToReIndex(null)
  }

  return (
    <>
      <Head>
        <title>Docs AI - Documents</title>
        <meta name="description" content="Create chat bot with your documents in 5 minutes" />
      </Head>
      <main className="h-full">
        <div className="h-full flex">
          <AppNav user={user} org={org} project={project} />
          <div className="w-full">
            <div className="p-5 px-10">
              <div className="flex justify-between">
                <h2 className="text-lg">Documents</h2>
                <Link href={`/dashboard/${org.name}/${project.slug}/new_document`}>
                  <PrimaryButton>+ Add document</PrimaryButton>
                </Link>
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
                        <li key={document.id} className="p-5 flex justify-between items-center border-b last:border-none">
                          <div>
                            <div className="font-semibold">{document.title}</div>
                            <div className="text-sm text-gray-500 truncate max-w-2xl">
                              {document.documentType === DocumentType.URL ?
                                <a href={document.src} className="hover:underline underline-offset-1" target="_blank" rel="noreferrer">
                                  {document.src}
                                </a> :
                                document.src}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {
                              document.indexStatus === IndexStatus.SUCCESS ?
                                <div className="text-sm text-green-600 bg-green-200 p-0.5 rounded-md px-2">Indexed</div> :
                                document.indexStatus === IndexStatus.INDEXING ?
                                  <div className="text-sm text-orange-600 bg-orange-200 p-0.5 rounded-md px-2">Indexing</div> :
                                  <div className="flex">
                                    <div className="text-sm text-red-600 bg-red-200 p-0.5 rounded-md px-2">Failed</div>
                                    <SmallButton
                                      className="ml-2"
                                      onClick={() => onRetry(document.id)}>
                                      Retry
                                    </SmallButton>
                                  </div>
                            }

                            <button onClick={() => setDocToReIndex(document)}>
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                              </svg>
                            </button>
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
        <Transition appear show={!!docToDelete || !!docToReIndex} as={Fragment}>
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
                        {docToDelete ? 'You are trying to delete the document and this action cannot be reversed' : 'You are try to re-index the documents'}
                      </p>
                    </div>

                    <div className="mt-4 flex gap-4">
                      {docToDelete ? (
                        <PrimaryButton onClick={() => onDelete(docToDelete.id)} disabled={deleteDocument.isLoading} loading={deleteDocument.isLoading}>
                          Yes, Delete
                        </PrimaryButton>
                      ) : (
                        <PrimaryButton onClick={() => onRetry(docToReIndex!.id)} disabled={retry.isLoading} loading={retry.isLoading}>
                          Yes, Re-Index
                        </PrimaryButton>
                      )}
                      <SecondaryButton className="border border-gray-700" onClick={onClose}>
                        Cancel
                      </SecondaryButton>
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