import { zodResolver } from "@hookform/resolvers/zod";
import { type Conversation, type Messages, type Org, type Project } from "@prisma/client";
import { useEffect, useRef, useState } from "react";
import { useForm, type SubmitHandler, type FieldValues } from "react-hook-form";
import { z } from "zod";
import { Loading } from "~/components/loading/Loading"

import { api } from "~/utils/api";
import { MarkDown } from "~/components/MarkDown";
import { getLinkDirectory } from "~/utils/link";

const qnaSchema = z.object({
  question: z.string().min(3),
})


const getStreamAnswer = async (projectId: string, question: string, convoId: string, onMessage: (token: string) => void, onEnd: (convoId: string) => void) => {
  const res = await fetch('/api/web/chat', {
    method: 'POST',
    body: JSON.stringify({
      projectId: projectId,
      question: question,
      conversationId: convoId
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  })

  if (res.ok) {
    const reader = res.body?.getReader();
    const decoder = new TextDecoder('utf-8');

    if (!reader) {
      return;
    }
    let result = '';

    while (true) {
      const { value, done } = await reader.read();

      if (value) {
        const dataResults = decoder.decode(value);
        if (dataResults.startsWith('DOCSAI_CONVO_ID')) {
          const convoId = dataResults.split(':')[1];
          if (convoId) {
            onEnd(convoId)
          }
          break;
        }
        result += dataResults;
        onMessage(result)
      }

      if (done) {
        onEnd(convoId)
        break;
      }
    }
  } else {
    onEnd(convoId)
  }
}


export const ChatBox: React.FC<{ org: Org, project: Project, isPublic?: boolean, embed?: boolean }> = ({ org, project, isPublic, embed }) => {
  const [thinking, setThinking] = useState(false)
  const [conversation, setConversation] = useState<(Conversation & {
    messages: Messages[];
  }) | null>(null)
  const [latestQuestion, setLatestQuestion] = useState<string | null>(null)
  const [answer, setAnswer] = useState<string | null>(null)

  const chatBox = useRef<HTMLDivElement>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({ resolver: zodResolver(qnaSchema) });

  const summarizeConversation = api.conversation.summarizeConversation.useMutation()
  const { client } = api.useContext()


  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    const { question } = data as any as z.input<typeof qnaSchema>
    await getAnswer(question)
  };

  const getAnswer = async (question: string) => {
    setLatestQuestion(question)
    try {
      reset()
      setThinking(true)
      await getStreamAnswer(project.id, question, conversation?.id ?? 'new', (token) => {
        setAnswer(token)
        setThinking(false)
      }, async (convoId) => {
        const { conversation } = await client.conversation.getConversation.query({ orgId: org.id, projectId: project.id, convoId: convoId })
        setConversation(conversation)
        setAnswer(null)
        setLatestQuestion(null)
      });
    } catch (e) {
      setThinking(false)
      console.log(e)
    }
  }

  useEffect(() => {
    const myDiv = chatBox.current;
    if (myDiv) {
      myDiv.scrollTop = myDiv.scrollHeight;
    }
  }, [latestQuestion, conversation, answer])

  const onClose = () => {
    if (window.parent) {
      window.parent.postMessage({ source: 'docsai', message: 'close' }, '*')
    }
  }

  const onResetChat = () => {
    if (conversation) {
      summarizeConversation.mutate({ projectId: project.id, convoId: conversation?.id, orgId: org.id })
    }
    setConversation(null)
  }

  useEffect(() => {
    const cb = async () => {
      const apiUrl = '/api/v1/endConversation';
      if (conversation) {
        const blobData = new Blob([JSON.stringify({ projectId: project.id, conversationId: conversation?.id })], { type: 'application/json' });
        if (navigator.sendBeacon) {
          navigator.sendBeacon(apiUrl, blobData);
        } else {
          // Fallback for browsers that don't support sendBeacon()
          // This may not always work when the page is being closed
          await fetch(apiUrl, {
            method: 'POST',
            body: blobData,
            headers: {
              'Content-Type': 'application/json'
            },
            keepalive: true
          });
        }
      }
    }
    window.addEventListener('beforeunload', cb)

    return () => window.removeEventListener('beforeunload', cb)
  }, [conversation, org.id, project.id, summarizeConversation])

  return (
    <div className="h-full">
      <div ref={chatBox} id="docs-ai-chat-box" className="lg:h-[70vh] h-[85vh]  lg:max-h-[45rem] mb-2 overflow-auto lg:border lg:border-gray-200 rounded text-sm lg:text-base leading-tight">
        {embed ? (
          <div className="p-2 items-center px-4 flex justify-between text-lg">
            <p>
              {project.botName}
            </p>
            <div className="flex gap-3">
              <button onClick={onResetChat} className="flex justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </button>
              <button onClick={onClose} className="flex justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                </svg>
              </button>

            </div>
          </div>
        ) : null}
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
              {m.sources ? (
                <div className="pt-4">
                  <div className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-green-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    <span>Sources: </span>
                  </div>
                  <div className="flex gap-3 mt-1 flex-shrink-0 flex-wrap">
                    {m.sources?.split(',').map(s =>
                      <a className="border border-gray-300 hover:bg-gray-100 shrink-0 flex-wrap text-sm p-0.5 rounded-md px-2 max-w-[300px] text-ellipsis whitespace-nowrap overflow-hidden" href={s} target="_blank" key={s} rel="noreferrer">
                        {getLinkDirectory(s)}
                      </a>
                    )}
                  </div>
                </div>
              ) : null}
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
        {answer ? (
          <div className="flex mt-1 lg:mt-4 items-start even:bg-gray-100 p-2 px-4">
            <div className="mt-1 text-xl">
              {'🤖'}
            </div>
            <div className="markdown ml-4 lg:ml-10">
              <div>
                <MarkDown markdown={answer} />
              </div>
            </div>
          </div>
        ) : null}
        {thinking ? (
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
      <div className="mb-2 flex gap-3 lg:px-0 px-2 flex-wrap shrink-0 lg:border-0 border-b border-b-gray-200 pb-2">
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
          <button type="submit" className="p-1 py-0.5 rounded-md disabled:text-gray-200 text-gray-500 " >
            {answer || latestQuestion ? <Loading /> : (
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

