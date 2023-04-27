import { type Project, type Org, type Document, type Prisma } from "@prisma/client";
import { type User } from "next-auth";
import { z } from "zod";
import { api } from "~/utils/api";
import { type FieldValues, type SubmitHandler, useForm, Controller } from "react-hook-form";
import PrimaryButton from "~/components/form/button";
import { Input, Label } from "~/components/form/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Switch } from "@headlessui/react";
import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { type ParsedUrls, type ParsedDocs } from "~/types";


const documentSchema = z.object({
  src: z.string().url(),
  skipPaths: z.string().optional(),
})

export const URLDocument: React.FC<{ org: Org, project: Project, urlType?: string, document?: Document & { parsedUrls: ParsedUrls } }>
  = ({ project, org, urlType, document }) => {
    const router = useRouter()
    const [skippedUrls, setSkippedUrls] = useState<Record<string, boolean>>({})
    const [parsedUrls, setParsedUrls] = useState<ParsedUrls>(document?.parsedUrls || [])
    const [doc, setDoc] = useState<Document | null>(document || null)

    console.log(parsedUrls)

    const createUrlDocument = api.document.createUrlDocument.useMutation()
    const reIndexDocument = api.document.reIndexUrlDocument.useMutation()
    const indexUrlDocument = api.document.indexUrlDocument.useMutation()

    const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(documentSchema) });

    const onSubmit: SubmitHandler<FieldValues> = async (data) => {
      const { src, skipPaths } = data as z.input<typeof documentSchema>

      try {
        const { parsedDocs, document } = !doc ?
          await createUrlDocument.mutateAsync({ src, projectId: project.id, orgId: org.id, type: urlType, loadAllPath, skipPaths })
          : await reIndexDocument.mutateAsync({ projectId: project.id, orgId: org.id, documentId: doc.id })
        setDoc(document)
        if (parsedDocs.length === 0) {
          await router.push(`/dashboard/${org.name}/${project.slug}/documents`)
        }
        setParsedUrls(parsedDocs)
        // await router.push(`/dashboard/${org.name}/${project.slug}/documents`)
      } catch (e) {
        console.log(e)
      }
    };

    const onIndex = async () => {
      try {
        if (!doc) return

        await indexUrlDocument.mutateAsync({
          documentId: doc?.id,
          projectId: project.id,
          orgId: org.id,
          skipUrls: Object.keys(skippedUrls).filter((url) => skippedUrls[url]),
        })

        await router.push(`/dashboard/${org.name}/${project.slug}/documents`)
      } catch (e) {
        console.log(e)
      }
    }

    const { docSkipPath, docLoadAllPath } = useMemo(() => {
      if (!document) return { docSkipPath: '', docLoadAllPath: true }

      const details = document.details as Prisma.JsonObject

      const docSkipPath = details.skipPath?.toString()

      return { docSkipPath, docLoadAllPath: !!details.loadAllPath }
    }, [document])

    const [loadAllPath, setLoadAllPath] = useState(docLoadAllPath)


    return (
      <>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Label>URL</Label>
          <Input
            error={errors.src?.message?.toString()}
            placeholder="https://docs.gitbook.com/"
            defaultValue={document?.src}
            {...register('src', { required: 'URL is required' })}
          />
          <div className="flex gap-3 items-center mt-4">
            <Label>Load all paths</Label>
            <Switch
              className={`${loadAllPath ? 'bg-blue-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 items-center rounded-full`}
              checked={loadAllPath}
              onChange={setLoadAllPath}
            >
              <span className="sr-only">Load all paths</span>
              <span
                className={`${loadAllPath ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition`}
              />
            </Switch>
          </div>
          {/* <Label className={`mt-6 ${!loadAllPath ? 'text-gray-400' : ''}`}>Paths to skip</Label>
          <Input
            disabled={!loadAllPath}
            error={errors.skipPath?.message?.toString()}
            placeholder="/blog, /about"
            defaultValue={docSkipPath}
            {...register('skipPaths', { required: 'URL is required' })}
          /> */}
          <PrimaryButton
            type="submit"
            disabled={createUrlDocument.isLoading || reIndexDocument.isLoading}
            loading={createUrlDocument.isLoading || reIndexDocument.isLoading}
            className="mx-auto mt-6">
            Fetch document
          </PrimaryButton>
        </form>
        {parsedUrls.length ? (
          <div className="mt-10">
            <p className="text-zinc-500 text-lg">Fetched pages</p>
            <div className="max-h-[50vh] border border-gray-400 rounded-md w-full overflow-auto">
              {parsedUrls.map((doc) => (
                <div key={doc.url} className={`p-2 border-b flex justify-between last:border-none last:rounded-b-md first:rounded-t-md ${skippedUrls[doc.url] ? 'bg-red-50' : ''}`}>
                  <a href={doc.url} target="_blank" rel="noreferrer" className={`text-zinc-500 hover:underline underline-offset-2`}>
                    {doc.url}
                  </a>
                  <div className="flex gap-4 items-center">
                    <p className="text-zinc-600">
                      {(doc.size / 1000).toFixed(1)} KB
                    </p>
                    {skippedUrls[doc.url] ?
                      <button onClick={() => setSkippedUrls({ ...skippedUrls, [doc.url]: false })}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button> :
                      <button onClick={() => setSkippedUrls({ ...skippedUrls, [doc.url]: true })}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {doc && parsedUrls.length ? (
          <PrimaryButton
            onClick={onIndex}
            disabled={indexUrlDocument.isLoading}
            loading={indexUrlDocument.isLoading}
            className="mx-auto mt-6">
            Create document
          </PrimaryButton>
        ) : null}
      </>
    )
  }