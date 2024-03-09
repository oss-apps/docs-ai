import { z } from "zod";
import { api } from "~/utils/api";
import { type FieldValues, type SubmitHandler, useForm } from "react-hook-form";
import PrimaryButton from "~/components/form/button";
import { Input } from "~/components/form/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { ChevronRight } from "lucide-react";


const orgSchema = z.object({
  name: z.string().min(3),
})

export const CreateOrg: React.FC = () => {

  const router = useRouter()

  const createOrg = api.org.createOrg.useMutation()

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(orgSchema) });

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    const { name } = data as z.input<typeof orgSchema>

    try {
      const result = await createOrg.mutateAsync({ name })
      await router.push(`/dashboard/${result.org.name}/new?noBack=true`)
    } catch (e) {
      console.log(e)
    }
  };

  return (
    <div>
      <h1 className="text-center sm:text-left font-medium text-3xl text-slate-900">Create organaization</h1>
      <p className="text-slate-600 my-2">
        With Organization, you can effortlessly create, manage projects, and collaborate with team members.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
        <Input
          error={errors.name?.message?.toString()}
          placeholder="Ex: Team Nexus, Project X"
          autoFocus={true}
          {...register('name', { required: 'Org name is required' })}
        />

        <PrimaryButton loading={createOrg.isLoading} disabled={createOrg.isLoading} className="mx-auto mt-6">
          Next <ChevronRight className="w-5 h-5 " /></PrimaryButton>
      </form>
    </div>
  )
}
