import { type Org, type Project, type Document } from "@prisma/client"
import Avatar from "~/components/Avatar";
import PrimaryButton, { Button, SmallSecondaryButton } from "~/components/form/button";
import { IconNotion, IconAdd } from "~/components/icons/icons";
import { env } from "~/env.mjs";
import type { NotionList, CoverOrIcon, NotionDetails } from "~/utils/notion";
import { useState } from "react";
import { api } from "~/utils/api";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/Alert"
import Link from "next/link";
import { BookOpenCheck, FileWarning, LassoSelect } from "lucide-react";
import { useRouter } from "next/router";
import { getLimits } from "~/utils/license";



export const NotionDocument: React.FC<{ org: Org, project: Project, newDocument?: boolean, document?: Document }> = ({ project, org, newDocument = false, document, }) => {

  if (!document) {
    return <NewNotionDocument org={org} project={project} />
  }

  else {
    return <EditNotionDocument org={org} project={project} document={document} />
  }
}


const NewNotionDocument: React.FC<{ org: Org, project: Project }> = ({ project, org }) => {
  const url = `${env.NEXT_PUBLIC_NOTION_AUTHORIZATION_URL}&state=${org.id},${project.id}`
  return (
    <>
      <div className="flex flex-col ">
        <h1 className="text-xl font-semibold  text-center mb-2" >Select the pages you want to train.</h1>
        <div className="text-center mt-4">
          <Button variant='outline' size="sm">
            <a href={url} className="flex gap-2"><IconNotion /> Connect Notion</a>
          </Button>
        </div>
      </div>
    </>
  )
}

const EditNotionDocument: React.FC<{ org: Org, project: Project, document: Document }> = ({ project, org, document, }) => {
  const router = useRouter()
  const notionDetails = document?.details as NotionDetails
  const [skippedUrls, setSkippedUrls] = useState<Record<string, boolean>>(notionDetails?.skippedUrls ?? {})
  const [indexStatus, setIndexStatus] = useState(document.indexStatus)

  const url = `${env.NEXT_PUBLIC_NOTION_AUTHORIZATION_URL}&state=${org.id},${project.id}`

  const indexNotionDocs = api.document.createNotionDocument.useMutation()
  const { data: notionListsDetails, isLoading } = api.document.getOneDocument.useQuery({ documentId: document?.id })
  const limits = getLimits(org.plan)
  const notionPages = notionListsDetails?.integrationDetails as NotionList[]

  const onSkipToggle = (url: string) => {
    const isSkipped = skippedUrls[url]
    setSkippedUrls({ ...skippedUrls, [url]: !isSkipped })
    // setTotalSize(totalSize + (isSkipped ? size : -size))
  }

  const onIndexNotionDocs = async () => {
    setIndexStatus('INDEXING')
    try {

      const args = { projectId: project.id, orgId: org.id, documentId: document.id, details: { ...notionDetails, skippedUrls } }
      await indexNotionDocs.mutateAsync(args)
      await router.push(`/dashboard/${org.name}/${project.slug}/documents`)
    }
    catch (err) {
      await router.push(`/dashboard/${org.name}/${project.slug}/documents`)
    }

  }

  return (
      <section className="mt-8">
        <div className="flex gap-2 items-center">
          {notionDetails.workspace_icon &&
            <Avatar uid={notionDetails.workspace_icon} src={notionDetails.workspace_icon} srcIsUid size={30} square />}
          <h3 className="text-xl font-bold"> {notionDetails.workspace_name} </h3>
        </div>
      {isLoading ? <div className="text-center mt-4">
        Loading your notion pages ...
      </div> : 

        <div className="mt-4">
          <div className="flex justify-between mb-2">
            <p className="text-zinc-600 text-lg ">Pages</p>
            <a href={`${url},${document.id}`} >
              <SmallSecondaryButton className="gap-1" disabled={indexStatus === 'INDEXING'}>
                <IconNotion className="h-4 w-4" /> Update Access
              </SmallSecondaryButton>
            </a>
          </div>
          <div className="max-h-[50vh] border border-gray-300 rounded-md w-full overflow-auto">

            {notionPages?.map((doc) => (
              <div key={doc.id} className={`py-2 sm:p-2 border-b flex  justify-between last:border-none last:rounded-b-md first:rounded-t-md  ${skippedUrls[doc.id] ? 'bg-red-50' : 'hover:bg-slate-50'}`}>
                <a href={doc.url} target="_blank" rel="noreferrer" className={`text-zinc-700 pl-1 hover:underline underline-offset-2 text-ellipsis overflow-hidden`}>
                  <IconOrImage icon={doc.icon} /> {doc.title}
                </a>
                <div className="flex sm:justify-end sm:gap-4 items-center">
                  <p className="text-zinc-600 hidden sm:block">
                    {/* {(doc.size / 1000).toFixed(1)} */}
                    {/* KB */}
                  </p>
                  {skippedUrls[doc.id] ?
                    <button onClick={() => onSkipToggle(doc.id)}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button> :
                    <button onClick={() => onSkipToggle(doc.id)}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>}
                </div>
              </div>
            ))}

          </div>
          <div className="flex flex-wrap justify-start sm:justify-between my-1 sm:p-2">
            <div>
              <span className="text-zinc-500">Total used </span>
              <span >{document.tokens / 1000} KB</span>
            </div>
            <div className="flex justify-center">
              <span className=" text-zinc-500">Quota remaninig &nbsp;  </span>
              <span className="">{(limits.documentSize - document.tokens) / 1000} KB</span>
            </div>
          </div>
          <PrimaryButton className="mx-auto mt-4 gap-1" onClick={onIndexNotionDocs} disabled={indexStatus === 'INDEXING' || isLoading} loading={indexStatus === 'INDEXING' || isLoading}>
            <IconAdd className="w-5 h-5" /> Create
          </PrimaryButton>
          {indexStatus === 'FETCH_DONE' &&
            <Alert className="mt-4" variant='default'>
              <LassoSelect className="h-4 w-4 " />
              <AlertTitle>Remove uncertain pages for faster indexing! </AlertTitle>
              <AlertDescription>
                If you don&apos;t need certain pages , remove them and click create!</AlertDescription>
            </Alert>
          }
          {indexStatus === 'INDEXING' &&
            <Alert className="mt-4" variant='default'>
              <BookOpenCheck className="h-4 w-4 " />
              <AlertTitle>Indexing notion pages! </AlertTitle>
              <AlertDescription>
                You can safely move away from this page or just hang in there.</AlertDescription>
            </Alert>
          }
          {indexStatus === 'SIZE_LIMIT_EXCEED' &&
            <Alert className="mt-4" variant='default'>
              <FileWarning className="h-4 w-4 " />
              <AlertTitle>Size limit exceeded! </AlertTitle>
              <AlertDescription> Upgrade to higher plans to use more storage, <Link href={`/dashboard/${org.name}/subscription`} className="font-semibold underline">  Manage Subscription here </Link>  </AlertDescription>
            </Alert>
          }
        </div>
      }

      </section>
  )
}
const IconOrImage: React.FC<{ icon: CoverOrIcon }> = ({ icon }) => {

  if (!icon) return <>📄</>
  if (icon.type == 'emoji') {
    return (<span>
      {icon.emoji}
    </span>)
  }

  return (
    <>
      📜
    </>
  )
}


