import { zodResolver } from "@hookform/resolvers/zod";
import { type Conversation, type Messages, type Org, type Project } from "@prisma/client";
import { Fragment, useEffect, useRef, useState } from "react";
import { useForm, type SubmitHandler, type FieldValues } from "react-hook-form";
import { z } from "zod";
import { Loading } from "~/components/loading/Loading"

import { api } from "~/utils/api";
import { MarkDown } from "~/components/MarkDown";
import { getLinkDirectory } from "~/utils/link";
import { useRouter } from "next/router";
import { getContrastColor } from "~/utils/color";
import { IconSend } from "~/components/icons/icons";

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
  const router = useRouter();
  const primaryColor = router.query.primaryColor as string || project.primaryColor || '#000000';
  const backgroundColor = primaryColor.toString() || '#000000'
  const textColor = getContrastColor(backgroundColor)
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
    <>
      <style>
        {
          `
          html {
            --chat-primary-color: ${primaryColor};
            --chat-secondary-color: ${primaryColor}80;
          }
          `
        }
      </style>
      <div className="h-full bg-white ">
        <div ref={chatBox} id="docs-ai-chat-box " className="lg:h-[70vh] h-[85vh]  lg:max-h-[45rem]  overflow-auto lg:border lg:border-gray-200 rounded-lg text-sm lg:text-base leading-tight ">
          {embed ? (
            <div className=" p-2.5 items-center flex justify-between text-lg  sticky top-0 z-10  bg-white" style={{ backgroundColor: backgroundColor, color: textColor }}>
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

          <LeftChat key={project.initialQuestion} sentence={project.initialQuestion || `Hi, I am ${project.botName}. How can I help?`} />

          {conversation?.messages.map((m) => (
            m.user == 'user' ?
              <RightChat key={m.id} sentence={m.message} backgroundColor={backgroundColor} color={textColor} />
              : <LeftChat key={m.id} sentence={m.message} sources={m.sources} />
          ))}

          {latestQuestion ? (
            <RightChat key={latestQuestion} backgroundColor={backgroundColor} color={textColor} sentence={latestQuestion} />
          ) : null}

          {answer ? (
            <LeftChat key={answer} sentence={answer} />
          ) : null}

          {thinking ? (
            <LeftChat key="thinking" isThinking={true} />
          ) : null}
        </div>
        {project.defaultQuestion &&
          <div className="pt-2 flex gap-3 lg:px-0 px-2 flex-wrap shrink-0 lg:border-0 border-b border-b-gray-200 pb-2">
            {project.defaultQuestion.split(',').map((q ,i) => (
              <Fragment key={i}>
                {q && <button onClick={() => getAnswer(q)} key={q} disabled={thinking || Boolean(answer)} className="text-xs text-gray-600 bg-gray-100 rounded-md py-0.5 px-1 border border-gray-300">
                  {q}
                </button>
                }</Fragment>
            ))}
          </div>
        }
        <form onSubmit={handleSubmit(onSubmit)} className="mt-2 lg:mt-4">
          <div className="flex w-full lg:border lg:border-gray-300 rounded-md p-0.5 lg:p-1">
            <input
              className="w-full lg:p-2 outline-none max-h-12 resize-none px-2"
              placeholder="Ask anything"
              {...register('question', { required: 'Question is required', minLength: 3 })}></input>
            <button type="submit" className="p-1 py-0.5 rounded-md disabled:text-gray-200 text-gray-500 " >
              {answer || latestQuestion ? <Loading /> : (
                <IconSend className="rotate-90 w-6 h-6"
                  secondaryClassName={`fill-[var(--chat-primary-color)]`}
                  primaryClassName={`fill-[var(--chat-secondary-color)]`} />
              )}
            </button>
          </div>
        </form>
      </div >
    </>

  )
}

const LeftArrow: React.FC = () => {
  return (
    <div className="absolute left-0 top-4 transform -translate-x-1/3 rotate-45 w-4 h-2 bg-gray-100 ">
    </div>
  )
}

const RightArrow: React.FC<{ backgroundColor: string }> = ({ backgroundColor }) => {
  return (
    <div className="absolute right-0 top-4 transform translate-x-1/3 rotate-45 w-4 h-2"
      style={{
        backgroundColor
      }}></div>
  )
}

export const LeftChat: React.FC<{ botName?: string | null, isThinking?: boolean, sentence?: string | null, sources?: string | null }> = ({ botName = null, isThinking = false, sentence = null, sources = null }) => {
  return (
    <div className="flex m-2 lg:m-4  lg:mt-4 mt-2">
      <div className="rounded-xl rounded-bl-none relative bg-zinc-200 p-2 px-4">
        {isThinking && <div className="markdown">
          <div className="text-gray-600">Thinking...</div>
        </div>}

        {sentence && <div className="">
          <MarkDown markdown={sentence} />
          {sources && <AnswerSources sources={sources} />}

        </div>}
        {/* <LeftArrow /> */}
      </div>

    </div>
  )
}

export const RightChat: React.FC<{ sentence: string, backgroundColor: string, color?: string }> = ({ sentence, backgroundColor, color = "#000000" }) => {
  return (
    <div className="flex m-2 lg:m-4  lg:mt-4 mt-2 justify-end ">
      <div className=" rounded-xl rounded-br-none relative p-2 px-4" style={{ backgroundColor, color }}>
        <div className="markdown">
          <div>
            <MarkDown markdown={sentence} />
          </div>
        </div>
        {/* <RightArrow backgroundColor={backgroundColor} /> */}
      </div>

    </div>
  )
}

export const AnswerSources: React.FC<{ sources: string | null }> = ({ sources = null }) => {
  return (
    <>
      {sources ? (
        <div className="pt-4">
          <div className="flex items-center gap-2 flex-wrap">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-green-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <span className="font-bold">Sources </span>
            <div className="flex gap-1 mt-1 flex-wrap">
              {sources?.split(',').map(s =>
                <a className="border border-gray-300 hover:bg-gray-100 shrink-0 flex-wrap text-sm p-0.5 rounded-md px-2 max-w-[300px] text-ellipsis whitespace-nowrap overflow-hidden" href={s} target="_blank" key={s} rel="noreferrer">
                  {getLinkDirectory(s)}
                </a>
              )}
            </div>
          </div>

        </div>
      ) : null}
    </>
  )
}
