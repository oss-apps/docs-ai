import { type Org, type Project, type Document } from "@prisma/client"
import { z } from "zod";
import Avatar from "~/components/Avatar";
import PrimaryButton, { Button, SecondaryButton, SmallSecondaryButton } from "~/components/form/button";
import { IconNotion, IconAdd } from "~/components/icons/icons";
import { env } from "~/env.mjs";
import { CoverOrIcon, type NotionDetails, type NotionList } from "~/types/notionTypes";
import { useEffect, useState } from "react";
import { api } from "~/utils/api";
import { Progress } from "~/components/ui/Progress"


const documentSchema = z.object({
  src: z.string().url(),
  skipPaths: z.string().optional(),
})


export const NotionDocument: React.FC<{ org: Org, project: Project, integrationDetails: NotionList[], newDocument?: boolean, document?: Document }> = ({ project, integrationDetails: notionList, org, newDocument = false, document, }) => {
  console.log("🔥 ~ document:", document)
  console.log("🔥 ~ notionList:", notionList)
  const notionDetails = document?.details as NotionDetails
  const [skippedUrls, setSkippedUrls] = useState<Record<string, boolean>>(notionDetails?.skippedUrls ?? {})
  const [timer, setTimer] = useState(5);
  const url = `${env.NEXT_PUBLIC_NOTION_AUTHORIZATION_URL}&state=${org.id},${project.id}`

  useEffect(() => {
    if (!newDocument) return
    const interval = setInterval(() => {
      if (timer > 0) {
        setTimer(timer - 1);
      }
    }, 500);
    return () => {
      clearInterval(interval)

    };
  });

  const indexNotionDocs = api.document.createNotionDocument.useMutation()

  // const { src, skipPaths } = data as z.input<typeof documentSchema>




  const onSkipToggle = (url: string, skip: boolean) => {
    const isSkipped = skippedUrls[url]
    console.log("🔥 ~ onSkipToggle ~ isSkipped:", isSkipped)
    setSkippedUrls({ ...skippedUrls, [url]: !isSkipped })
    // setTotalSize(totalSize + (isSkipped ? size : -size))
  }

  const onIndexNotionDocs = async () => {
    const args = { projectId: project.id, orgId: org.id, documentId: document!.id, details: { ...notionDetails, skippedUrls } }
    const saved = await indexNotionDocs.mutateAsync(args)
    console.log("🔥 ~ onIndexNotionDocs ~ args:", args)
    console.log("🔥 ~ onIndexNotionDocs ~ onIndexNotionDocs:", saved)
  }

  if (newDocument) {
    return <div className="flex flex-col ">
      <h1 className="text-xl font-semibold  text-center mb-2" >We&lsquo;re taking you to Notion to select the pages you want to train.</h1>
      <Progress value={100 - timer * 20} />
      <div className="text-center mt-4">
        <Button variant='outline' size="sm">
          <a href={url} className="flex gap-2"><IconNotion /> Connect Notion</a>
        </Button>
        <p className="text-slate-500 text-sm mt-2">If you&lsquo;re not redirected, click the button above</p>
      </div>
    </div>
  }

  else {
    return (
      <section className="mt-8">
        <div className="flex gap-2 items-center">
          {notionDetails.workspace_icon &&
            <Avatar uid={notionDetails.workspace_icon} src={notionDetails.workspace_icon} srcIsUid size={30} square />}
          <h3 className="text-xl font-bold"> {notionDetails.workspace_name} </h3>
        </div>

        <div className="mt-4">
          <div className="flex justify-between mb-2">
            <p className="text-zinc-600 text-lg ">Pages</p>
            <a href={`${url},${document!.id}`} >
              <SmallSecondaryButton className="gap-1">
                <IconNotion className="h-4 w-4" /> Update Access
              </SmallSecondaryButton>
            </a>
          </div>
          <div className="max-h-[50vh] border border-gray-300 rounded-md w-full overflow-auto">
            {notionList.map((doc) => (
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
                    <button onClick={() => onSkipToggle(doc.id, true)}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button> :
                    <button onClick={() => onSkipToggle(doc.id, false)}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>}
                </div>
              </div>
            ))}
          </div>
          <PrimaryButton className="mx-auto mt-4 gap-1" onClick={onIndexNotionDocs}>
            <IconAdd className="w-5 h-5" /> Create
          </PrimaryButton>
        </div>

      </section>
    )
  }
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


