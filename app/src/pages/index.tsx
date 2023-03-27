import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "~/utils/api";
import Image from "next/image";
import PrimaryButton from "~/components/form/button";

const Home: NextPage = () => {

  return (
    <>
      <Head>
        <title>Docs AI</title>
        <meta name="description" content="Create an AI support agent with your documents." />
        <link rel="icon" href="/images/favicon.ico" />
      </Head>
      <body className="min-h-screen">
        <nav className="flex p-5 px-10 items-center justify-between">
          <div className="flex items-center">
            <Image src="/images/logo.png" width={40} height={40} alt="logo" className="rounded-lg"></Image>
            <h2 className="ml-2 text-2xl">DocsAI</h2>
          </div>
          <AuthShowcase />
        </nav>
        <main className="flex flex-col items-center">
          <div className="container flex flex-col items-center justify-center gap-12 px-4  mt-20 mb-8">
            <h1 className=" text-gray-800 text-6xl font-semibold  max-w-3xl justify-center text-center">
              Create an <span className="heading-text">AI support agent</span> with your documents.
            </h1>
          </div>
          <AuthShowcase />
        </main>
        <section className="flex justify-center mt-20 rounded-lg pb-20">
          <div className=" h-60 w-60 fixed opacity-5 top-20 left-14 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" />
          <div className=" h-28 w-28 fixed opacity-5 top-10 left-64 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" />
          <div className=" h-60 w-60 fixed opacity-5 top-32 right-14 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500" />
          <div className=" h-28 w-28 fixed opacity-5  top-96 right-80 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
          <div className=" h-28 w-28 fixed opacity-5 top-80 right-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
          <Image src="/images/app.png" alt="App" width={900} height={800} className="rounded-lg border z-50"></Image>
        </section>
      </body>
    </>
  );
};

export default Home;

const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();

  const { data: secretMessage } = api.example.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined },
  );

  return (
    <div className="flex flex-col items-center justify-center gap-4">
    
     { !sessionData ? 
      <PrimaryButton
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </PrimaryButton> :
      <Link href="/dashboard">
        <PrimaryButton>Dashboard</PrimaryButton>
      </Link>
     }
    </div>
  );
};
