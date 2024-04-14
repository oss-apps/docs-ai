import { type GetServerSidePropsContext, type NextPage } from "next";
import Head from "next/head";
import Pricing from "~/containers/Pricing";
import HomeNav from "~/containers/Nav/HomeNav";
import { getServerAuthSession } from "~/server/auth";
import { prisma } from "~/server/db";
import DynamicSEO from "~/components/seo/Dynamic";

const PricingPage: NextPage<{ props: any }> = ({ }) => {


  return (
    <>
      <Head>
        <title>Docs AI | Pricing</title>
        <DynamicSEO pageTitle="DocsAI | Pricing" pageDesc="Parity pricing for all: Making our products affordable for people around the world."
          pageImg="https://docsai.app/images/og-pricing.png" />
        <script src='https://cdn.paritydeals.com/banner.js' async></script>
      </Head>
      <HomeNav />
      <main className="mx-auto  max-w-6xl  px-4 lg:px-0">
        <Pricing />
      </main>
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

