import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

import Image from "next/image";
import PrimaryButton, { SecondaryButton } from "~/components/form/button";
import { AuthButton } from "~/containers/Nav/AuthButton";
import HomeNav from "~/containers/Nav/HomeNav";
import Footer from "~/containers/Footer";
import { IconChat, IconCode, IconCollection, IconCustomPrompt, IconHistory, IconLink, IconLockOpen, IconPieChart, IconSettings, IconTablet, IconWidget } from "~/components/icons/icons";

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

          <Landing />
          <section className="my-16 rounded-lg  flex justify-center ">
            <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
              <Image src="/images/app.webp" alt="App" quality={20} width={1200} height={800} className="rounded-lg relative border" priority></Image>
            </div>
          </section>
        </main>
        <RightImage />
        <LeftImage />
        {/* <Stats /> */}
        <MoreFeatures />
        <hr></hr>
        <Footer />

      </div >

    </>
  );
};

function Landing() {

  return (
    <div className="bg-white">
      <div className="relative isolate px-6  lg:px-8">
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div
            className="relative right-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-slate-900 to-slate-600 opacity-30 sm:right-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
        <div className="mx-auto max-w-2xl pt-16 sm:pt-24 lg:pt-32">
          <div className="hidden  sm:flex sm:justify-center">
            <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
              <a href="/features/overview" target='_blank'>
                Discover the key features of DocsAI &nbsp;
              </a>
            </div>
          </div>
          <div className="text-center mt-4">
            <h1 className="  tracking-tight text-gray-900 sm:text-6xl text-4xl lg:text-6xl font-bold  justify-center text-center">
              The AI Docs Companion you always wanted.
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Train your documents, chat with your documents, and create chatbots that solves queries for you and your users.

            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <AuthButton />
              <SecondaryButton className="w-[150px] justify-center">
                <Link href="/pricing" className="font-semibold ">
                  View Pricing <span aria-hidden="true">→</span>
                </Link>
              </SecondaryButton>
            </div>
          </div>
        </div>
        <div
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-slate-500 to-slate-600 opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
      </div>
    </div>
  )
}

const features = [
  {
    name: 'Multiple Sources',
    description: 'DocsAI seamlessly integrates with a variety of sources, including websites, Text Files, PDFs, Docx , Notion and Confluence.',
    icon: <IconCollection />,
  },
  {
    name: 'Integrations',
    description: 'DocsAI integrates with Slack. Integration with Crisp, Discord & Other datasources like DB are coming soon.',
    icon: <IconWidget />,
  },
  // {
  //   name: 'Embed in any site',
  //   description: 'Embed chat widget to any website you want. You can also share a link that others can use.',
  //   icon: <IconWebsite />,
  // },
]

function RightImage() {
  return (
    <div className="overflow-hidden bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <div className="lg:pr-8 lg:pt-4">
            <div className="lg:max-w-lg">
              <h2 className="text-base font-semibold leading-7 text-slate-600">Move faster with DocsAI</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Modernize your workflow</p>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Organize your documents and train your companion on DocsAI. Now you can easily find anything you search for in your documents.
              </p>
              <dl className="mt-10 max-w-xl space-y-8 text-base leading-7 text-gray-600 lg:max-w-none">
                {features.map((feature) => (
                  <div key={feature.name} className="relative ">
                    <dt className="gap-2 flex font-semibold text-gray-900">
                      <span>  {feature.icon}  </span>
                      {feature.name}
                    </dt>{' '}
                    <dd className="inline">{feature.description}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <AuthButton />
                <SecondaryButton className="w-[150px] justify-center">
                  <Link href="/pricing" className="font-semibold ">
                    View Pricing <span aria-hidden="true">→</span>
                  </Link>
                </SecondaryButton>
              </div>
            </div>
          </div>
          <Image
            src="/images/feature-1.webp"
            alt="Product screenshot"
            quality={20}
            className="w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem] md:-ml-4 lg:-ml-0"
            width={1200}
            height={800}
          />
        </div>
      </div>
    </div>
  )
}

const features2 = [
  {
    name: 'Suggest Answers',
    description:
      'Do not like the answer? You can suggest better answers and companion will correct itself.',
    icon: <IconSettings />,
  },
  {
    name: 'Custom API',
    description: 'Need custom integration? Well you can use our APIs to interact with the bot directly.',
    icon: <IconCode />,
  },
  // {
  //   name: 'Embed in any site',
  //   description: 'Embed chat widget to any website you want. You can also share a link that others can use.',
  //   icon: <IconWebsite />,
  // },
]

function LeftImage() {
  return (
    <div className="overflow-hidden bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <div className="lg:ml-auto lg:pl-4 lg:pt-4">
            <div className="lg:max-w-lg">
              <h2 className="text-base font-semibold leading-7 text-slate-600">Match your brand</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Customize your companion</p>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                You can customize the way your AI companion looks,  matching your brand colors and initial setups.
              </p>
              <dl className="mt-10 max-w-xl space-y-8 text-base leading-7 text-gray-600 lg:max-w-none">
                {features2.map((feature) => (
                  <div key={feature.name} className="relative">
                    <dt className="flex gap-2 font-semibold text-gray-900">
                      <span>  {feature.icon}  </span>
                      {feature.name}
                    </dt>{' '}
                    <dd className="inline">{feature.description}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <AuthButton />
                <SecondaryButton className="w-[150px] justify-center">
                  <Link href="/pricing" className="font-semibold ">
                    View Pricing <span aria-hidden="true">→</span>
                  </Link>
                </SecondaryButton>
              </div>
            </div>
          </div>
          <div className="flex items-start justify-end lg:order-first " >
            <Image
              src="/images/feature-2.webp"
              alt="Product screenshot"
              className="w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem]"
              width={1200}
              height={800}
              quality={20}
            />

          </div>
        </div>
      </div>
    </div>
  )
}

const features3 = [
  {
    name: 'Doubling down as chat agent',
    description:
      'Embed chat widget to any website you want. You can also share a link that others can use.',
    icon: <IconChat className="w-6 h-6  sm:w-10 sm:h-10" />
    ,
  },
  {

    name: 'Get summary, insights & leads',
    description: 'Get summary of each conversation, mood of the users and identify users to generate leads.',
    icon: <IconPieChart className="w-6 h-6  sm:w-10 sm:h-10" />
    ,
  },
  {
    name: 'Mobile & Tablet Friendly',
    description: <p>Experience our website like an app: Install our PWA for faster access.
      <a href="/features/installDocsai" className="text-black font-bold" rel="noreferrer">
        Download DocsAI <IconLink className="inline w-4 mb-1 " />
      </a>
    </p>,
    icon: <IconTablet className="w-6 h-6  sm:w-10 sm:h-10" />
    ,
  },
  {
    name: 'Export chats & Unlimited conversations',
    description: ' Analyze your chat data to identify trends and improve customer satisfaction.',
    icon: <IconHistory className="w-6 h-6  sm:w-10 sm:h-10" />
    ,
  },
  {
    name: 'Custom Prompts & Multi Language',
    description: 'Break down language barriers and enhance document processing with Docs AI.',
    icon: <IconCustomPrompt className="w-6 h-6  sm:w-10 sm:h-10" />
    ,
  },
  {
    name: 'Open source',
    description: <p>It&apos;s harder to maintain than a company, So 100 ⭐️ and we open source it.
      <a href="https://github.com/docs-ai/docs-ai" target="_blank" className="text-black font-bold  ml-1" rel="noreferrer"> Star on Github <IconLink className="inline w-4 mb-1" /></a></p>,
    icon: <IconLockOpen className="w-6 h-6  sm:w-10 sm:h-10" />
    ,
  },


]

function MoreFeatures() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <p className="text-base font-semibold leading-7 text-slate-600">More Features</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Chat with your docs, your way.
          </h1>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {features3.map((feature) => (
              <div key={feature.name} className="relative pl-10 sm:pl-16">
                <dt className="text-lg font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg">
                    {/* <feature.icon className="h-6 w-6 text-white" aria-hidden="true" /> */}
                    {feature.icon}
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="mt-6 sm:mt-16  flex flex-wrap items-center justify-center gap-4">
          <PrimaryButton className="w-[150px]">
            <Link href='docs/getting-started'>
              Learn more
            </Link>
          </PrimaryButton>
          <SecondaryButton className="w-[150px] justify-center">
            <Link href="/pricing" className="font-semibold ">
              View Pricing <span aria-hidden="true">→</span>
            </Link>
          </SecondaryButton>
        </div>
      </div>
    </div>
  )
}



const stats = [
  { id: 1, name: 'All time Signups', stat: '1,296', icon: <IconChat className="w-6 h-6 sm:w-10 sm:h-10" />, btext: "Get Started", blink: "" },
  { id: 2, name: 'Total documents added', stat: '923', icon: <IconChat className="w-6 h-6 sm:w-10 sm:h-10" />, btext: "Pricing", blink: "" },
  { id: 3, name: 'Total conversations', stat: '2,518', icon: <IconChat className="w-6 h-6 sm:w-10 sm:h-10" />, btext: "Learn about DocsAI", blink: "" },
]



function Stats() {
  return (
    <div className="max-w-6xl mx-auto">
      <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((item) => (
          <div
            key={item.id}
            className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow-md border sm:px-6 sm:pt-6"
          >
            <dt>
              <div className="absolute rounded-md  p-2">
                {item.icon}
              </div>
              <p className="ml-16 truncate text-base font-medium text-gray-500">{item.name}</p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
              <p className="text-3xl font-semibold text-slate-900">{item.stat}</p>
              <div className="absolute inset-x-0 bottom-0 bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <a href="#" className="font-medium text-slate-600 hover:text-slate-500">
                    {item.btext}
                  </a>
                </div>
              </div>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}



export default Home;
