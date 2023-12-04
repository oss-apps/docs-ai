import { type Org, type Project, type Document } from "@prisma/client"
import { useEffect, useState } from "react";
import PrimaryButton, { SecondaryButton } from "~/components/form/button"
import { type FieldValues, type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input, Label, } from "~/components/form/input";
import { api } from "~/utils/api";
import { confluenceSchema, ConfluenceSpace } from "~/utils/confluence";
import { toast } from "react-hot-toast";
import { useRouter } from "next/router";
import { IconAdd, IconLink, IconTick } from "~/components/icons/icons";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/Alert";
import { BookOpenCheck, FileWarning, Info, LassoSelect, Search } from "lucide-react";
import Link from "next/link";
import { z } from "zod";

const MAX_ALLOWED_SPACES = 2

const placeholders = {
  accessToken: "ATATT3xFfGF0BevFg14ufodEkhOZD14hqXV_Uw_SWwcdhr6nYaDiOWQR2rUgm0-d_Bev4oC-Em-80bwHYVYGIjDzjNo4rhRPAr2N2STUHK5SAZ_XsoOiARJH5VmbQNRPo5XFi8yPYUuq6yosaZdX3b-ydJVHvX6lRlbYBTqKytvFRD7iWFk=F17A2412",
  baseUrl: "https://your.domain/",
  spaceId: "PROEJCTX or ~60e87e5a287807006852f370",
  email: "yourconfluence@email.com"
}

const querySchema = z.object({
  query: z.string().optional()
})


export const ConfluenceDocument: React.FC<{ org: Org, project: Project, newDocument?: boolean, document?: Document }> = ({ project, org, newDocument = false, document, }) => {
  if (!document) {
    return <NewConfluenceDocument org={org} project={project} />
  }
  else {
    return <EditConfluenceDocument org={org} project={project} document={document} />

  }
}

const NewConfluenceDocument: React.FC<{ org: Org, project: Project }> = ({ project, org }) => {
  // const url = `${env.NEXT_PUBLIC_CONFLUENCE_AUTHORIZATION_URL}&state=${org.id},${project.id}`

  const { register, handleSubmit, formState: { errors }, getValues } = useForm({ resolver: zodResolver(confluenceSchema) });
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const createConfluenceDoc = api.document.createConfluenceDocument.useMutation()

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true)
    const spacesRes = await fetch('/api/confluence/getSpaces', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      },
    })

    const spaces = await spacesRes.json() as ConfluenceSpace
    if (spaces.status != 200) {
      toast.error(spaces.message, { duration: 20000 })
      setIsLoading(false)
      return
    }
    const doc = await createConfluenceDoc.mutateAsync({ details: getValues(), projectId: project.id, orgId: org.id })
    await router.push(`/dashboard/${org.name}/${project.slug}/edit_document?id=${doc.id}&type=CONFLUENCE`)
    setIsLoading(false)
  }

  useEffect(() => {
    // confl().then(console.log).catch(console.error)
  })

  return (<>
    <div className="my-6">
      <form onSubmit={handleSubmit(onSubmit)} className="my-4 rounded-md">
        <div className="w-full">
          <Label title="Generate an API token using Manage Profiles & Security. " link="/features/documents/confluence"
          >
            API token
            <span className="inline-flex ml-1 "> <a href="https://id.atlassian.com/manage-profile/security/api-tokens" rel="noopener noreferrer" target="_blank" title="Generate API Token"> <IconLink className="h-4 w-4" /> </a></span>
          </Label>
          <Input
            placeholder={placeholders.accessToken}
            {...register('accessToken')}
            error={errors.accessToken?.message?.toString()}
          />
        </div>
        <div className="w-full mt-6">
          <Label title="The url before the 'wiki' is your confluence domain name. Note the trailing / " link="/features/documents/confluence">Domain</Label>
          <Input
            placeholder={placeholders.baseUrl}
            {...register('baseUrl')}
            error={errors.baseUrl?.message?.toString()}
          />
        </div>
        <div className="w-full mt-6">
          <Label title="The email associated with your confluence account. " link="/features/documents/confluence">Account Email</Label>
          <Input
            placeholder={placeholders.email}
            {...register('email')}
            error={errors.email?.message?.toString()}
          />
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <PrimaryButton type="submit" className="min-w-[150px] flex justify-center gap-2" disabled={isLoading} loading={isLoading}>
            <LassoSelect className="h-4 w-4 " /> Get spaces
          </PrimaryButton>
          <SecondaryButton type="button" className="flex justify-center gap-2" tabIndex={-1}>
            <Link className="flex gap-2 items-center" href="/features/documents/confluence" target="_blank"> <IconLink className="w-4 h-4" /> Learn more </Link>
          </SecondaryButton>
        </div>
      </form>

    </div>
  </>)
}

const EditConfluenceDocument: React.FC<{ org: Org, project: Project, document: Document }> = ({ project, org, document, }) => {
  const router = useRouter()
  const conflDetails = document.details as confluenceSchema
  const { register, handleSubmit, formState: { errors }, getValues } = useForm({ resolver: zodResolver(querySchema) });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const [skippedUrls, setSkippedUrls] = useState<Record<string, boolean>>(conflDetails.skippedUrls ?? {})
  // here skippedUrls are used as selected spaces
  const [indexStatus, setIndexStatus] = useState(document.indexStatus)
  const [selectedSpace, setSelectedSpace] = useState<string[]>(conflDetails?.selectedSpace)
  const { data: confluenceSpaceDetails, isLoading, } = api.document.getOneDocument.useQuery({ documentId: document.id })

  const spacesRes = confluenceSpaceDetails?.integrationDetails as ConfluenceSpace
  const indexConfl = api.document.indexConfluenceDocument.useMutation()

  const onSkipToggle = (url: string, name: string) => {
    const isSkipped = skippedUrls[url]
    if (!isSkipped) {
      if (selectedSpace.length == MAX_ALLOWED_SPACES) {
        toast(`You can select only ${MAX_ALLOWED_SPACES}  spaces`,
          { icon: <Info />, position: 'top-center' })
        return
      }
      setSelectedSpace([...selectedSpace, name])
    }
    else setSelectedSpace(selectedSpace.filter(x => x != name))
    setSkippedUrls({ ...skippedUrls, [url]: !isSkipped })

  }

  const filterSpaces = () => {
    console.log("🔥 ~ filterSpaces ~ filterSpaces:")
    const query = getValues("query") as string
    if (!query) return spacesRes?.results
    const filteredSpaces = spacesRes?.results?.filter(each =>
      each.name.toLowerCase().includes(query))
    return filteredSpaces
  }

  const onIndexConfluence = async () => {
    if (!selectedSpace.length) {
      toast.error("Select atleast 1 space", {
        icon: <Info />, position: 'top-center'
      })
      return
    }
    setIndexStatus('INDEXING')
    try {
      const src = "Contain spaces " + selectedSpace.join(", ")
      const args = { projectId: project.id, orgId: org.id, documentId: document.id, details: { ...conflDetails, skippedUrls, selectedSpace }, src }
      // here skippedUrls are used as selected spaces

      await indexConfl.mutateAsync(args)
      await router.push(`/dashboard/${org.name}/${project.slug}/documents`)
    }
    catch (err) {
      await router.push(`/dashboard/${org.name}/${project.slug}/documents`)
    }

  }
  console.log("🔥 ~ data:", confluenceSpaceDetails)

  return (
    <>

      <div className="flex gap-2 items-center mt-8">
        <h3 className="text-xl font-bold flex items-center gap-2"> {conflDetails.baseUrl}
          <a href={conflDetails.baseUrl} target="_blank" rel="noreferrer"> <IconLink /> </a> </h3>
      </div>
      {
        isLoading ?
          <div className="text-center mt-4">
            Loading your confluence spaces ...
          </div > :
          <div>
            <div className="flex items-end justify-between my-4">
              <p className="text-zinc-600 text-lg ">Confluence Spaces ({spacesRes.results?.length})</p>
              <form onSubmit={handleSubmit(filterSpaces)} className="flex items-center outline-none border rounded-lg ">
                <Input
                  className="text-sm i min-w-[200px]  border-none focus:bg-transparent"
                  title="Press enter"
                  placeholder="Search spaces"
                  {...register('query')}
                  error={errors.query?.message?.toString()}
                />
                <button className="mr-2" type="submit">
                  <Search className="w-4 h-4 text-zinc-600 " />
                </button>
              </form>

            </div>
            <div className="max-h-[45vh] border border-gray-300 rounded-md w-full overflow-auto">
              {filterSpaces()?.map((doc) => (
                <div key={doc.id} className={`py-2 sm:p-2 border-b flex  justify-between last:border-none last:rounded-b-md first:rounded-t-md  
                  ${skippedUrls[doc.key] ? 'bg-green-50' : 'hover:bg-slate-50'}`}
                  onClick={() => onSkipToggle(doc.key, doc.name)}>
                  <a href={conflDetails.baseUrl + 'wiki' + doc._links.webui} target="_blank" rel="noreferrer" className={`text-zinc-700 pl-1 hover:underline underline-offset-2 text-ellipsis overflow-hidden`}>
                    {doc.name} <span className="text-zinc-500">  ({doc.type}) </span>
                  </a>
                  <div className="flex sm:justify-end sm:gap-4 items-center">
                    <p className="text-zinc-600 hidden sm:block">
                      {/* {(doc.size / 1000).toFixed(1)} */}
                      {/* KB */}
                    </p>
                    {skippedUrls[doc.key] ?
                      <button onClick={() => onSkipToggle(doc.key, doc.name)}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button> :
                      <button onClick={() => onSkipToggle(doc.key, doc.name)}>
                        <IconTick />
                      </button>}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-4 text-zinc-600 items-center flex-wrap">
              <p> Selected Spaces</p>
              <div className="flex gap-2 ">
                {selectedSpace.map((name, i) => {
                  return <span key={i} className="px-1 border rounded-md text-sm">{name}</span>
                })}
              </div>
            </div>

            <PrimaryButton className="mx-auto mt-4 gap-1" onClick={onIndexConfluence} disabled={indexStatus === 'INDEXING' || isLoading} loading={indexStatus === 'INDEXING' || isLoading}>
              <IconAdd className="w-5 h-5" /> Create
            </PrimaryButton>
            {indexStatus === 'FETCH_DONE' &&
              <Alert className="mt-4" variant='default'>
                <LassoSelect className="h-4 w-4 " />
                <AlertTitle>You can select 2 spaces!</AlertTitle>
                <AlertDescription>
                  Pages from those spaces will be indexed! If you want to add more than 2 , create a new document.</AlertDescription>
              </Alert>
            }
            {indexStatus === 'INDEXING' &&
              <Alert className="mt-4" variant='default'>
                <BookOpenCheck className="h-4 w-4 " />
                <AlertTitle>Indexing confluence pages! </AlertTitle>
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
    </>
  )
}

