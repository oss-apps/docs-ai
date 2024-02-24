/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { zodResolver } from "@hookform/resolvers/zod";
import { type Conversation, type Messages, type Org, type Project } from "@prisma/client";
import { Fragment, useEffect, useRef, useState } from "react";
import { useForm, type SubmitHandler, type FieldValues } from "react-hook-form";
import { z } from "zod";
import { Loading } from "~/components/loading/Loading"

import { api } from "~/utils/api";
import { MarkDown } from "~/components/MarkDown";
import { getLinkDirectory } from "~/utils/link";
import { getContrastColor } from "~/utils/color";
import { IconEmail, IconFastForward, IconSend, IconThumb } from "~/components/icons/icons";
import { toast } from "react-hot-toast";
import { Input } from "~/components/form/input";
import { PlusSquare, ShareIcon } from "lucide-react";
import { env } from "~/env.mjs";
import { type UserIdentification } from "./ChatV2";
import { Skeleton } from "~/components/ui/Skeleton";


const qnaSchema = z.object({
  question: z.string().min(3),
})

const userIdSchema = z.object({
  userId: z.string().max(60).nullable().or(z.literal('')).transform((val) => val || null),
})

const getStreamAnswer = async (projectId: string, question: string, convoId: string, userId: string | null, additionalFields: any, onMessage: (token: string) => void, onEnd: (convoId: string, isError: boolean) => void) => {
  const res = await fetch('/api/web/chat', {
    method: 'POST',
    body: JSON.stringify({
      projectId: projectId,
      question: question,
      conversationId: convoId,
      userId,
      additionalFields

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

export const ChatWidget: React.FC<{ org: Org, project: Project, userDetails?: UserIdentification['data']['userDetails'], convoId: string | null }> = ({ org, project, userDetails, convoId }) => {
  console.log("🔥 ~ userDetails:", userDetails, convoId)
  const primaryColor = project.primaryColor || '#000000';
  // const backgroundColor = primaryColor.toString() || '#000000'


  const textColor = getContrastColor(primaryColor)
  const [thinking, setThinking] = useState(false)
  const [conversation, setConversation] = useState<(Conversation & {
    messages: Messages[];
  }) | null>(null)
  const [latestQuestion, setLatestQuestion] = useState<string | null>(null)
  const [answer, setAnswer] = useState<string | null>(null)

  // Once submitted hide the askUserId Input
  const [showAskUserId, setShowAskUserId] = useState(!Boolean(userDetails?.userId))
  const [additionalFields, setAdditionalFields] = useState<any>(userDetails?.additionalFields ?? null)


  const chatBox = useRef<HTMLDivElement>(null);
  const updatefeedback = api.docGPT.updateMessageFeedback.useMutation()
  const updateUserIdAndCustomFields = api.docGPT.updateUserIdAndCustomFields.useMutation()

  const { register, handleSubmit, formState: { errors }, resetField } = useForm({ resolver: zodResolver(qnaSchema) });
  const { register: userIdReg, getValues: userIdValues, handleSubmit: userIdSubmit, formState: { errors: userIdErrors } } = useForm({
    resolver: zodResolver(userIdSchema), defaultValues: {
      userId: userDetails?.userId || ''
    }
  });

  const summarizeConversation = api.conversation.summarizeConversation.useMutation()
  const { data, isLoading: isPrevConversationLoading } = api.conversation.getConversationById.useQuery({ convoId })

  const { client } = api.useContext()

  useEffect(() => {
    const myDiv = chatBox.current;
    if (myDiv) {
      myDiv.scrollTop = myDiv.scrollHeight;
    }
  }, [latestQuestion, conversation, answer])

  useEffect(() => {
    if (!isPrevConversationLoading) {
      if (data) setConversation(data?.conversation)
    }
  }, [data, isPrevConversationLoading])

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    if (Boolean(answer || latestQuestion)) {
      return
    }
    const { question } = data as z.input<typeof qnaSchema>

    await getAnswer(question)
  };

  const getAnswer = async (question: string) => {
    // when answering don't take another questions
    const { userId } = userIdValues() as z.input<typeof userIdSchema>

    if (answer) return
    setLatestQuestion(question)
    if (userId) setShowAskUserId(false)
    try {
      resetField('question')
      setThinking(true)
      await getStreamAnswer(project.id, question, conversation?.id ?? 'new', userId, additionalFields, (token) => {
        setAnswer(token)
        setThinking(false)
      }, async (convoId, error) => {
        if (error) {
          setAnswer("Something Happened! Try again later!")
          setThinking(false)
        }
        const { conversation } = await client.conversation.getConversation.query({ orgId: org.id, projectId: project.id, convoId: convoId })

        const previousConvos = window.localStorage.getItem(`DOCSAI_CONVOS_${project.id}`)
        let convos = []
        if (previousConvos) {
          convos = JSON.parse(previousConvos)
          if (!Array.isArray(convos)) {
            convos = []
          }
        }
        setLatestQuestion(null)
        setAnswer(null)
        setConversation(conversation)

        // Check if conversation already exists in localstorage . if exists skip else add it 
        const findFromLs = convos.find(each => each.id === conversation?.id)
        if (!findFromLs) {
          window.localStorage.setItem(`DOCSAI_CONVOS_${project.id}`, JSON.stringify([{ id: conversation?.id, createdAt: conversation?.createdAt, firstMsg: conversation?.firstMsg }, ...convos].slice(0, 3)))
        }
      })
    } catch (e) {
      setThinking(false)
      console.log(e)
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
    }, { position: 'top-center' })

  }

  const onShare = async () => {
    if (!conversation) return
    const url = `${env.NEXT_PUBLIC_DOMAIN}/convo/${conversation.id}`

    try {
      await navigator.share({
        title: conversation?.firstMsg || "Sharing your conversation",
        text: conversation?.firstMsg, url
      })
    }
    catch (err) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
          toast.success(`Link copied to clipboard`, { position: 'top-center' })
        }).catch(console.error)
      }

    }
  }

  const onUserIdSubmit: SubmitHandler<FieldValues> = async (data) => {
    const { userId } = data as z.input<typeof userIdSchema>

    if (conversation?.id && userId) {
      const prom = updateUserIdAndCustomFields.mutateAsync({ userId, convoId: conversation.id })
      await toast.promise(prom, {
        loading: 'Loading ... ',
        success: 'We will get back to you soon.',
        error: 'Something went wrong!',
      }, { position: 'top-center' })
      setShowAskUserId(false)

    }

    if (!conversation?.id && userId) {
      setShowAskUserId(false)
      toast.success('We will get back to you soon.', { position: 'top-center' })
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
      <section className="h-full max-h-[700px] bg-gray-50/90 ">
        <div ref={chatBox} id="docs-ai-chat-box" className="pb-[130px] pt-2">
          <LeftChat key={project.initialQuestion} sentence={project.initialQuestion || `Hi, I am ${project.botName}. How can I help?`} />

          {conversation?.messages.map((m, i) => (
            m.user == 'user' ?
              <RightChat key={m.id} sentence={m.message} backgroundColor={primaryColor} color={textColor} />
              : <LeftChat key={m.id} sentence={m.message} showSupportEmail={project.supportEmail} sources={m.sources} feedback={{ selected: m.feedback, id: m.id, index: i, isLoading: updatefeedback.isLoading, handleFeedback, onShare }} />
          ))}

          {(convoId && isPrevConversationLoading) ? <div className="px-4 ">
            <div className="space-y-2 ">
              <div className="flex justify-end">
                <Skeleton className="h-14 w-[360px]   bg-[var(--chat-secondary-color)] rounded-xl rounded-br-none border" />
              </div>
              <Skeleton className="h-32 w-full rounded-xl rounded-bl-none border" />
              <div className="flex gap-2 ">
                <Skeleton className="h-7 w-7 " />
                <Skeleton className="h-7 w-7 " />
                <Skeleton className="h-7 w-7 " />
                <Skeleton className="h-7 w-7 " />
                <Skeleton className="h-7 w-7 " />

              </div>
            </div>
          </div> : null}

          {(project?.askUserId && showAskUserId) ?
            <div className=" max-w-lg m-2  lg:mt-4 lg:mx-4  " >
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
            </div>
            : null
          }
          {latestQuestion ? (
            <RightChat key={latestQuestion} backgroundColor={primaryColor} color={textColor} sentence={latestQuestion} />
          ) : null}

          {answer ? (
            <LeftChat key={answer} sentence={answer} />
          ) : null}

          {thinking ? (
            <LeftChat key="thinking" isThinking={true} />
          ) : null}
        </div>
        <div className="fixed bottom-[24px] w-full bg-gray-50/90">
          {project.defaultQuestion &&
            <div className="pt-2  flex gap-3  px-2 flex-wrap shrink-0 lg:border-0  bg-gray-50/90 border-b-gray-200 pb-2">
              {project.defaultQuestion.split(',').map((q, i) => (
                <Fragment key={i}>
                  {q &&
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                    <button onClick={() => getAnswer(q)} key={q} disabled={thinking || Boolean(answer)} className="text-xs text-gray-600 bg-white rounded-md py-0.5 px-1 border border-gray-300">
                      {q}
                    </button>
                  }</Fragment>
              ))}
            </div>
          }
          <form onSubmit={handleSubmit(onSubmit)} className=" w-full max-w-[450px] bg-white">
            <div className="flex  lg:border lg:border-gray-300 rounded-md p-2">

              <button type="reset" className="px-1 py-0.5 rounded-md disabled:text-gray-200 text-gray-500" disabled={Boolean(answer || latestQuestion)}
                onClick={onResetChat} accessKey="r">
                <PlusSquare className="w-6 h-6 stroke-[var(--chat-secondary-color)]" />
              </button>

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
        </div>

      </section >
    </>

  )
}

// This LeftChat applicable only for streaming / chat purposes . Not for static display. Use Plain Chat for that.
const LeftChat: React.FC<{ showSupportEmail?: string | null, isThinking?: boolean, sentence?: string | null, sources?: string | null, feedback?: { selected?: boolean | null, handleFeedback?: (feedback: boolean, id?: string, index?: number) => void, onShare: () => void, id?: string, index?: number, isLoading?: boolean } | null }> = ({ showSupportEmail = null, isThinking = false, sentence = null, sources = null, feedback = null }) => {
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
            <button title="Share" className="rounded-md border bg-zinc-100 py-1 px-2 hover:bg-zinc-200" onClick={feedback.onShare}>
              <ShareIcon className="w-4 h-4 fill-transparent stroke-zinc-600  hover:fill-zinc-200" />
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

const RightChat: React.FC<{ sentence: string, backgroundColor: string, color?: string }> = ({ sentence, backgroundColor, color = "#000000" }) => {
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

const AnswerSources: React.FC<{ sources: string | null }> = ({ sources = null }) => {
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
