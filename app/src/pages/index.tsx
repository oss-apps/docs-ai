import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

import Image from "next/image";
import PrimaryButton from "~/components/form/button";
import { AuthButton } from "~/containers/Nav/AuthButton";
import HomeNav from "~/containers/Nav/HomeNav";
import Footer from "~/containers/Footer";
import { IconChat, IconCode, IconCollection, IconLockOpen, IconPieChart, IconSearch, IconSettings, IconWebsite, IconWidget } from "~/components/icons/icons";

const Home: NextPage = () => {

  return (
    <>
      <Head>
        <title>Docs AI</title>
        <link rel="icon" href="/images/favicon.ico" />
      </Head>
      <div className="background h-[70vh]">
        <HomeNav />
        <main className="mx-auto max-w-6xl mb-8 px-4 lg:px-0">
          <div className="container flex flex-col items-center justify-center gap-12 px-4  mt-20 mb-8">
            <h1 className=" text-gray-800 text-4xl lg:text-6xl font-semibold  max-w-3xl justify-center text-center">
              Create <span className="heading-text">AI support agents</span> with your documents.
            </h1>
          </div>
          <AuthButton />
          <section className="my-16 rounded-lg  flex justify-center ">
            <div className="conic rounded-lg">
              <Image src="/images/app.webp" alt="App" width={1000} height={800} className="rounded-lg border border-blue-100 relative shadow-2xl"></Image>
            </div>
          </section>
        </main>

        <section className=" bg-black mb-16  flex justify-center text-slate-200">
          <div className="max-w-6xl my-36">
            <p className="my-12 mx-auto w-full text-center text-4xl font-semibold" >Build your agent with 3 simple steps</p>
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-20 mb-16 px-4">
              <div className="">
                <div className="text-lg font-semibold border border-slate-100 rounded-full w-10 h-10 flex justify-center items-center p-1 text-slate-100">1</div>
                <p className=" font-semibold flex items-center mt-2 text-xl">
                  Train data
                </p>
                <p className="mt-2 text-slate-300">Add your Websites / PDFs / Docx / Text you want to train.</p>
              </div>
              <div className="">
                <div className="text-lg font-semibold border border-slate-100 rounded-full w-10 h-10 flex justify-center items-center p-1 text-slate-100">2</div>
                <p className=" font-semibold flex items-center mt-2 text-xl">
                  Test your agent
                </p>
                <p className="mt-2 text-slate-300">Ask various questions to your bot to see the performance</p>
              </div>
              <div className="">
                <div className="text-lg font-semibold border border-slate-100 rounded-full w-10 h-10 flex justify-center items-center p-1 text-slate-100">3</div>
                <p className=" font-semibold flex items-center mt-2 text-xl">
                  Embed to your website
                </p>
                <p className="mt-2 text-slate-300">Embed the chatbot to your site in one line of code</p>
              </div>
            </section>
          </div>

        </section>
        <section className="mx-auto max-w-6xl px-4 lg:px-0">
          <p className="mt-16 text-center text-2xl font-semibold title-underline">Features</p>
          <section className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-20 pb-10 px-4">
            <div className="simple-card ">
              <IconCollection />
              <p className=" font-semibold flex items-center mt-2">
                Multiple Sources
              </p>
              <p className="mt-2 text-gray-700">Add as many websites, text, pdf, docx you want for same bot. More source types are coming to DocsAI.</p>
            </div>
            <div className="simple-card ">
              <IconWebsite />
              <p className=" font-semibold flex items-center mt-2">
                Embed in any site
              </p>
              <p className="mt-2 text-gray-700">Embed chat widget to any website you want. You can also share a link that others can use.</p>
            </div>

            <div className="simple-card">
              <IconSettings />
              <p className=" font-semibold flex items-center mt-2">
                Suggest Answers
              </p>
              <p className="mt-2 text-gray-700">Did not like the answer? You can suggest better answers and bot will correct itself.</p>
            </div>
            <div className="simple-card ">
              <IconWidget />
              <p className=" font-semibold flex items-center mt-2">
                Integrations
              </p>
              <p className="mt-2 text-gray-700">DocsAI integrates with Slack. Integration with Crisp, Discord & Other datasources like DB are coming soon.</p>
            </div>
            <div className="simple-card ">
              <IconCode />
              <p className=" font-semibold flex items-center mt-2">
                API
              </p>
              <p className="mt-2 text-gray-700">Need custom integration? Well you can use our APIs to interact with the bot directly.</p>
            </div>
            <div className="simple-card ">
              <IconLockOpen />
              <p className=" font-semibold flex items-center mt-2">
                Open source
              </p>
              <p className="mt-2 text-gray-700">
                I support open source, but it&apos;s harder to maintain than a company, so I&apos;ll only do it if there&apos;s enough need.
                <a href="https://github.com/docs-ai/docs-ai" target="_blank" className="text-blue-600" rel="noreferrer"> Star on github</a>
              </p>
            </div>
            <div className="simple-card ">
              <IconChat />
              <p className=" font-semibold flex items-center mt-2">
                Export conversations
              </p>
              <p className="mt-2 text-gray-700">
                Analyze your chat data to identify trends and improve customer satisfaction                </p>
            </div>
            <div className="simple-card ">
              <IconSearch />
              <p className=" font-semibold flex items-center mt-2">
                Unlimited search <span className="pro-chip"> Pro </span>
              </p>
              <p className="mt-2 text-gray-700">Chat credits are over? Don&apos;t worry! App will still search through documents and give you relevant files.</p>
            </div>
            <div className="simple-card ">
              <IconPieChart />
              <p className=" font-semibold flex items-center mt-2">
                Get summary and insights  <span className="pro-chip"> Pro </span>
              </p>
              <p className="mt-2 text-gray-700">Get summary of each conversation and mood of the users.</p>
            </div>

          </section>
          <section className="mt-32 px-4 lg:px-0 pb-32">
            <p className="text-center text-2xl font-semibold">Use cases</p>
            <div className="w-full mt-20 justify-between border-b pb-20 flex flex-wrap">
              <div>
                <p className="font-semibold text-2xl">Customer support agent</p>
                <div className="flex gap-2 items-start mt-5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-zinc-500 mt-1.5">
                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                  </svg>
                  <p className="lg:text-xl text-gray-600">
                    Answers customer questions
                  </p>
                </div>
                <div className="flex gap-2 items-start mt-3">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-zinc-500 mt-1.5">
                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                  </svg>
                  <p className=" lg:text-xl text-gray-600">
                    Read through chats and provide suggestion
                  </p>
                </div>
                <div className="flex gap-2 items-start mt-3">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-zinc-500 mt-1.5">
                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                  </svg>
                  <p className=" lg:text-xl text-gray-600">
                    Generate summary for each conversation
                  </p>
                </div>
                <div className="flex gap-2 items-start mt-3">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-zinc-500 mt-1.5">
                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                  </svg>
                  <p className=" lg:text-xl text-gray-600">
                    Get customer mood
                  </p>
                </div>
                <div className="flex gap-2 items-start mt-3">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-zinc-500 mt-1.5">
                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                  </svg>
                  <p className=" lg:text-xl text-gray-600">
                    Integrate with tools like crisp (coming soon)
                  </p>
                </div>
              </div>
              <div className="mt-10 lg:mt-0">
                <Image src="/images/customer-agent.webp" alt="App" width={375} height={800} className="rounded-lg border shadow-xl z-50 relative  mx-auto"></Image>

              </div>
            </div>
            <div className="w-full flex mt-32 justify-between border-b pb-20 flex-wrap">
              <div>
                <p className="font-semibold text-2xl">HR bot</p>
                <div className="flex gap-2 items-start mt-5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-zinc-500 mt-1.5">
                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                  </svg>
                  <p className=" lg:text-xl text-gray-600">
                    Answers employee questions
                  </p>
                </div>
                <div className="flex gap-2 items-start mt-3">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-zinc-500 mt-1.5">
                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                  </svg>
                  <p className=" lg:text-xl text-gray-600">
                    Ask questions directly from slack
                  </p>
                </div>
              </div>
              <div className="mt-10 lg:mt-0">
                <Image src="/images/slack.png" alt="App" width={350} height={800} className="rounded-lg border shadow-xl z-50 relative  mx-auto"></Image>
              </div>
            </div>

            <div className="mt-10">
              <p className="text-2xl text-center font-semibold">Go wild</p>
              <p className="text-center mt-4 text-xl max-w-lg mx-auto text-gray-600">
                These are just examples and you can get creative on how to use DocsAI! Possibilities are endless!
              </p>
              <Link href="/dashboard">
                <PrimaryButton className="mt-10 mx-auto">
                  Create your agent
                </PrimaryButton>
              </Link>
            </div>
          </section>
          <Footer />
        </section>
      </div >

    </>
  );
};

export default Home;
