import { type GetServerSidePropsContext, type NextPage } from "next";
import { type User } from "next-auth";
import Head from "next/head";
import { prisma } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";
import { type Document, DocumentType, IndexStatus, type Org, type Project } from "@prisma/client";
import superjson from "superjson";
import PrimaryButton, { SecondaryButton, SmallButton, SmallSecondaryButton } from "~/components/form/button";
import AppNav from "~/containers/Nav/AppNav";
import { api } from "~/utils/api";
import Link from "next/link";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { IconAdd, IconChatHistory, IconConfluence, IconNotion } from "~/components/icons/icons";
import { Clock, Files, FileText, Globe } from "lucide-react";
import { formatDistanceToNow } from 'date-fns'
import Image from "next/image";
import CommonSEO from "~/components/seo/Common";

const Status = ({ status }: { status: IndexStatus }) => {
  switch (status) {
    case IndexStatus.SUCCESS:
      return <span className="text-sm  text-green-600 bg-green-200 p-0.5 rounded-md px-2 h-fit">Indexed</span>
    case IndexStatus.INDEXING:
      return <span className="text-sm text-orange-600 bg-orange-200 p-0.5 rounded-md px-2 h-fit">Indexing</span>
    case IndexStatus.FETCHING:
      return <span className="text-sm text-orange-600 bg-orange-200 p-0.5 rounded-md px-2 h-fit">Fetching</span>
    case IndexStatus.FETCH_DONE:
      return <span className="text-sm text-orange-600 bg-orange-200 p-0.5 rounded-md px-2 h-fit">Fetching done</span>
    case IndexStatus.FETCHING_FAILED:
      return <span className="text-sm text-red-600 bg-red-200 p-0.5 rounded-md px-2 h-fit">Fetching failed</span>
    case IndexStatus.FAILED:
      return <span className="text-sm text-red-600 bg-red-200 p-0.5 rounded-md px-2 h-fit">Failed</span>
    case IndexStatus.SIZE_LIMIT_EXCEED:
      return <span className="text-sm text-red-600 bg-red-200 p-0.5 rounded-md px-2 h-fit">Size Limit Reached</span>
  }
}

const IconTypes = {
  [DocumentType.URL]: <span title="Website"> <Globe className="w-4 h-4" /> </span>,
  [DocumentType.FILES]: <span title="Files"> <Files className="w-4 h-4" /> </span>,
  [DocumentType.TEXT]: <span title="Plain Text"> <FileText className="w-4 h-4" /> </span>,
  [DocumentType.NOTION]: <span title="Notion"> <IconNotion className="w-4 h-4" /> </span>,
  [DocumentType.CONFLUENCE]: <span title="Notion"> <IconConfluence className="w-4 h-4" /> </span>,
  [DocumentType.CHAT]: null,
  [DocumentType.PDF]: null

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
        <title>Docs AI | Documents</title>
        <CommonSEO />
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
                  {data?.documents?.length ?
                    <Link href={`/dashboard/${org.name}/${project.slug}/new_document`} >
                    <PrimaryButton>
                      <IconAdd className="h-5 w-5 mr-2" primaryClassName="fill-slate-500" secondaryClassName="fill-slate-100" /> Add <span className="hidden sm:block"> &nbsp; document </span>
                    </PrimaryButton>
                    </Link> : null
                  }
                </div>
              </div>
              {isLoading ? <div>Loading...</div> :
                data?.documents?.length === 0 ? (
                  <>
                    <div className="flex justify-center gap-2  border-t p-2 mt-4">
                      <Image src="/illus/add-docs.svg" height={450} width={450} alt="empty chats" className="justify-center my-5" />
                    </div>
                    <p className="text-center text-gray-600"> This is where your documents will live. Add one now! </p>
                    <div className="flex justify-center my-3">
                      <Link href={`/dashboard/${org.name}/${project.slug}/new_document`} >
                        <PrimaryButton>
                          <IconAdd className="h-5 w-5 mr-2" primaryClassName="fill-slate-500" secondaryClassName="fill-slate-100" /> Add <span className="hidden sm:block"> &nbsp; document </span>
                        </PrimaryButton>
                      </Link>
                    </div>
                  </>
                ) : (
                    <>

                      <div className="lg:hidden grid grid-cols-1  gap-4 mt-4">
                        {data?.documents.map((document) => (
                          <div key={document.id} className="rounded-md border p-3 hover:shadow-sm">
                            <p className="font-medium text-base truncate  gap-x-2 items-center">
                              {document.title || document.documentType}</p>
                            <div className="flex items-center gap-x-2 mt-1">
                              {IconTypes[document.documentType]}  <span className="text-sm text-gray-500" title="Last updated at"> {formatDistanceToNow(document.updatedAt, { addSuffix: true })}</span>
                            </div>
                            <div className="text-sm text-gray-500 min-h-[44px] mt-2">
                              {document.documentType === DocumentType.URL ?
                                <a href={document.src} className="hover:underline underline-offset-1" target="_blank" rel="noreferrer">
                                  {document.src.slice(0, 75) + (document.src.length > 75 ? ' ...' : '')}
                                </a> :
                                document.src.slice(0, 75) + (document.src.length > 75 ? ' ...' : '')}
                            </div>
                            <div className="flex justify-between mt-1 flex-wrap gap-y-2">
                              <Status status={document.indexStatus} />
                              <div className="flex items-center gap-4 ">
                                {
                                  document.indexStatus !== IndexStatus.SUCCESS && document.documentType !== "FILES" ? (
                                    <Link href={`/dashboard/${org.name}/${project.slug}/edit_document?id=${document.id}&type=${document.documentType}`}>
                                      <SmallSecondaryButton className=" shadow-none">Complete setup</SmallSecondaryButton>
                                    </Link>
                                  ) : null
                                }
                                {document.documentType !== "FILES" ? (
                                  <button className="border rounded-md p-0.5 hover:bg-slate-100" title="Refresh Document">
                                    <Link href={`/dashboard/${org.name}/${project.slug}/edit_document?id=${document.id}`} tabIndex={-1}>
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                                      </svg>
                                    </Link>
                                  </button>
                                ) : null}

                                <button onClick={() => setDocToDelete(document)} className="border rounded-md p-0.5 hover:bg-slate-100" title="Delete Document">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                  </svg>
                                </button>

                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border mt-4 hidden lg:block  rounded-md">
                        <ul>
                          {data?.documents.map((document) => (
                            <li key={document.id} className="gap-2 lg:p-4  lg:grid  lg:grid-cols-6  border-b last:border-none">
                              <div className="col-span-2">
                                <div className="font-semibold flex gap-2 items-center truncate" title={document.title || ""}>
                                  {IconTypes[document.documentType]}
                                  {document.title && document.title.slice(0, 40) + (document.title.length > 40 ? '...' : '')}
                                  {!document.title && document.documentType}
                                </div>
                                <div className="text-sm text-gray-500 ">
                                  {document.documentType === DocumentType.URL ?
                                    <a href={document.src} className="hover:underline underline-offset-1" target="_blank" rel="noreferrer">
                                      {document.src.slice(0, 60) + (document.src.length > 60 ? '...' : '')}
                                    </a> :
                                    document.src.slice(0, 60) + (document.src.length > 60 ? '...' : '')}
                                </div>
                              </div>
                              <div className="col-span-1">
                                <Status status={document.indexStatus} />
                              </div>
                              <div className="col-span-1">
                                {document.indexStatus !== IndexStatus.SUCCESS && document.documentType !== "FILES" ? (
                                    <Link href={`/dashboard/${org.name}/${project.slug}/edit_document?id=${document.id}&type=${document.documentType}`}>
                                    <SmallButton>Finish</SmallButton>
                                    </Link>
                                  ) : null

                                }
                              </div>
                              <div className="flex col-span-1 gap-x-2 items-center justify-start  text-sm" title="Last updated at">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-500"> {formatDistanceToNow(document.updatedAt, { addSuffix: true })} </span>

                              </div>

                              <div className="flex col-span-1 items-center gap-2  ml-auto">
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

                    </>


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
                      <SecondaryButton className="justify-center" onClick={onClose}>
                        Cancel
                      </SecondaryButton>
                      <PrimaryButton className="justify-center border bg-red-500 hover:bg-red-500/90 text-white disabled:bg-red-500/90" onClick={() => onDelete(docToDelete?.id || '')} disabled={deleteDocument.isLoading} loading={deleteDocument.isLoading}>
                        Delete Forever
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