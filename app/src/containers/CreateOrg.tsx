import { z } from "zod";
import { api } from "~/utils/api";
import { type FieldValues, type SubmitHandler, useForm } from "react-hook-form";
import PrimaryButton from "~/components/form/button";
import { Input, Label, TextArea } from "~/components/form/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";


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
			await router.push(`/dashboard/${result.org.name}`)    
    } catch(e) {
      console.log(e)
    }
  };

  console.log(errors)

  return (
    <div>
			<p className="mb-10 text-center text-xl">Create organaisation</p>
			<form onSubmit={handleSubmit(onSubmit)}>
			<Label>Organisation name</Label>
			<Input
				error={errors.name?.message?.toString()}
				placeholder="Org name"
				{...register('name', { required: 'Org name is required' })}
			/>
			<PrimaryButton loading={createOrg.isLoading} disabled={createOrg.isLoading} className="mx-auto mt-6">Create</PrimaryButton>
			</form>
    </div>
  )
}
