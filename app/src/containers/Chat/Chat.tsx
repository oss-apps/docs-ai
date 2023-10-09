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
import { IconEmail, IconFastForward, IconSend, IconThumb } from "~/components/icons/icons";
import { toast } from "react-hot-toast";
import { Input } from "~/components/form/input";


const qnaSchema = z.object({
  question: z.string().min(3),
})

const userIdSchema = z.object({
  userId: z.string().max(60).nullable().or(z.literal('')).transform((val) => val || null),
})

const getStreamAnswer = async (projectId: string, question: string, convoId: string, userId: string | null, onMessage: (token: string) => void, onEnd: (convoId: string, isError: boolean) => void) => {
  const res = await fetch('/api/web/chat', {
    method: 'POST',
    body: JSON.stringify({
      projectId: projectId,
      question: question,
      conversationId: convoId,
      userId: userId

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
            onEnd(convoId, false)
          }
          break;
        }
        result += dataResults;
        onMessage(result)
      }

      if (done) {
        onEnd(convoId, false)
        break;
      }
    }
  } else {
    onEnd(convoId, true)
  }
}

export const ChatBox: React.FC<{ org: Org, project: Project, isPublic?: boolean, embed?: boolean }> = ({ org, project, embed = false }) => {
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

  // Once submitted hide the askUserId Input
  const [showAskUserId, setShowAskUserId] = useState(true)


  const chatBox = useRef<HTMLDivElement>(null);
  const updatefeedback = api.docGPT.updateMessageFeedback.useMutation()
  const updateUserIdAndCustomFields = api.docGPT.updateUserIdAndCustomFields.useMutation()

  const { register, handleSubmit, formState: { errors }, resetField } = useForm({ resolver: zodResolver(qnaSchema) });
  const { register: userIdReg, getValues: userIdValues, handleSubmit: userIdSubmit, formState: { errors: userIdErrors }, resetField: userIdResetField } = useForm({ resolver: zodResolver(userIdSchema) });


  const summarizeConversation = api.conversation.summarizeConversation.useMutation()
  const { client } = api.useContext()


  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    const { question } = data as z.input<typeof qnaSchema>
    const { userId } = userIdValues() as z.input<typeof userIdSchema>

    await getAnswer(question, userId)
  };


  const getAnswer = async (question: string, userId: string | null) => {
    setLatestQuestion(question)
    if (userId) setShowAskUserId(false)
    try {
      resetField('question')
      setThinking(true)
      await getStreamAnswer(project.id, question, conversation?.id ?? 'new', userId, (token) => {
        setAnswer(token)
        setThinking(false)
      }, async (convoId, error) => {
        if (error) {
          setAnswer("Something Happened! Try again later!")
          setThinking(false)
        }
        const { conversation } = await client.conversation.getConversation.query({ orgId: org.id, projectId: project.id, convoId: convoId })
        setLatestQuestion(null)
        setAnswer(null)
        setConversation(conversation)
      })
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

  const handleFeedback = async (feedback: boolean, id?: string, index?: number) => {
    if (!id) return
    const prom = updatefeedback.mutateAsync({ feedback, id })
    await toast.promise(prom, {
      loading: 'Sending your feedback .. ',
      success: feedback ? 'Thanks for your feedback!' : 'We will improve our services!',
      error: 'Something went wrong!',
    }, { position: embed ? 'top-center' : 'bottom-center' })

  }

  const onUserIdSubmit: SubmitHandler<FieldValues> = async (data) => {
    const { userId } = data as z.input<typeof userIdSchema>

    if (conversation?.id && userId) {
      const prom = updateUserIdAndCustomFields.mutateAsync({ userId, convoId: conversation.id })
      await toast.promise(prom, {
        loading: 'Loading ... ',
        success: 'We will get back to you soon.',
        error: 'Something went wrong!',
      }, { position: embed ? 'top-center' : 'bottom-center' })
      setShowAskUserId(false)

    }

    if (!conversation?.id && userId) {
      setShowAskUserId(false)
      toast.success('We will get back to you soon.', { position: embed ? 'top-center' : 'bottom-center' })
    }
  }

  useEffect(() => {
    const cb = async () => {
      if (document.visibilityState === "hidden") {
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
    }
    window.addEventListener('visibilitychange', cb)

    return () => window.removeEventListener('visibilitychange', cb)
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
        <div ref={chatBox} id="docs-ai-chat-box " className="h-[83vh] lg:h-[70vh]  lg:max-h-[45rem] no-scrollbar overflow-auto border border-gray-200 rounded-lg text-sm lg:text-base leading-tight ">
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

          {conversation?.messages.map((m, i) => (
            m.user == 'user' ?
              <RightChat key={m.id} sentence={m.message} backgroundColor={backgroundColor} color={textColor} />
              : <LeftChat key={m.id} sentence={m.message} showSupportEmail={project.supportEmail} sources={m.sources} feedback={{ selected: m.feedback, id: m.id, index: i, isLoading: updatefeedback.isLoading, handleFeedback }} />
          ))}


          {(project?.askUserId && showAskUserId) ? <div className=" max-w-lg m-2  lg:mt-4 lg:mx-4  " >
            <form onSubmit={userIdSubmit(onUserIdSubmit)} className={`flex items-center outline-none border-2 rounded-lg rounded-bl-none `} style={{ borderColor: project.primaryColor + '80' }} >
              <Input type='email'
                className=" border-none focus:bg-transparent"
                placeholder={project.askUserId}
                {...userIdReg('userId')}
                error={userIdErrors.userId?.message?.toString()} />
              <button className="mr-2" type="submit">
                <IconFastForward className="w-5 h-5 hover:cursor-pointer" secondaryClassName={`fill-[var(--chat-primary-color)]`}
                  primaryClassName={`fill-[var(--chat-secondary-color)]`} />
              </button>

            </form>
          </div> : null             
          }
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
            {project.defaultQuestion.split(',').map((q, i) => (
              <Fragment key={i}>
                {q &&
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                  <button onClick={() => getAnswer(q, userIdValues("userId"))} key={q} disabled={thinking || Boolean(answer)} className="text-xs text-gray-600 bg-gray-100 rounded-md py-0.5 px-1 border border-gray-300">
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

export const LeftArrow: React.FC = () => {
  return (
    <div className="absolute left-0 top-4 transform -translate-x-1/3 rotate-45 w-4 h-2 bg-gray-100 ">
    </div>
  )
}

export const RightArrow: React.FC<{ backgroundColor: string }> = ({ backgroundColor }) => {
  return (
    <div className="absolute right-0 top-4 transform translate-x-1/3 rotate-45 w-4 h-2"
      style={{
        backgroundColor
      }}></div>
  )
}


// This LeftChat applicable only for streaming / chat purposes . Not for static display. Use Plain Chat for that.
export const LeftChat: React.FC<{ showSupportEmail?: string | null, isThinking?: boolean, sentence?: string | null, sources?: string | null, feedback?: { selected?: boolean | null, handleFeedback?: (feedback: boolean, id?: string, index?: number) => void, id?: string, index?: number, isLoading?: boolean } | null }> = ({ showSupportEmail = null, isThinking = false, sentence = null, sources = null, feedback = null }) => {
  const copySupportEmail = () => {
    if (!showSupportEmail) return
    navigator.clipboard.writeText(showSupportEmail).then(() => {
      toast.success(`${showSupportEmail} copied`, { position: 'top-center' })
    }).catch(() => { toast.error('Something went wrong!', { position: 'top-center' }) })

  }
  return (
    <div>
      <div className="flex m-2  lg:mt-4 lg:mx-4 mt-2 ">
        <div className="relative p-2 px-4 bg-zinc-100 rounded-xl rounded-bl-none border">
        {isThinking && <div className="markdown">
          <div className="text-gray-600">Thinking...</div>
        </div>}

          {sentence && <div>
          <MarkDown markdown={sentence} />
            {sources && <AnswerSources sources={sources} />}
        </div>}
        </div>
      </div>
      {
        feedback &&
        <div className="flex justify-between lg:justify-start m-2 lg:mx-4 gap-2">
          <div className="flex gap-2 ">
          <button title="Thumbs Up!" className="rounded-md border bg-zinc-100 py-1 px-2 hover:bg-zinc-200" disabled={feedback.isLoading} onClick={() => feedback?.handleFeedback!(true, feedback.id, feedback.index)}>
            <IconThumb className="w-4 h-4 fill-transparent stroke-zinc-600  hover:fill-zinc-200" />
          </button>
          <button title="Thumbs down!" className="rounded-md border bg-zinc-100 py-1 px-2 hover:bg-zinc-200" disabled={feedback.isLoading} onClick={() => feedback?.handleFeedback!(false, feedback.id, feedback.index)}>
              <IconThumb className="w-4 h-4 fill-transparent stroke-zinc-600 rotate-180 hover:fill-zinc-200" />
            </button>
            </div>
            {showSupportEmail && <div className="flex gap-2">
              <a title="Support" href={`mailto:${showSupportEmail}`} className="flex  items-center rounded-md border hover:cursor-pointer bg-zinc-100 px-1.5 hover:bg-zinc-200">
                <IconEmail className="w-4 h-4 fill-transparent stroke-zinc-600  hover:fill-zinc-200" />
              </a>
              <button title="Copy Email" className="flex items-center rounded-md border hover:cursor-pointer bg-zinc-100 px-1.5  hover:bg-zinc-200" onClick={() => copySupportEmail()}>
                <span className="text-zinc-600 text-lg"> @ </span>
              </button>
            </div>}
        </div>
      }
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

export const PlainChat: React.FC<{ sentence?: string | null, sources?: string | null, backgroundColor?: string, color?: string, feedback?: { selected: boolean | null } }> = ({ sentence = null, sources = null, backgroundColor, color, feedback }) => {
  return (
    <div className="m-2 lg:m-4 mt-2">
      <div className="rounded-md relative bg-zinc-100 p-2" style={{ backgroundColor, color }}>
        {sentence && <div>
          <MarkDown markdown={sentence} />

          {sources && <AnswerSources sources={sources} />}
          {<div className="flex justify-start gap-1">
            <div className="flex gap-2 mt-2 items-center">
              {feedback?.selected == null ? '' : feedback.selected ? <> <IconThumb className="w-4 h-4 stroke-green-500 " /><span>Feedback</span> </> : <><IconThumb className="w-4 h-4 rotate-180 stroke-red-500" />  <span> Feedback</span> </>}

            </div>

          </div>}
        </div>}
      </div>
    </div>
  )
}

