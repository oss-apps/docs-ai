import { type GetServerSidePropsContext, type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import superjson from "superjson";
import { api } from "~/utils/api";
import Image from "next/image";
import PrimaryButton from "~/components/form/button";
import { getServerAuthSession } from "~/server/auth";
import { prisma } from "~/server/db";
import { Plan, Subscription, type Org, type OrgUser } from "@prisma/client";
import Nav from "~/containers/Nav/Nav";
import { getPrices } from "~/server/stripe";
import NavBack from "~/components/NavBack";
import { useState } from "react";
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
    planToPrice.month[prices.month[price]] = price
  })

  Object.keys(prices.year).forEach((price) => {
    planToPrice.year[prices.year[price]] = price
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
          <meta name="description" content="Create an AI support agent with your documents." />
          <link rel="icon" href="/images/favicon.ico" />

        </Head>
        <div className="h-full">
          <Nav />
          <main className="max-w-6xl mx-auto pt-10 pb-10">
            <NavBack href={`/dashboard/${org.org.name}`} />
            {subscription ? (
              <div className="mt-10">
                <p className="text-lg">Your current plan</p>
                <p className="mt-5 font-semibold">{org.org.plan}
                  <span className="ml-2 font-normal">${subscription.amount / 100}/{getRecurring(subscription.priceId, prices)}</span>
                </p>
                <PrimaryButton onClick={onManageClick} className="mt-4" loading={createManageSession.isLoading} disabled={createManageSession.isLoading}>
                  Manage
                </PrimaryButton>
                <div className="mt-20">
                  <p className="text-lg">Usage</p>
                  <p className="mt-4">Message credits left: {org.org.chatCredits}</p>
                  <p className="mt-4">Documents: {(Number(org.org.documentTokens) / 1e6).toFixed(2)} MB / {getLimits(org.org.plan)?.documentSize / 1e6}</p>
                </div>
              </div>
            ) : (
              <Pricing org={org.org} prices={planToPrices} />
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