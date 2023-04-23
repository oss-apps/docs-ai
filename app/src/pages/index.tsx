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
          <div className="mt-10 mx-auto w-full text-center text-2xl font-semibold">Build your agent with 3 simple steps</div>
          <section className="mt-20 flex justify-between w-full pb-10 flex-wrap px-4 lg:px-0">
            <div className="w-full lg:w-64">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-zinc-700">
                <path fillRule="evenodd" d="M10.5 3.75a6 6 0 00-5.98 6.496A5.25 5.25 0 006.75 20.25H18a4.5 4.5 0 002.206-8.423 3.75 3.75 0 00-4.133-4.303A6.001 6.001 0 0010.5 3.75zm2.03 5.47a.75.75 0 00-1.06 0l-3 3a.75.75 0 101.06 1.06l1.72-1.72v4.94a.75.75 0 001.5 0v-4.94l1.72 1.72a.75.75 0 101.06-1.06l-3-3z" clipRule="evenodd" />
              </svg>
              <p className=" font-semibold flex items-center mt-2">
                Train websites
              </p>
              <p className="mt-2 text-gray-700">Add your website and we will index all the pages</p>
            </div>
            <div className="w-full lg:w-64 mt-20 lg:mt-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-zinc-700">
                <path fillRule="evenodd" d="M10.5 3.798v5.02a3 3 0 01-.879 2.121l-2.377 2.377a9.845 9.845 0 015.091 1.013 8.315 8.315 0 005.713.636l.285-.071-3.954-3.955a3 3 0 01-.879-2.121v-5.02a23.614 23.614 0 00-3 0zm4.5.138a.75.75 0 00.093-1.495A24.837 24.837 0 0012 2.25a25.048 25.048 0 00-3.093.191A.75.75 0 009 3.936v4.882a1.5 1.5 0 01-.44 1.06l-6.293 6.294c-1.62 1.621-.903 4.475 1.471 4.88 2.686.46 5.447.698 8.262.698 2.816 0 5.576-.239 8.262-.697 2.373-.406 3.092-3.26 1.47-4.881L15.44 9.879A1.5 1.5 0 0115 8.818V3.936z" clipRule="evenodd" />
              </svg>
              <p className=" font-semibold flex items-center mt-2">
                Test your agent
              </p>
              <p className="mt-2 text-gray-700">Ask various questions to your bot to see the performance</p>
            </div>
            <div className=" w-full lg:w-64 mt-20 lg:mt-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-zinc-700">
                <path fillRule="evenodd" d="M12 2.25c-2.429 0-4.817.178-7.152.521C2.87 3.061 1.5 4.795 1.5 6.741v6.018c0 1.946 1.37 3.68 3.348 3.97.877.129 1.761.234 2.652.316V21a.75.75 0 001.28.53l4.184-4.183a.39.39 0 01.266-.112c2.006-.05 3.982-.22 5.922-.506 1.978-.29 3.348-2.023 3.348-3.97V6.741c0-1.947-1.37-3.68-3.348-3.97A49.145 49.145 0 0012 2.25zM8.25 8.625a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zm2.625 1.125a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" clipRule="evenodd" />
              </svg>
              <p className=" font-semibold flex items-center mt-2">
                Embed to your website
              </p>
              <p className="mt-2 text-gray-700">Embed the chatbot to your site in one line of code</p>
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