import { type GetServerSidePropsContext, type NextPage } from "next";
import Head from "next/head";
import superjson from "superjson";
import { api } from "~/utils/api";
import PrimaryButton, { SecondaryButton } from "~/components/form/button";
import { getServerAuthSession } from "~/server/auth";
import { prisma } from "~/server/db";
import { Subscription, type Org, type OrgUser } from "@prisma/client";
import Nav from "~/containers/Nav/Nav";
import { getPrices } from "~/server/stripe";
import { getLimits } from "~/utils/license";
import Pricing from "~/containers/Pricing";

export const getRecurring = (price: string, prices: { 'month': Record<string, string>, 'year': Record<string, string> }) => {
  if (prices.month[price]) {
    return 'month'
  } else {
    return 'year'
  }
}

export const getPlanToPrice = (prices: { 'month': Record<string, string>, 'year': Record<string, string> }) => {
  const planToPrice: { 'month': Record<string, string>, 'year': Record<string, string> } = { month: {}, year: {} }

  Object.keys(prices.month).forEach((price) => {
    planToPrice.month[prices.month[price] as string] = price
  })

  Object.keys(prices.year).forEach((price) => {
    planToPrice.year[prices.year[price] as string] = price
  })

  return planToPrice
}


const Subscription: NextPage<{ orgJson: string, subscriptionJson: string, prices: { 'month': Record<string, string>, 'year': Record<string, string> } }> =
  ({ orgJson, subscriptionJson, prices }) => {
    const org: (OrgUser & { org: Org }) = superjson.parse(orgJson)
    const subscription: (Subscription | null) = subscriptionJson ? superjson.parse(subscriptionJson) : null

    const planToPrices = getPlanToPrice(prices)

    const createManageSession = api.org.createManageSession.useMutation()

    const onManageClick = async () => {
      const session = await createManageSession.mutateAsync({ orgId: org.orgId })
      if (session?.url)
        window.location.assign(session.url);
    }


    return (
      <>
        <Head>
          <title>Docs AI</title>
          <link rel="icon" href="/images/favicon.ico" />
          <script src='https://cdn.paritydeals.com/banner.js' async></script>

        </Head>
        <div className="h-full">
          <Nav />
          <main className="max-w-6xl mx-auto  px-2 pb-16">
            {subscription ? (
              <>
                <div className="mt-10 grid sm:grid-cols-2 md:grid-cols-4 cols-1 sm:gap-6 gap-3 ">
                  <div className="shadow-md rounded-lg border p-4">
                    <p className="text-sm  my-1"> <span>  {org.org.plan}</span> </p>
                    <span className="font-semibold text-slate-900 text-3xl my-2">${subscription.amount / 100}/{getRecurring(subscription.priceId, prices)}</span>
                    <div className="mt-4 flex justify-center">
                      <SecondaryButton onClick={onManageClick} className="justify-center" loading={createManageSession.isLoading} disabled={createManageSession.isLoading}>
                        Manage
                      </SecondaryButton>
                    </div>
                  </div>
                  <div className="shadow-md rounded-lg border p-4">
                    <p className="text-sm my-1">Usage</p>
                    <p className="mt-4">Message credits left <span className="font-semibold"> {org.org.chatCredits} </span></p>
                    <p className="mt-4">Documents <span className="font-semibold"> {(Number(org.org.documentTokens) / 1e6).toFixed(2)} MB / {getLimits(org.org.plan)?.documentSize / 1e6} </span></p>
                  </div>
                </div>
                <hr className="my-3 sm:my-6"></hr>
                <Pricing org={org.org} prices={planToPrices} />
              </>

            ) : (
                <>                 
                  <Pricing org={org.org} prices={planToPrices} />
                </>
            )}
          </main>
        </div>
      </>
    );
  };

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerAuthSession(context)

  if (!session) {
    return {
      redirect: {
        destination: '/'
      }
    }
  }

  const orgname = context.query.orgname as string

  const org = await prisma.orgUser.findFirst({
    where: {
      userId: session.user.id,
      org: {
        name: orgname
      }
    },
    include: {
      org: true
    }
  })

  const subscription = await prisma.subscription.findFirst({ where: { orgId: org?.orgId, status: 'active' } })

  if (!org) {
    return {
      redirect: {
        destination: '/'
      }
    }
  }

  const props = {
    props: {
      user: session.user,
      orgJson: org ? superjson.stringify(org) : null,
      subscriptionJson: subscription ? superjson.stringify(subscription) : null,
      prices: getPrices()
    }
  }
  return props
}

export default Subscription;