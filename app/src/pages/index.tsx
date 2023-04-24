import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "~/utils/api";
import Image from "next/image";
import PrimaryButton from "~/components/form/button";
import { AuthButton } from "~/containers/Nav/AuthButton";
import HomeNav from "~/containers/Nav/HomeNav";
import Footer from "~/containers/Footer";

const Home: NextPage = () => {

  return (
    <>
      <Head>
        <title>Docs AI</title>
        <meta name="description" content="Create an AI support agent with your documents." />
        <link rel="icon" href="/images/favicon.ico" />
      </Head>
      <div className="background h-[70vh]">
        <HomeNav />
        <main className="mx-auto max-w-6xl pb-32 px-4 lg:px-0">
          <div className="container flex flex-col items-center justify-center gap-12 px-4  mt-20 mb-8">
            <h1 className=" text-gray-800 text-4xl lg:text-6xl font-semibold  max-w-3xl justify-center text-center">
              Create <span className="heading-text">AI support agents</span> with your documents.
            </h1>
          </div>
          <AuthButton />
          <section className="mt-20 rounded-lg pb-20">
            <Image src="/images/app.png" alt="App" width={900} height={800} className="rounded-lg border z-50 relative mx-auto shadow-2xl"></Image>
          </section>
          <div className="mt-32 mx-auto w-full text-center text-2xl font-semibold">Build your agent with 3 simple steps</div>
          <section className="mt-20 grid grid-cols-3 gap-20  pb-10  px-4">
            <div className="">
              <div className="text-lg font-semibold border border-zinc-600 rounded-full w-10 h-10 flex justify-center items-center p-1 text-zinc-600">1</div>
              <p className=" font-semibold flex items-center mt-2">
                Train data
              </p>
              <p className="mt-2 text-gray-700">Add your Website / Text you want to train (more sources coming)</p>
            </div>
            <div className="">
              <div className="text-lg font-semibold border border-zinc-600 rounded-full w-10 h-10 flex justify-center items-center p-1 text-zinc-600">2</div>
              <p className=" font-semibold flex items-center mt-2">
                Test your agent
              </p>
              <p className="mt-2 text-gray-700">Ask various questions to your bot to see the performance</p>
            </div>
            <div className="">
              <div className="text-lg font-semibold border border-zinc-600 rounded-full w-10 h-10 flex justify-center items-center p-1 text-zinc-600">3</div>
              <p className=" font-semibold flex items-center mt-2">
                Embed to your website
              </p>
              <p className="mt-2 text-gray-700">Embed the chatbot to your site in one line of code</p>
            </div>
          </section>
          <p className="mt-32 text-center text-2xl font-semibold">Features</p>
          <section className="mt-20 grid grid-cols-3 gap-20 pb-10 px-4">
            <div className="">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
              </svg>
              <p className=" font-semibold flex items-center mt-2">
                Multiple Sources
              </p>
              <p className="mt-2 text-gray-700">Add as many websites / documents you want for same bot. More source types are coming to DocsAI.</p>
            </div>
            <div className="">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
              <p className=" font-semibold flex items-center mt-2">
                Embed in any site
              </p>
              <p className="mt-2 text-gray-700">Embed chat widget to any website you want. You can also share a link that others can use.</p>
            </div>
            <div className="">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
              </svg>
              <p className=" font-semibold flex items-center mt-2">
                Get summary and insights
              </p>
              <p className="mt-2 text-gray-700">You can get summary of each conversation and mood of the users. It&apos;s currently available in professional plans.</p>
            </div>
            <div className="">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L12 12m6.894 5.785l-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864l-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495" />
              </svg>
              <p className=" font-semibold flex items-center mt-2">
                Suggest Answers
              </p>
              <p className="mt-2 text-gray-700">Did not like the answer? You can suggest better answers and bot will correct itself.</p>
            </div>
            <div className="">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
              <p className=" font-semibold flex items-center mt-2">
                Integrations
              </p>
              <p className="mt-2 text-gray-700">DocsAI currently can be integrated with Slack & Discord. Integration with Crisp, Other datasources like DB are coming soon.</p>
            </div>
            <div className="">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
              </svg>
              <p className=" font-semibold flex items-center mt-2">
                API
              </p>
              <p className="mt-2 text-gray-700">Need custom integration? Well you can use our APIs to interact with the bot directly.</p>
            </div>
            <div className="">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              <p className=" font-semibold flex items-center mt-2">
                User details
              </p>
              <p className="mt-2 text-gray-700">You can pass details of user like (userId), so you can identify it with your internal systems. Really helpful if you want to follow-up afterwards.</p>
            </div>
          </section>
          <section className="mt-32 px-4 lg:px-0">
            <p className="text-center text-2xl font-semibold">Use cases</p>
            <div className="w-full flex mt-20 justify-between border-b pb-20 flex-wrap">
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
                    Integrate with discord
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
                <Image src="/images/customer-agent.png" alt="App" width={350} height={800} className="rounded-lg border shadow-xl z-50 relative  mx-auto"></Image>

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
                <div className="flex gap-2 items-start mt-3">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-zinc-500 mt-1.5">
                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                  </svg>
                  <p className=" lg:text-xl text-gray-600">
                    Integrates with discord
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
        </main>
        <Footer />
      </div >

    </>
  );
};

export default Home;