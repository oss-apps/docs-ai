import { type Project, type Org } from "@prisma/client";
import { type User } from "next-auth";
import { z } from "zod";
import { api } from "~/utils/api";
import { type FieldValues, type SubmitHandler, useForm } from "react-hook-form";
import PrimaryButton from "~/components/form/button";
import { Input, Label } from "~/components/form/input";
import { zodResolver } from "@hookform/resolvers/zod";


const documentSchema = z.object({
  src: z.string().url(),
})

export const URLDocument: React.FC<{ org: Org, project: Project }> = ({ project, org }) => {
  const createUrlDocument = api.document.createUrlDocument.useMutation()

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(documentSchema) });

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    const { src } = data as z.input<typeof documentSchema>

    createUrlDocument.mutate({ src, projectId: project.id, orgId: org.id })
  };


  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Label>URL</Label>
      <Input
        error={errors.src?.message?.toString()}
        placeholder="https://docs.gitbook.com/"
        {...register('src', { required: 'URL is required' })}
      />

      <PrimaryButton disabled={createUrlDocument.isLoading} className="mx-auto mt-6">Create</PrimaryButton>
    </form>
  )
}