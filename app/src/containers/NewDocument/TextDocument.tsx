import { type Project, type Org, type Document } from "@prisma/client";
import { type User } from "next-auth";
import { z } from "zod";
import { api } from "~/utils/api";
import { type FieldValues, type SubmitHandler, useForm } from "react-hook-form";
import PrimaryButton from "~/components/form/button";
import { Input, Label, TextArea } from "~/components/form/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";


const documentSchema = z.object({
  title: z.string(),
  content: z.string()
})

export const TextDocument: React.FC<{ org: Org, project: Project, document?: Document }> = ({ project, org, document }) => {
  const router = useRouter()
  const { convoId } = router.query as { convoId: string }

  const createTextDocument = api.document.createTextDocument.useMutation()
  const reIndexDocument = api.document.reIndexTextDocument.useMutation()

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(documentSchema) });

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    const { title, content } = data as z.input<typeof documentSchema>

    if (document) {
      await reIndexDocument.mutateAsync({ title, projectId: project.id, orgId: org.id, documentId: document.id, content })
    } else {
      await createTextDocument.mutateAsync({ title, projectId: project.id, orgId: org.id, content })
    }

    await router.push(`/dashboard/${org.name}/${project.slug}/documents`)
  };

  if (convoId) return <ChatDocument org={org} project={project} convoId={convoId} />

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Label>Title</Label>
      <Input
        error={errors.src?.message?.toString()}
        placeholder="How to add document in DocsAI?"
        {...register('title', { required: 'Title is required' })}
        defaultValue={document?.title || ''}
      />

      <Label>Content</Label>
      <TextArea
        error={errors.src?.message?.toString()}
        rows={10}
        defaultValue={document?.src || ''}
        placeholder={"It's very simple to create a document in docs AI \n1. Create a project if not exist before\n2. Go to documents tab\n3. Click on new document button. \n4. Add a url or text you want to add"}
        {...register('content', { required: 'Content is required' })}
      />

      <PrimaryButton
        disabled={createTextDocument.isLoading || reIndexDocument.isLoading}
        loading={createTextDocument.isLoading || reIndexDocument.isLoading}
        className="mx-auto mt-6">
        Create
      </PrimaryButton>
    </form>
  )
}


export const ChatDocument: React.FC<{ org: Org, project: Project, convoId: string }> = ({ project, org, convoId }) => {
  const createTextDocument = api.document.createTextDocument.useMutation()
  const conversation = api.conversation.getConversation.useQuery({ convoId, orgId: org.id, projectId: project.id })

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(documentSchema) });

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    const { title, content } = data as z.input<typeof documentSchema>

    createTextDocument.mutate({ title, projectId: project.id, orgId: org.id, content })
  };

  if (conversation.isLoading) return <div>Loading...</div>

  const content = conversation.data?.conversation?.messages.map(msg => `${msg.user}: ${msg.message}`).join("\n\n")

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Label>Title</Label>
      <Input
        error={errors.src?.message?.toString()}
        placeholder="How to add document in DocsAI?"
        {...register('title', { required: 'Title is required' })}
        defaultValue={conversation.data?.conversation?.firstMsg}
      />

      <Label>Content</Label>
      <TextArea
        error={errors.src?.message?.toString()}
        rows={10}
        placeholder={"It's very simple to create a document in docs AI \n1. Create a project if not exist before\n2. Go to documents tab\n3. Click on new document button. \n4. Add a url or text you want to add"}
        {...register('content', { required: 'Content is required' })}
        defaultValue={content}
      />

      <PrimaryButton
        disabled={createTextDocument.isLoading}
        loading={createTextDocument.isLoading}
        className="mx-auto mt-6">Create</PrimaryButton>
    </form>
  )
}