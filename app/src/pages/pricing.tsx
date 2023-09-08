import { type NextPage } from "next";
import Head from "next/head";
import Pricing from "~/containers/Pricing";
import HomeNav from "~/containers/Nav/HomeNav";
import Footer from "~/containers/Footer";

const PricingPage: NextPage = () => {

  return (
    <>
      <Head>
        <title>Docs AI - Pricing</title>
        <meta name="description" content="Start your no credit card trial of 25 conversation/month." />
        <meta property="og:image" content="https://docsai.app/images/og-pricing.png" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:width" content="1200" />
        <meta property="twitter:title" content="DocsAI - Pricing" />
        <meta property="og:url" content="https://docsai.app/pricing"></meta>
        <meta property="twitter:description" content="Start your no credit card trial of 25 conversation/month." />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:image" content="https://docsai.app/images/og-pricing.png" />
        <meta property="og:type" content="website"></meta>
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

