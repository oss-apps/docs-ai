import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "~/utils/api";
import Image from "next/image";
import PrimaryButton from "~/components/form/button";
import Pricing from "~/containers/Pricing";
import HomeNav from "~/containers/Nav/HomeNav";

const PricingPage: NextPage = () => {

  return (
    <>
      <Head>
        <title>Docs AI</title>
        <meta name="description" content="Create an AI support agent with your documents." />
        <link rel="icon" href="/images/favicon.ico" />
      </Head>
      <HomeNav />
      <main className="mx-auto  max-w-6xl pb-32 px-4 lg:px-0">
        <Pricing />
      </main>
      <footer className="mx-auto  max-w-6xl pb-32">
        <p className="text-center text-lg text-gray-500">contact: hey@docsai.app</p>
        <p className="mt-4 text-center text-zinc-500">Made with ❤️ by <a className="text-zinc-900 hover:underline underline-offset-2" href="https://twitter.com/KM_Koushik_" target="_blank" rel="noreferrer">Koushik</a></p>
      </footer>
    </>
  );
};

export default PricingPage;

