import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

import Image from "next/image";
import PrimaryButton from "~/components/form/button";
import { AuthButton } from "~/containers/Nav/AuthButton";
import HomeNav from "~/containers/Nav/HomeNav";
import Footer from "~/containers/Footer";
import { IconChat, IconCode, IconCollection, IconLockOpen, IconPieChart, IconSearch, IconSettings, IconSlack, IconWebsite, IconWidget } from "~/components/icons/icons";
import { Disclosure } from '@headlessui/react'

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
          <h3 className="mt-16 text-gray-800 text-center text-3xl font-semibold">Features</h3>
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

          <h3 className="mt-16 text-gray-800 text-center text-3xl font-semibold">Customize your bot</h3>
          <section className="my-8 rounded-lg  flex justify-center">
            <div className="flex justify-center flex-col rounded-lg ">
              <Image src="/images/customize.webp" alt="customize" width={1000} height={800} className="rounded-lg border border-blue-100 relative shadow-2xl"></Image>
              <small className="text-center text-zinc-600 mt-4">
                <a href="/features/project" target="_blank"> Discover the key features of your chatbot </a>
              </small>
            </div>
          </section>

        </section>
        <section className=" bg-gradient-to-r from-sky-50 to-indigo-50">
          <div className="max-w-6xl mx-auto mt-32 px-4 lg:px-0 py-16">
            <h1 className="text-center text-3xl font-semibold mb-8 text-gray-800 "> Customer Support Agents</h1>
            <div className="w-full grid grid-cols-1 sm:grid-cols-3  gap-2 md:gap-8">
              <div className="flex flex-col gap-y-4 md:gap-y-10 md:mt-12 text-base md:text-lg align-bottom">
                <div className="border shadow-sm items-center p-2  md:p-4 rounded-lg bg-white">
                  💡  Provides comprehensive answers to user&apos;s questions.
                </div>
                <div className="border shadow-sm items-center p-2 px-4 rounded-lg bg-white">
                  💯 Collect valuable feedback from your users
                </div>
                <div className="border shadow-sm items-center p-2 px-4 rounded-lg  bg-white">
                  📨 Allow users to easily contact you via email from your chatbot
                </div>
              </div>

              <div className="my-4 sm:my-0 flex justify-center flex-col rounded-lg ">
                <Image src="/images/customer-agent.png" alt="App" width={375} height={800} className="rounded-lg  shadow-sms  mx-auto"></Image>
                <small className="text-center text-zinc-600">
                  <a href="/features/project" target="_blank"> Discover the key features of your chatbot </a>
                </small>
              </div>

              <div className="flex  sm:self-end flex-col gap-y-4 md:gap-y-10 md:mb-12 text-base md:text-lg">
                <div className="border shadow-sm items-center p-2 px-4 rounded-lg bg-white">
                  📝 Provides you with a high-level overview of each conversation
                </div>
                <div className="border shadow-sm items-center p-2 px-4 rounded-lg bg-white">
                  💭 Detect user&apos;s sentiment and mood of each conversation
                </div>
                <div className="border shadow-sm items-center p-2 px-4 rounded-lg bg-white">
                  🤝 Read through chats and provide suggestion
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl sm:px-4 lg:px-0 sm:mt-24 ">
          <div className="grid sm:grid-cols-3 justify-between  py-10 px-2 flex-wrap sm:p-6 sm:rounded-lg sm:border-2 bg-black text-white">
            <div className="col-span-2">
              <div className="flex justify-center flex-col">
                <h2 className="text-3xl text-gray-200 font-semibold flex sm:mb-6 mb-4 gap-2 items-center">
                  <IconSlack className="w-7 h-7" /> Slack Bot - Use Cases
                </h2>

                <div className="flex flex-col gap-y-2 sm:gap-y-5">
                  <div className=" ">
                    <h3 className="text-xl text-gray-100 font-semibold mb-1"> New employee onboarding </h3>
                    <p className="text-slate-300"> Slack bot could be used to answer new employees&apos; questions about company policies, procedures, and benefits.</p>
                  </div>

                  <div>
                    <h3 className="text-xl  text-gray-100 font-semibold mb-1"> Technical support</h3>
                    <p className="text-slate-300">Slack bots can provide technical support to customers or employees, freeing up human technicians for more complex issues.</p>
                  </div>

                  <div>
                    <h3 className="text-xl  text-gray-100 font-semibold mb-1">Product documentation</h3>
                    <p className="text-slate-300">Slack bots can answer product documentation questions, improving the customer experience and reducing support tickets.</p>
                  </div>

                  <div>
                    <h3 className="text-xl  text-gray-100 font-semibold mb-1">Customer service</h3>
                    <p className="text-slate-300">Slack bots can answer customer questions about products, services improving satisfaction and reducing customer support workload.</p>
                  </div>

                  <div className="text-xl  flex justify-center mt-4 text-gray-200 font-semibold mb-1">
                    <Link href="/dashboard">
                      <PrimaryButton className=" border border-gray-50 mx-auto">
                        Create your agent
                      </PrimaryButton>
                    </Link>
                  </div>
                </div>
              </div>

            </div>
            <div className="mt-10 lg:mt-0 flex col-span-3 sm:col-span-1">
              <Image src="/images/slack.png" alt="App" width={350} height={800} className="rounded-lg border shadow-xl relative  mx-auto"></Image>
            </div>
          </div>

          <div className="mt-10">
            <p className="text-center mt-4 text-lg max-w-lg mx-auto text-gray-600">
              These are just examples and you can get creative on how to use DocsAI!
              The possibilities for AI chatbots are endless.

            </p>
          </div>
        </section>
        <Footer />

      </div >

    </>
  );
};

export default Home;
