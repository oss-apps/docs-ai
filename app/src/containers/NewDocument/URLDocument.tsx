import { type Project, type Org } from "@prisma/client";
import { type User } from "next-auth";
import { z } from "zod";
import { api } from "~/utils/api";
import { type FieldValues, type SubmitHandler, useForm, Controller } from "react-hook-form";
import PrimaryButton from "~/components/form/button";
import { Input, Label } from "~/components/form/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Switch } from "@headlessui/react";
import { useState } from "react";
import { useRouter } from "next/router";


const documentSchema = z.object({
  src: z.string().url(),
  skipPaths: z.string().optional(),
})

export const URLDocument: React.FC<{ org: Org, project: Project, urlType?: string }> = ({ project, org, urlType }) => {
  const router = useRouter()
  const [loadAllPath, setLoadAllPath] = useState(true)

  const createUrlDocument = api.document.createUrlDocument.useMutation()

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(documentSchema) });

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    const { src, skipPaths } = data as z.input<typeof documentSchema>

    try {
      await createUrlDocument.mutateAsync({ src, projectId: project.id, orgId: org.id, type: urlType, loadAllPath, skipPaths })
      await router.push(`/dashboard/${org.name}/${project.slug}/documents`)
    } catch(e) {
      console.log(e)
    }
  };


  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Label>URL</Label>
      <Input
        error={errors.src?.message?.toString()}
        placeholder="https://docs.gitbook.com/"
        {...register('src', { required: 'URL is required' })}
      />
      <div className="flex gap-3 items-center mt-4">
        <Label>Load all paths</Label>
        <Switch
          className={`${
            loadAllPath ? 'bg-blue-600' : 'bg-gray-200'
          } relative inline-flex h-6 w-11 items-center rounded-full`}
          checked={loadAllPath}
          onChange={setLoadAllPath}
        >
          <span className="sr-only">Load all paths</span>
          <span
            className={`${
              loadAllPath ? 'translate-x-6' : 'translate-x-1'
            } inline-block h-4 w-4 transform rounded-full bg-white transition`}
          />
        </Switch>
      </div>
      <Label className={`mt-6 ${!loadAllPath ? 'text-gray-400' : ''}`}>Paths to skip</Label>
      <Input
        disabled={!loadAllPath}
        error={errors.skipPath?.message?.toString()}
        placeholder="/blog, /about"
        {...register('skipPaths', { required: 'URL is required' })}
      />

      <PrimaryButton disabled={createUrlDocument.isLoading} loading={createUrlDocument.isLoading} className="mx-auto mt-6">Create</PrimaryButton>
    </form>
  )
}