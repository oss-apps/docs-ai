import { zodResolver } from "@hookform/resolvers/zod";
import { type Org, type Project } from "@prisma/client";
import { useState } from "react";
import { useForm, type SubmitHandler, type FieldValues } from "react-hook-form";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { z } from "zod";
import PrimaryButton from "~/components/form/button";
import { Input, Label } from "~/components/form/input";
import { MarkDown } from "~/components/MarkDown";
import { api } from "~/utils/api";

const qnaSchema = z.object({
  question: z.string().min(3),
})

export const QnA: React.FC<{ org: Org, project: Project, isPublic?: boolean }> = ({ org, project, isPublic }) => {
  const [fetching, setFetching] = useState(false)
  const [answer, setAnswer] = useState<string | null>("")

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(qnaSchema) });

  const { client } = api.useContext()

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    const { question } = data as any as z.input<typeof qnaSchema>
    setFetching(true)
    try {
      const result = await (isPublic ?
        client.docGPT.getPublicAnswer.query({ orgId: org.id, projectId: project.id, question }) :
        client.docGPT.getAnswer.query({ orgId: org.id, projectId: project.id, question }))
      setAnswer(result.answer)
    } catch (e) {
      console.log(e)
    }
    setFetching(false)
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Label>Ask your question</Label>
        <Input
          error={errors.name?.message?.toString()}
          placeholder={project.defaultQuestion}
          {...register('question', { required: 'Question is required', minLength: 3 })}
        >
        </Input>
        <PrimaryButton className="mx-auto mt-6">Get Answer</PrimaryButton>

      </form>
      <div className="mt-10">
        {fetching ? <div className="text-center">Thinking...</div> : (


          <div>
            {
              answer ?
                <div className="w-full bg-gray-100 p-5 rounded-md text-lg">
                  <MarkDown markdown={answer} />
                </div> :
                null
            }
          </div>
        )}
      </div>
    </div>
  )
}