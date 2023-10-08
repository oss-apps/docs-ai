import { GetServerSidePropsContext, type NextPage } from "next";
import Head from "next/head";
import Pricing from "~/containers/Pricing";
import HomeNav from "~/containers/Nav/HomeNav";
import Footer from "~/containers/Footer";
import { getServerAuthSession } from "~/server/auth";
import { prisma } from "~/server/db";

const PricingPage: NextPage<{ props: any }> = ({ props }) => {


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
        <script src='https://cdn.paritydeals.com/banner.js' async></script>
      </Head>
      <HomeNav />
      <main className="mx-auto  max-w-6xl pb-32 px-4 lg:px-0">
        <Pricing />
      </main>
      <Footer />
    </>
  );
};


export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerAuthSession(context)

  if (!session) {
    return {
      props: {
        usernotLoggedIn: false
      }
    }
  }

  const org = await prisma.orgUser.findFirst({
    where: {
      userId: session.user.id
    },
    include: {
      org: true
    }
  })

  if (org) {
    return {
      redirect: {
        destination: `/dashboard/${org.org.name}/subscription`
      }
    }
  }
}


export default PricingPage;

