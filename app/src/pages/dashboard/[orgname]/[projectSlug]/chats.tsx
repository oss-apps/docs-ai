import { type GetServerSidePropsContext, type NextPage } from "next";
import { type User } from "next-auth";
import Head from "next/head";
import { prisma } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";
import { type Conversation, ConvoRating, MessageUser, type Messages, type Org, type Project } from "@prisma/client";
import superjson from "superjson";
import AppNav from "~/containers/Nav/AppNav";
import { api } from "~/utils/api";
import Link from "next/link";
import PrimaryButton, { ShareButton, SmallButton } from "~/components/form/button";
import { PlainChat, RightChat } from "~/containers/Chat/Chat";
import { getContrastColor } from "~/utils/color";
import { Switch } from "@headlessui/react";
import React, { Fragment, useState } from "react";
import { IconChatHistory, IconIdentification, IconUserCheck } from "~/components/icons/icons";
import { z } from "zod";
import { type FieldValues, type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "~/components/form/input";
import { toast } from "react-hot-toast";
import { NoChat } from "./download_chat";

import { Button } from "~/components/form/button"
import { Calendar } from "~/components/ui/Calender"
import { format, formatDistanceToNow, getTime } from "date-fns"
import { Calendar as CalendarIcon, Share } from "lucide-react"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/Select"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/Popover"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/Dialog"
import { cn } from "~/lib/utils";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/Form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/Table"
import Avatar from "~/components/Avatar";
import { type AdditionFields } from "~/types";
import { ScrollArea } from "~/components/ui/ScrollArea";


export type downloadFilter = { from: string, to: string, rating: string }
const filterSchema = z.object({
  rating: z.string().default('ALL').optional(),
  feedback: z.string().default('NO FILTER').optional(),
  date: z.object({
    from: z.date(),
    to: z.date()
  }).optional()
})
const ConvoRatingOptions = [{ value: 'POSITIVE', label: 'Positive' }, { value: 'NEGATIVE', label: 'Negative' }, { value: 'NEUTRAL', label: 'Neutral' }]
const FeedbackOptions = [{ value: 'POSITIVE', label: 'Positive' }, { value: 'NEGATIVE', label: 'Negative' }, { value: 'ALL', label: 'All Feedback' }]

export const Sentiment: React.FC<{ rating: ConvoRating }> = ({ rating }) => {

  if (rating === 'POSITIVE') {
    return <span className="px-2 py-0.5 rounded-md bg-green-100 text-green-500">Positive</span>
  } else if (rating === 'NEGATIVE') {
    return <span className="px-2 py-0.5  rounded-md bg-red-100 text-red-500">Negative</span>
  }

  return <span className="px-2 py-0.5  rounded-md bg-slate-100 text-slate-500">Neutral</span>
}

const Chats: NextPage<{ user: User, orgJson: string, projectJson: string }> = ({ user, orgJson, projectJson }) => {
  const [showFeedbackOnly, setToggleFeedback] = React.useState(false)


  const org: Org = superjson.parse(orgJson)
  const project: Project = superjson.parse(projectJson)

  const textColor = getContrastColor(project.primaryColor)
  // const { convoId } = router.query as { convoId: string | undefined }

  const [convoId, setConvoId] = useState<string | null>(null)
  const [filterS, setFilters] = useState<Record<string, any>>({})

  const filterForm = useForm<z.input<typeof filterSchema>>({ resolver: zodResolver(filterSchema) });
  const { handleSubmit, formState: { errors }, getValues, reset } = filterForm
  const { data: convoData, hasNextPage, fetchNextPage, refetch: refetchHistory } =
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
  const clearConversation = api.conversation.clearConversation.useMutation()


  const onGenerateClicked = async () => {
    if (currentChat && currentChat.conversation) {
      await summarizeConversation.mutateAsync({ projectId: project.id, orgId: org.id, convoId: currentChat?.conversation?.id })
      await refetch()
    }
  }

  const onExport = () => {
    const data = getValues()
    if (Object.keys(errors).length > 0) {
      toast.error('Invalid filters')
      return
    }
    const queryData = {
      ...(data.date?.to ? { to: getTime(data.date.to).toString() } : {}),
      ...(data.date?.from ? { from: getTime(data.date.from).toString() } : {}),
      feedback: data.feedback || 'NO FILTER',
      rating: data.rating || 'ALL'

    }
    const route = `/dashboard/${org.name}/${project.slug}/download_chat?${new URLSearchParams(queryData).toString()}`
    window.open(route, '_blank')
  }

  const onClearHistory = async () => {
    await clearChatHistory.mutateAsync({ projectId: project.id, orgId: org.id })
    await refetchHistory()
  }

  const onClearConversation = async (id: string | undefined) => {
    if (!id) return
    try {

      await clearConversation.mutateAsync({ projectId: project.id, id })
      const history = await refetchHistory()
      const latestConvos = history.data?.pages[0]?.conversations
      if (latestConvos?.length && latestConvos[0]) {
        setConvoId(latestConvos[0].id)
      }
      await refetch()
    }
    catch (err) {
      toast.error('problem deleting conversation ')
    }
  }

  const onSubmit: SubmitHandler<FieldValues> = async () => {
    const filter = getValues()
    const filterData = { from: filter?.date?.from, to: filter?.date?.to, rating: filter.rating, feedback: filter.feedback }

    setFilters(filterData)
    const history = await refetchHistory()
    const latestConvos = history.data?.pages[0]?.conversations
    if (latestConvos?.length && latestConvos[0]) {
      setConvoId(latestConvos[0].id)
    }
  }

  const onClearFilter = () => {
    reset({ date: { from: undefined, to: undefined }, feedback: 'NO FILTER', rating: 'ALL' })
    setFilters({})
    console.log(getValues())

  }

  const getAddtionalFields = (af: {
    conversation: (Conversation & {
      messages: Messages[];
    }) | null;
  } | undefined) => {
    return (af?.conversation?.additionalFields as AdditionFields)
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

  const objectToKeyValues = (object: any) => {
    let keyValues = []
    if (typeof (object) === 'object') {

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      keyValues = Object.keys(object).map(e => {
        return {
          key: e,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          value: JSON.stringify(object[e])
        }
      })
    }
    else {
      keyValues.push({ key: JSON.stringify(object), value: JSON.stringify(object) })
    }

    return keyValues
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
              <div className="px-0 h-full flex flex-wrap sm:flex-nowrap flex-row sm:flex-row ">
                <ScrollArea className="w-full sm:w-1/3 border ">
                  <div className="text-gray-600 p-4 border-b flex justify-between">
                    <p>
                      <b> Chats </b>
                    </p>

                    <div className="flex  gap-2">
                      <Dialog>
                        <DialogTrigger className="rounded-lg  hover:bg-zinc-100 px-2">
                          Filter & Export  </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle> Filter & Export Conversations</DialogTitle>
                            {/* <DialogDescription> You can export upto last 50 conversations of the applied filter</DialogDescription> */}
                            <Form {...filterForm}>
                              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                                <FormField control={filterForm.control} name="date" render={({ field }) => (
                                  <FormItem className="flex flex-col">
                                    <div className="flex flex-col gap-4">
                                      <div className={cn("grid gap-2")}>
                                        <Popover>
                                          <Label> Date Range</Label>
                                          <PopoverTrigger asChild>
                                            <Button
                                              id="date"
                                              variant={"outline"}
                                              className={cn(
                                                " justify-between text-left font-normal"
                                              )}
                                            >

                                              {field?.value?.from ? (
                                                field?.value?.to ? (
                                                  <>
                                                    {format(field.value.from, "LLL dd, y")} -{" "}
                                                    {format(field.value.to, "LLL dd, y")}
                                                  </>
                                                ) : (
                                                  format(field.value.from, "LLL dd, y")
                                                )
                                              ) : (
                                                <span className="text-sm">Filter conversations by date range</span>
                                              )}  <CalendarIcon className=" h-4 w-4" />
                                            </Button>
                                          </PopoverTrigger>
                                          <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                              initialFocus
                                              mode="range"
                                              defaultMonth={field.value?.from}
                                              selected={field.value}
                                              onSelect={field.onChange}
                                              min={2}
                                              disabled={(date) =>
                                                date > new Date() || date < new Date("1900-01-01")
                                              }

                                              numberOfMonths={1}
                                            />
                                          </PopoverContent>
                                        </Popover>
                                      </div>
                                    </div>
                                  </FormItem>
                                )} />

                                <FormField
                                  control={filterForm.control}
                                  name="rating"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Sentiment</FormLabel>
                                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                        <FormControl>
                                          <SelectTrigger>
                                            {field.value ? <SelectValue placeholder="Filter conversations by sentiment" /> : "Filter conversations by sentiment"}
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {ConvoRatingOptions.map((each, i) => {
                                            return (
                                              <SelectItem value={each.value} key={i}>{each.label}</SelectItem>
                                            )
                                          })}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={filterForm.control}
                                  name="feedback"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Feedback</FormLabel>
                                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                        <FormControl>
                                          <SelectTrigger>
                                            {field.value ? <SelectValue placeholder="Filter conversations by feedback" /> : "Filter conversations by feedback"}
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {FeedbackOptions.map((each, i) => {
                                            return (
                                              <SelectItem value={each.value} key={i}>{each.label}</SelectItem>
                                            )
                                          })}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <DialogFooter className="flex sm:justify-between gap-2">

                                  <Button type="button" variant="secondary" className="justify-center" onClick={() => { onClearFilter() }}>
                                    Clear
                                  </Button>
                                  <div className="gap-2 flex flex-col sm:flex-row">
                                    <Button type="submit" className="justify-center">
                                      Search
                                    </Button>
                                    <Button type="button" variant="outline" onClick={onExport}>
                                      Export
                                    </Button>
                                  </div>

                                </DialogFooter>
                              </form>
                            </Form>
                          </DialogHeader>
                        </DialogContent>
                      </Dialog>
                      <Dialog>
                        <DialogTrigger className=" rounded-md px-2  text-red-500 hover:bg-red-50"> Clear   </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Are you sure? </DialogTitle>
                            <DialogDescription>
                              You are trying to clear the  entire chat history   and this action cannot be undone
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter className="gap-2">
                            <DialogClose asChild>
                              <Button variant='outline' >
                                Cancel
                              </Button>
                            </DialogClose>
                            <DialogClose asChild>
                              <Button className="border" variant='destructive' onClick={onClearHistory} disabled={clearChatHistory.isLoading} >
                                Clear forever
                              </Button>
                            </DialogClose>

                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  {convoData.pages.map(p => p?.conversations.map((conversation) => (
                    <button className="w-full select-text " key={conversation.id} onClick={() => setConvoId(conversation.id)}>
                      <div className={"p-2 sm:p-4 border-b w-full hover:bg-gray-50 " + (convoId == conversation.id ? 'bg-gray-100' : '')}>
                        <div className="w-full" title={conversation.firstMsg}>
                          <p className="max-w-full text-left text-base">
                            {conversation.firstMsg.slice(0, 60) + (conversation.firstMsg.length > 50 ? '...' : '')}
                          </p>
                          <div className="text-sm flex justify-between text-gray-600 mt-2 " >
                            <span title={conversation.createdAt.toLocaleString()}>  {formatDistanceToNow(conversation.createdAt, { addSuffix: true })} </span>
                            <div className="flex gap-2">
                              <span className={`font-semibold ${conversation?.userId ? 'block' : 'invisible'}`}>  <IconUserCheck className="w-4 h-4" /> </span>

                            </div>                              
                          </div>
                        </div>
                        {/* <span>   {conversation.id} </span> */}
                      </div>
                    </button>
                  )))}
                  {hasNextPage ? (
                    <div className="flex p-4 justify-center">
                      <button onClick={() => fetchNextPage()} className="text-gray-700 hover:underline underline-offset-2">Load more</button>
                    </div>
                  ) : null}
                </ScrollArea>
                {convoData?.pages[0]?.conversations.length ?
                  <ScrollArea className="w-full border sm:w-2/3   pb-16">
                  <div className="flex justify-between items-center p-4">
                      <Link className="text-blue-500 hover:bg-blue-50 px-2 rounded-lg" href={`/dashboard/${org.name}/${project.slug}/new_document?docType=CHAT&convoId=${currentChat?.conversation?.id || ''}`}>
                      Suggest Answer
                    </Link>
                      <div className="flex items-center gap-x-2">
                        <ShareButton id={currentChat?.conversation?.id} title={currentChat?.conversation?.firstMsg} icon={<span className="rounded-lg  hover:bg-zinc-100 text-zinc-600 px-2"> Share</span>} />

                      <Dialog>
                        <DialogTrigger className=" rounded-md px-2  text-red-500 hover:bg-red-50"> Delete   </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Are you sure? </DialogTitle>
                            <DialogDescription>
                              You are trying to delete the conversation and this action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter className="gap-2">
                            <DialogClose asChild>
                              <Button variant='outline' >
                                Cancel
                              </Button>
                            </DialogClose>
                            <DialogClose asChild>
                              <Button className="border" variant='destructive' onClick={() => onClearConversation(currentChat?.conversation?.id)} disabled={clearChatHistory.isLoading} >
                                Delete forever
                              </Button>
                            </DialogClose>

                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      </div>
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
                          <div className="bg-gray-100 rounded-md p-4  shadow-sm flex flex-col items-center">
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
                    ) : <div className="bg-gray-100 rounded-md p-4 shadow-sm flex flex-col items-center">
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
                        <div className="flex mx-4 mb-4 flex-wrap justify-between gap-3 items-center">
                          <div className="flex gap-1">
                            <span className={`px-2  font-semibold ${currentChat?.conversation?.userId ? 'block' : 'invisible'}`}>
                              {currentChat?.conversation?.userId}
                            </span>
                            {getAddtionalFields(currentChat) &&
                              <Dialog>
                                <DialogTrigger className="px-1 hover:bg-slate-100 rounded-md">
                                  <IconIdentification />
                                </DialogTrigger>
                                <DialogContent>
                                  <div className="flex gap-2 justify-center items-center">
                                    {getAddtionalFields(currentChat).avatarUrl &&
                                      <Avatar src={getAddtionalFields(currentChat).avatarUrl} uid="" srcIsUid size={40} />}

                                    <div className="flex flex-col">
                                      {getAddtionalFields(currentChat).name &&
                                        <span className="font-semibold"> {getAddtionalFields(currentChat).name} </span>}

                                      {getAddtionalFields(currentChat).userEmail &&
                                        <span className="text-sm"> {getAddtionalFields(currentChat).userEmail} </span>}
                                    </div>
                                  </div>

                                  <Table className="rounded-md ">
                                    <TableHeader>
                                      <TableRow className="bg-slate-100">
                                        <TableHead>Key</TableHead>
                                        <TableHead>Value</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {
                                        objectToKeyValues(getAddtionalFields(currentChat)).map((each, i) => (
                                          <TableRow key={i}>
                                            <TableCell className="text-sm">{each.key}</TableCell>
                                            <TableCell className="text-sm break-all">{each.value}</TableCell>
                                          </TableRow>
                                        )
                                        )
                                      }
                                    </TableBody>
                                  </Table>
                                </DialogContent>
                              </Dialog>

                            }
                          </div>                        
                          <div className="flex gap-3">
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
                            <Label>View feedback only</Label>

                          </div>

                        </div>
                        {
                          viewFeedbackOnly(currentChat?.conversation?.messages).map(m => (
                            m.user === MessageUser.assistant ?
                              <PlainChat key={m.id} sentence={m.message} sources={m.sources} feedback={{ selected: m.feedback }}  showSources={true}/>
                              :
                              <RightChat key={m.id} sentence={m.message} backgroundColor={project.primaryColor} color={textColor} />
                          ))}</div>
                  }
                  </ScrollArea> : <div className="flex justify-center flex-col items-center mx-auto">
                    <NoChat isConvoLoading={isLoading} message="No conversations yet, but you can change that." />
                    <Link href={`/dashboard/${org.name}/${project.slug}/yourbot`} className="my-2">
                      <PrimaryButton className="mx-auto  justify-center gap-2">
                        <IconChatHistory className="w-5 h-5" primaryClassName="fill-slate-500" secondaryClassName="fill-slate-100" />
                        Start Conversation</PrimaryButton>
                    </Link>
                  </div>
                }
              </div>
            ) : null
            }
          </div>
        </div>     

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