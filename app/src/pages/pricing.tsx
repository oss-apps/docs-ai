import { type NextPage } from "next";
import Head from "next/head";
import Pricing from "~/containers/Pricing";
import HomeNav from "~/containers/Nav/HomeNav";
import Footer from "~/containers/Footer";

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
      <Footer />
    </>
  );
};

export default PricingPage;

