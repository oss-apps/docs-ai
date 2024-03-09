import { type NextPage, type GetServerSidePropsContext } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { MarkDown } from "~/components/MarkDown";
import { getServerAuthSession } from "~/server/auth";
import { Bot, Share, User } from "lucide-react";
import HomeNav from "~/containers/Nav/HomeNav";
import { Sentiment } from "../dashboard/[orgname]/[projectSlug]/chats";
import { ConvoRating } from "@prisma/client";
import Footer from "~/containers/Footer";
import { ShareButton } from "~/components/form/button";
import DynamicSEO from "~/components/seo/Dynamic";

const ConvoPage: NextPage<{ session: boolean }> = ({ session = false }) => {

  const { convoId } = useRouter().query as { convoId: string }

  const { data, isLoading } = api.conversation.getConversationById.useQuery({ convoId })


  return (
    <>
      <Head>
        <title>{data?.conversation?.firstMsg}  DocsAI</title>
        <DynamicSEO pageTitle={data?.conversation?.firstMsg} pageDesc="Docs AI lets you share your conversations. Share Conversations, Train Documents and chat with your documents." />
      </Head>
      <HomeNav />
      <hr></hr>
      {isLoading
        ? <div className="text-center my-10 text-2xl">Loading...</div>
        : <main >
          {!data?.conversation?.id
            ? <div className="h-[60vh]">
              <p className="text-2xl text-center mt-20"> Converstion not found</p>
            </div>
            :
            <div className="w-full">
              <div className="mt-10">
                <div className="max-w-5xl mx-auto p-2 ">
                  <h1 className="text-2xl font-medium "> {data?.conversation?.firstMsg}
                    <ShareButton id={data?.conversation?.id} title={data?.conversation?.firstMsg} icon={<Share className="text-lg" />} className="ml-2" />
                  </h1>
                  {data?.conversation?.summary ? (
                    <>
                      <div className="text-xl mt-5">Summary
                        <span className="text-base ml-2">
                          <Sentiment rating={data?.conversation?.rating || ConvoRating.NEUTRAL} />
                        </span>
                      </div>
                      <div className="mt-3">
                        {data?.conversation?.summary}
                      </div>
                    </>
                  ) : null}

                  <div className="my-5 mx-auto border border-gray-200 rounded-md ">
                    {data?.conversation?.messages.map(m => (
                      <div key={m.id} className="flex mt-4 items-start even:bg-slate-100 p-2 px-4">
                        <div className="mt-1 text-xl">
                          {m.user === 'user' ? <User /> : <Bot />}
                        </div>
                        <div className="ml-10">
                          <MarkDown markdown={m.message} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          }
          <hr></hr>
          <Footer />
        </main>
      }
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerAuthSession(context)
  const props = { props: { session: Boolean(session) } }
  return props
}

export default ConvoPage;