import { type GetServerSidePropsContext, type NextPage } from "next";
import { type User } from "next-auth";
import Head from "next/head";
import { prisma } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";
import { ConvoRating, MessageUser, Messages, type Org, type Project } from "@prisma/client";
import superjson from "superjson";
import AppNav from "~/containers/Nav/AppNav";
import { api } from "~/utils/api";
import Link from "next/link";
import PrimaryButton, { SecondaryButton, SmallButton } from "~/components/form/button";
import { LeftChat, RightChat } from "~/containers/Chat/Chat";
import { getContrastColor } from "~/utils/color";
import { Dialog, Transition, Listbox, Switch } from "@headlessui/react";
import React, { Fragment, useState } from "react";
import { IconClear } from "~/components/icons/icons";
import { z } from "zod";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input, Label, Select } from "~/components/form/input";
import { toast } from "react-hot-toast";
import { NoChat } from "./download_chat";

export type downloadFilter = { from: string, to: string, rating: string }
const filterSchema = z.object({
  from: z.string(),
  to: z.string(),
  rating: z.string(),
  feedback: z.string().default('NO FILTER')
}).required({ from: true, to: true }).superRefine((sch, ctx) => {
  if (sch.from && sch.from > sch.to) {
    ctx.addIssue({
      code: z.ZodIssueCode.invalid_date,
      message: `Must be > ${new Date(sch.from).toLocaleString()}`,
      path: ["to"]
    });
  }
})
const ConvoRatingOptions = ['POSITIVE', 'NEGATIVE', 'NEUTRAL']
const FeedbackOptions = ['POSITIVE', 'NEGATIVE', 'ALL']


export const Sentiment: React.FC<{ rating: ConvoRating }> = ({ rating }) => {

  if (rating === 'POSITIVE') {
    return <span className="px-2 py-0.5 rounded-md bg-green-100 text-green-500">Positive</span>
  } else if (rating === 'NEGATIVE') {
    return <span className="px-2 py-0.5  rounded-md bg-red-100 text-red-500">Negative</span>
  }

  return <span className="px-2 py-0.5  rounded-md bg-slate-100 text-slate-500">Neutral</span>
}

const Chats: NextPage<{ user: User, orgJson: string, projectJson: string }> = ({ user, orgJson, projectJson }) => {
  const [showClearConvo, setShowClearConvo] = React.useState(false)
  const [showDownloadFilter, setShowDownloadFilter] = React.useState(false)
  const [showFeedbackOnly, setToggleFeedback] = React.useState(false)


  const org: Org = superjson.parse(orgJson)
  const project: Project = superjson.parse(projectJson)

  const textColor = getContrastColor(project.primaryColor)
  // const { convoId } = router.query as { convoId: string | undefined }

  const [convoId, setConvoId] = useState<string | null>(null)
  const [filterS, setFilters] = useState<any>({})

  const { register, handleSubmit, formState: { errors }, getValues, reset } = useForm<z.input<typeof filterSchema>>({ resolver: zodResolver(filterSchema) });
  const { data: convoData, isLoading: isConvoLoading, hasNextPage, fetchNextPage, refetch: refetchHistory } =
    api.conversation.getConversations.useInfiniteQuery({
      orgId: org.id, projectId: project.id, filter: filterS
    }, {
      getNextPageParam: (lastPage) => lastPage.nextCursor
    })
  const { data: currentChat, isLoading, refetch } = api.conversation.getConversation.useQuery({
    convoId: (convoId ?? convoData?.pages[0]?.conversations[0]?.id) || '',
    orgId: org.id,
    projectId: project.id
  })

  const summarizeConversation = api.conversation.summarizeConversation.useMutation()
  const clearChatHistory = api.conversation.clearChatHistory.useMutation()

  const onGenerateClicked = async () => {
    if (currentChat && currentChat.conversation) {
      await summarizeConversation.mutateAsync({ projectId: project.id, orgId: org.id, convoId: currentChat?.conversation?.id })
      await refetch()
    }
  }

  const closeDialog = (type: 'clear' | 'filter') => {
    if (type == 'clear') {
      setShowClearConvo(false)
    }
    if (type == 'filter') {
      setShowDownloadFilter(false)
    }
  }

  const onExport = () => {
    const data = getValues()
    if (Object.keys(errors).length > 0) {
      toast.error('Invalid filters')
      return
    }
    const route = `/dashboard/${org.name}/${project.slug}/download_chat?${new URLSearchParams(data).toString()}`
    window.open(route, '_blank')
  }

  const onClearHistory = async () => {
    await clearChatHistory.mutateAsync({ projectId: project.id, orgId: org.id })
    setShowClearConvo(false)
  }

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    console.log("🔥 ~ onFilter ~ errors:", errors)
    setShowDownloadFilter(false)
    setFilters(data)
    const history = await refetchHistory()
    const latestConvos = history.data?.pages[0]?.conversations
    if (latestConvos?.length) {
      setConvoId(latestConvos[0]!.id)
    }
  }

  const viewFeedbackOnly = (messages: Messages[] | undefined | null) => {
    if (!messages) return []
    let viewMessages: Messages[] = []
    if (showFeedbackOnly) {
      for (let i = 0; i < messages.length - 1; i += 1) {
        const one = messages[i]
        const two = messages[i + 1]
        if (one?.user == 'user' && two?.feedback != null) {
          viewMessages.push(one, two)
        }
      }
    }
    else {
      viewMessages = messages
    }
    return viewMessages
  }

  return (
    <>
      <Head>
        <title>Docs AI - Chats</title>
      </Head>
      <main className="h-full">
        <div className="h-full flex">
          <AppNav user={user} org={org} project={project} />
          <div className="w-full h-full">
            {convoData ? (
              <div className="px-0 h-full flex">
                <div className="w-1/3 border-r overflow-auto ">
                  <div className="text-gray-600 p-4 border-b flex justify-between">
                    <p>
                      <b> Chats </b>
                    </p>
                    <div className="flex gap-2">
                      <button className="rounded-lg  hover:bg-zinc-100 px-2" onClick={() => setShowDownloadFilter(true)} title="Export Chats">
                        {/* <IconSearch className="w-5 h-5" /> */}
                        Filter & Export
                      </button>
                      <button className=" rounded-lg px-2  text-red-500 hover:bg-red-50" onClick={() => setShowClearConvo(true)} title="Clear Chats">
                        {/* <IconClear /> */}
                        Clear
                      </button>
                    </div>
                  </div>
                  {convoData.pages.map(p => p?.conversations.map((conversation) => (
                    <button className="w-full" key={conversation.id} onClick={() => setConvoId(conversation.id)}>
                      <div className={"p-4 flex justify-between items-center  border-b w-full " + (convoId == conversation.id ? 'bg-gray-100' : '')}>
                        <div className="w-full" title={conversation.firstMsg}>
                          <p className="text-start truncate overflow-ellipsis">
                            {conversation.firstMsg} 
                          </p>
                          <div className="text-sm text-gray-600 mt-2 text-start">
                            {conversation.createdAt.toLocaleString()}
                          </div>
                        </div>
                        {/* {convoId} {conversation.id} */}
                      </div>
                    </button>
                  )))}
                  {hasNextPage ? (
                    <div className="flex p-4 justify-center">
                      <button onClick={() => fetchNextPage()} className="text-gray-700 hover:underline underline-offset-2">Load more</button>
                    </div>
                  ) : null}
                </div>
                {convoData?.pages[0]?.conversations.length ? <div className="w-2/3 overflow-auto pb-5">
                  <div className="flex justify-start items-center p-4">
                    <Link className="text-blue-500 hover:bg-blue-50 px-2 rounded-lg" href={`/dashboard/${org.name}/${project.slug}/new_document?docType=3&convoId=${convoId || ''}`}>
                      Suggest Answer
                    </Link>
                  </div>
                  <div className="border-b pb-4 px-4">
                    {project.generateSummary ? (
                      currentChat?.conversation?.summary ? (
                        <div className="bg-gray-100 rounded-md p-4 py-4 shadow-sm">
                          <p className="font-semibold text-gray-600">Summary</p>
                          <p className="mt-0.5 text-gray-700">{currentChat?.conversation?.summary}</p>
                          <div className="flex gap-4 mt-4 items-center">
                            <p className=" font-semibold text-gray-600">Sentiment</p>
                            <Sentiment rating={currentChat?.conversation?.rating || ConvoRating.NEUTRAL} />
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-100 rounded-md p-4 py-4 shadow-sm flex flex-col items-center">
                          Summary not generated
                          <SmallButton
                            loading={summarizeConversation.isLoading}
                            disabled={summarizeConversation.isLoading}
                            className="mt-4"
                            onClick={onGenerateClicked}>
                            Generate now
                          </SmallButton>
                        </div>
                      )
                    ) : <div className="bg-gray-100 rounded-md p-4 py-4 shadow-sm flex flex-col items-center">
                      You did not have summary enabled!
                      <Link href={`/dashboard/${org.name}/${project.slug}/settings`}>
                        <SmallButton className="mt-4">
                          Enable now
                        </SmallButton>
                      </Link>
                    </div>}
                  </div>
                  {
                    isLoading ?
                      <div className="text-center">Loading...</div> :
                      <div className="mt-2">
                        <div className="flex ml-2 gap-3 items-center">
                          <Label>View feedback only</Label>

                          <Switch
                            className={`${showFeedbackOnly ? 'bg-blue-600' : 'bg-gray-200'
                              } relative inline-flex h-6 w-11 items-center rounded-full`}
                            checked={showFeedbackOnly}
                            onChange={setToggleFeedback}
                          >
                            <span className="sr-only">Generate summary</span>
                            <span
                              className={`${showFeedbackOnly ? 'translate-x-6' : 'translate-x-1'
                                } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                            />
                          </Switch>
                        </div>
                        {
                          viewFeedbackOnly(currentChat?.conversation?.messages).map(m => (
                            m.user === MessageUser.assistant ? <LeftChat key={m.id} sentence={m.message + `${m.feedback != null ? m.feedback ? '(👍🏽)' : '(👎🏽)' : ''}`} sources={m.sources} /> :
                        <RightChat key={m.id} sentence={m.message} backgroundColor={project.primaryColor} color={textColor} />
                          ))}</div>
                  }
                </div> : <NoChat isConvoLoading={isLoading} message="No chats to Filter!" />}
              </div>
            ) : null
            }
          </div>
        </div>

        <Transition appear show={showClearConvo} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={() => closeDialog("clear")} static={true}> 
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </Transition.Child>
            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      Are you sure?
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-base text-gray-500">
                        You are trying to clear the <b className="text-black"> entire chat history </b>  and this action cannot be reversed
                      </p>
                    </div>

                    <div className="mt-4 flex flex-row-reverse gap-4">
                      <PrimaryButton className="border border-gray-700" onClick={() => closeDialog("clear")}>
                        Close
                      </PrimaryButton>

                      <SecondaryButton onClick={onClearHistory} disabled={clearChatHistory.isLoading} loading={clearChatHistory.isLoading ? clearChatHistory.isLoading : undefined}
                        className="border border-red-500">
                        <span className="text-red-500">  Yes, Clear </span>
                      </SecondaryButton>

                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>

        <Transition appear show={showDownloadFilter} as={Fragment}>
          <Dialog as="div" className="relative z-10" static={true} onClose={() => closeDialog('filter')}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </Transition.Child>
            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      Filter & Export
                    </Dialog.Title>
                    <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label>From </Label>
                          <Input
                            type="datetime-local"
                            placeholder="From"
                            {...register('from')}
                            error={errors.from?.message?.toString()}
                          />
                        </div>
                        <div>
                          <Label>To </Label>
                          <Input
                            type="datetime-local"
                            placeholder="To"
                            {...register('to')}
                            error={errors.to?.message?.toString()}
                          />
                        </div>
                        <div>
                          <Label>Sentiment </Label>
                          <Select {...register("rating")} defaultValue="ALL">
                            <option value="ALL"> ALL </option>
                            {ConvoRatingOptions.map((each, i) => {
                              return (
                                <option value={each} key={i}>{each}</option>
                              )
                            })}
                          </Select>
                        </div>
                        <div>
                          <Label>Feedback </Label>
                          <Select {...register("feedback")} defaultValue="NO FILTER">
                            <option value="NO FILTER"> NO FILTER </option>
                            {FeedbackOptions.map((each, i) => {
                              return (
                                <option value={each} key={i}>{each}</option>
                              )
                            })}
                          </Select>
                        </div>
                      </div>
                      <div className="my-3 rounded-lg bg-blue-50 p-3  text-blue-500"
                        role="alert">
                        We can only export 50 conversations at this time.
                      </div>
                      <div className="mt-4 flex justify-between gap-4">
                        <div>
                          <SecondaryButton type="button" className="justify-center border-none shadow-none bg-zinc-100" onClick={() => { reset() }}>
                            <IconClear /> Clear </SecondaryButton>
                        </div>
                        <div className="flex gap-4">
                          <SecondaryButton type="submit" className="justify-center">
                            Search
                          </SecondaryButton>
                          <PrimaryButton type="button" onClick={onExport}>
                            Export
                          </PrimaryButton>
                        </div>
                      </div>
                    </form>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </main>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerAuthSession(context)

  if (!session) {
    return {
      redirect: {
        destination: '/'
      }
    }
  }

  const orgname = context.query.orgname as string
  const projectSlug = context.query.projectSlug as string

  const org = await prisma.orgUser.findFirst({
    where: {
      userId: session.user.id,
      org: {
        name: orgname,
      }
    },
    include: {
      org: {
        include: {
          projects: {
            where: {
              slug: projectSlug,
            }
          }
        }
      }

    }
  })

  if (!org || org.org.projects.length === 0) {
    return {
      redirect: {
        destination: `/dashboard/${orgname}`
      }
    }
  }

  const props = {
    props: {
      user: session.user,
      orgJson: superjson.stringify(org.org),
      projectJson: superjson.stringify(org.org.projects[0])
    }
  }
  return props
}

export default Chats;