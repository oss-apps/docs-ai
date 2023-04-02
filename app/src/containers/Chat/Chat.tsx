import { zodResolver } from "@hookform/resolvers/zod";
import { type Conversation, type Messages, type Org, type Project } from "@prisma/client";
import { useEffect, useRef, useState } from "react";
import { useForm, type SubmitHandler, type FieldValues } from "react-hook-form";
import { z } from "zod";
import { Loading } from "~/components/loading/Loading"

import { api } from "~/utils/api";
import { MarkDown } from "~/components/MarkDown";

const qnaSchema = z.object({
  question: z.string().min(3),
})

export const ChatBox: React.FC<{ org: Org, project: Project, isPublic?: boolean }> = ({ org, project, isPublic }) => {
  const [conversation, setConversation] = useState<(Conversation & {
    messages: Messages[];
  }) | null>(null)
  const [latestQuestion, setLatestQuestion] = useState<string | null>(null)

  const chatBox = useRef<HTMLDivElement>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({ resolver: zodResolver(qnaSchema) });

  const getPublicChatbotAnswer = api.docGPT.getPublicChatbotAnswer.useMutation()

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    const { question } = data as any as z.input<typeof qnaSchema>
    await getAnswer(question)
  };

  const getAnswer = async (question: string) => {
    setLatestQuestion(question)
    try {
      reset()
      const convo = await getPublicChatbotAnswer.mutateAsync({
        projectId: project.id, orgId: org.id, question, convoId: getPublicChatbotAnswer.data?.conversation?.id
      })
      setConversation(convo.conversation)
    } catch (e) {
      console.log(e)
    }
    setLatestQuestion(null)
  }

  useEffect(() => {
    const myDiv = chatBox.current;
    if (myDiv) {
      myDiv.scrollTop = myDiv.scrollHeight;
    }
  }, [latestQuestion, conversation])

  return (
    <div className="h-full">
      <div ref={chatBox} id="docs-ai-chat-box" className="lg:h-[70vh] h-[80vh]  lg:max-h-[45rem] mb-2 overflow-auto border lg:border-gray-200 rounded text-sm lg:text-base leading-tight">
        <div className="flex lg:mt-4 items-start even:bg-gray-100 p-2 px-4">
          <div className="mt-1 text-xl">
            {'🤖'}
          </div>
          <div className="markdown ml-4 lg:ml-10">
            <div>Hi, I am {project.botName}. How can I help you?</div>
          </div>
        </div>
        {conversation?.messages.map((m) => (
          <div key={m.id} className="flex mt-1 lg:mt-4 items-start even:bg-gray-100 p-2 px-4">
            <div className="mt-1 text-xl">
              {m.user === 'user' ? '👤' : '🤖'}
            </div>
            <div className="ml-4 lg:ml-10">
              <MarkDown markdown={m.message} />
            </div>
          </div>
        ))}
        {latestQuestion ? (
          <div className="flex mt-1 lg:mt-4 items-start even:bg-gray-100 p-2 px-4">
            <div className="mt-1 text-xl">
              {'👤'}
            </div>
            <div className="markdown ml-4 lg:ml-10">
              <div>{latestQuestion}</div>
            </div>
          </div>
        ) : null}
        {getPublicChatbotAnswer.isLoading ? (
          <div className="flex mt-1 lg:mt-4 items-start even:bg-gray-100 p-2 px-4">
            <div className="mt-1 text-xl">
              {'🤖'}
            </div>
            <div className="markdown ml-4 lg:ml-10">
              <div className="text-gray-600">Thinking...</div>
            </div>
          </div>
        ) : null}
      </div>
      <div className="mb-2 flex gap-3 lg:px-0 px-2 flex-wrap shrink-0">
        {project.defaultQuestion.split(',').map(q => (
          <button onClick={() => getAnswer(q)} key={q} className="text-xs text-gray-600 bg-gray-100 rounded-md p-0.5 px-1 border border-gray-300">
            {q}
          </button>
        ))}
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex w-full lg:border lg:border-gray-300 rounded-md lg:p-1">
          <input
            className="w-full lg:p-2 outline-none max-h-12 resize-none px-2"
            placeholder="Ask anything"
            {...register('question', { required: 'Question is required', minLength: 3 })}></input>
          <button type="submit" className="p-1 py-0.5 rounded-md disabled:text-gray-200 text-gray-500 " disabled={getPublicChatbotAnswer.isLoading}>
            {getPublicChatbotAnswer.isLoading ? <Loading /> : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 ">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div >
  )
}

