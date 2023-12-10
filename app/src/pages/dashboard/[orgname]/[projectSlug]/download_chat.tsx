import { GetServerSidePropsContext, NextPage } from "next";
import { useSearchParams } from 'next/navigation'
import { type User } from "next-auth";
import { ConvoRating, type Org, type Project } from "@prisma/client";
import { getServerAuthSession } from "~/server/auth";
import { prisma } from "~/server/db";
import superjson from "superjson";
import { api } from "~/utils/api";
import { PlainChat } from "~/containers/Chat/Chat";
import { Sentiment } from "./chats";
import PrimaryButton from "~/components/form/button";
import Head from "next/head";
import { parse, toDate } from "date-fns";
import Image from "next/image";

const DownloadChat: NextPage<{ user: User, orgJson: string, projectJson: string }> = ({ user, orgJson, projectJson }) => {

  const org: Org = superjson.parse(orgJson)
  const project: Project = superjson.parse(projectJson)
  const query = useSearchParams()

  const [rating, feedback] = [query.get('rating'), query.get('feedback')]
  let from: string | Date | null = query.get('from')
  let to: string | Date | null = query.get('to')
  console.log("🔥 ~ from:", from)
  console.log("🔥 ~ to:", to)

  from = from ? toDate(parseInt(from)) : null
  to = to ? toDate(parseInt(to)) : null


  console.log("🔥 ~ [from, to, rating, feedback]:", [rating, feedback], from, to)

  const { data: convos, isLoading, refetch } = api.conversation.downloadConversations.useQuery({
    orgId: org.id,
    projectId: project.id,
    filter: { from, to, rating, feedback: (feedback as string) }
  })
  return (
    <>
      {
        isLoading || !convos || !convos.length ?
          <div className="w-full sm:h-screen p-1 flex justify-center flex-col items-center">
          <NoChat isConvoLoading={isLoading} message="No chats to download!" />
          </div>
          :
          <>
            <Head>
              <title>{convos.length} Conversation(s)  {from && to ? new Date(from).toLocaleString() + ' - ' + new Date(to).toLocaleString() : ''}</title>
            </Head>
            <div className="w-[768px] mx-auto my-4 p-3 md:p-0">
              {
                convos.map((convo, i) => {
                  return <div className="my-2" key={i}>
                    <div className="flex justify-between items-center gap-4">
                      <div>
                        <b> Question {i + 1} </b>
                      </div>
                      <div className="flex justify-end items-center gap-4">
                        <p> {parseFloat((convo.messages.length / 2).toString())} Conversation(s)</p>
                        <p> {convo.createdAt.toLocaleString()}</p>
                        <Sentiment rating={convo?.rating || ConvoRating.NEUTRAL} />
                      </div>
                    </div>
                    <div>
                      {convo.summary ? <div className="p-2 my-2 border rounded-md">
                        <b>Summary</b> -  {convo.summary}
                      </div> : <></>}
                      {convo?.messages.map((m, i) => (

                        m.user != 'user' ?
                          <PlainChat key={m.id} sentence={m.message} feedback={{ selected: m.feedback }} sources={m.sources} />
                          :
                          <div className="flex items-center" key={i}>
                            <PlainChat key={m.id} sentence={m.message} color="#000" backgroundColor="#FFF" />
                            ({i / 2 + 1})
                          </div>

                      ))}

                      <hr className="my-8"></hr>
                    </div>
                  </div>
                })
              }
              <div className="text-end">
                <p>  {convos.length} Conversation(s) </p>
                <p> Sentiment - {rating} , Feedback - {feedback} </p>
                <p> {from && to ? new Date(from).toLocaleString() + ' - ' + new Date(to).toLocaleString() : ''}</p>

              </div>
              <div className="pb-32 print:hidden"></div>
              <div className="relative print:hidden">
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2  p-2 rounded-lg">
                  <div className="flex  justify-center gap-4">
                    <PrimaryButton onClick={() => window.print()}> Download</PrimaryButton>
                  </div>
                </div>
              </div>
            </div>

          </>

      }
    </>
  )
}

export const NoChat: React.FC<{ isConvoLoading: boolean, message: string }> = ({ isConvoLoading, message }) => {
  return (
    <>
      <Image src="/illus/no-chat.svg" height={450} width={450} alt="empty chats" className="justify-center" />
      <div className="text-center  text-gray-600">
          {isConvoLoading ? 'Loading...' :
          <div className="my-3 rounded-lg p-2 max-w-sm mx-auto"
              role="alert">
              {message}
          </div>}
      </div>
    </>
  )

}

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
      projectJson: superjson.stringify(org.org.projects[0]),
    }
  }
  return props
}

export default DownloadChat;
