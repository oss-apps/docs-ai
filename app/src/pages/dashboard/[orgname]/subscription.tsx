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

type BillingInterval = 'month' | 'year'

const Subscription: NextPage<{ orgJson: string, subscriptionJson: string, prices: { 'month': Record<string, string>, 'year': Record<string, string> } }> =
  ({ orgJson, subscriptionJson, prices }) => {
    const [billingInterval, setBillingInterval] =
      useState<BillingInterval>('month');

    const [selectedPlan, setSelectedPlan] = useState<Plan>(Plan.PROFESSIONAL)

    const org: (OrgUser & { org: Org }) = superjson.parse(orgJson)
    const subscription: (Subscription | null) = subscriptionJson ? superjson.parse(subscriptionJson) : null

    const planToPrice = getPlanToPrice(prices)

    const createCheckoutSession = api.org.createCheckoutSession.useMutation()
    const createManageSession = api.org.createManageSession.useMutation()

    const onSubscribeClick = async (price: string, _plan: Plan) => {
      setSelectedPlan(_plan)
      const session = await createCheckoutSession.mutateAsync({ orgId: org.orgId, price })
      if (session?.url)
        window.location.assign(session.url);
    }

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
          <main className="max-w-6xl mx-auto pt-10">
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
                </div>
              </div>
            ) : (
              <div className="mt-10">
                <div className="sm:flex sm:flex-col sm:align-center">
                  <h1 className="text-2xl font-semibold sm:text-center sm:text-2xl">
                    Pricing Plans
                  </h1>
                  <div className="relative self-center mt-6  rounded-lg p-0.5 flex sm:mt-8 border border-zinc-800">
                    <button
                      onClick={() => setBillingInterval('month')}
                      type="button"
                      className={`${billingInterval === 'month'
                        ? 'relative w-1/2 bg-black border-zinc-800 shadow-sm text-white'
                        : 'ml-0.5 relative w-1/2 border border-transparent text-zinc-700'
                        } rounded-md m-1 py-2 text-sm font-medium whitespace-nowrap focus:outline-none focus:z-10 sm:w-auto sm:px-8`}
                    >
                      Monthly billing
                    </button>
                    <button
                      onClick={() => setBillingInterval('year')}
                      type="button"
                      className={`${billingInterval === 'year'
                        ? 'relative w-1/2 bg-black border-zinc-800 shadow-sm text-white'
                        : 'ml-0.5 relative w-1/2 border border-transparent text-zinc-700'
                        } rounded-md m-1 py-2 text-sm font-medium whitespace-nowrap focus:outline-none focus:z-10 sm:w-auto sm:px-8`}
                    >
                      Yearly billing
                    </button>
                  </div>
                  <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-4">
                    <div className="bg-zinc-100 rounded-md">
                      <div className="p-6">
                        <h2 className="text-2xl leading-6 font-semibold">
                          Free
                        </h2>
                        <p className="mt-2 text-zinc-500">You are just trying out</p>
                        <div className="mt-5">
                          <p>1 Project</p>
                          <p className="mt-1">5 Pages*</p>
                          <p className="mt-1">30 Messages*/Month</p>
                          <p className="mt-1">Unlimited search after limit</p>
                        </div>
                        <p className="mt-8">
                          <span className="text-5xl font-extrabold white">
                            $0
                          </span>
                          <span className="text-base font-medium">
                            /{billingInterval}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="bg-zinc-100 rounded-md">
                      <div className="p-6">
                        <h2 className="text-2xl leading-6 font-semibold">
                          Basic
                        </h2>
                        <p className="mt-2 text-zinc-500">You have a small website</p>
                        <div className="mt-5">
                          <p>2 Projects</p>
                          <p className="mt-1">25 Pages*</p>
                          <p className="mt-1">1000 Messages*/Month</p>
                          <p className="mt-1">Unlimited search after limit</p>
                        </div>
                        <p className="mt-8">
                          <span className="text-5xl font-extrabold white">
                            ${billingInterval === 'month' ? 9 : 90}
                          </span>
                          <span className="text-base font-medium">
                            /{billingInterval}
                          </span>
                        </p>
                        <PrimaryButton
                          onClick={() => onSubscribeClick(planToPrice[billingInterval]['BASIC'] || '', Plan.BASIC)}
                          className="mt-4"
                          loading={selectedPlan === Plan.BASIC && createCheckoutSession.isLoading}
                          disabled={selectedPlan === Plan.BASIC && createCheckoutSession.isLoading}>
                          Subscribe
                        </PrimaryButton>
                      </div>
                    </div>
                    <div className="bg-zinc-100 rounded-md">
                      <div className="p-6">
                        <h2 className="text-2xl leading-6 font-semibold">
                          Professional
                        </h2>
                        <p className="mt-2 text-zinc-500">Best suited for startups</p>
                        <div className="mt-5">
                          <p>5 Projects</p>
                          <p className="mt-1">100 Pages*</p>
                          <p className="mt-1">5000 Messages*/Month</p>
                          <p className="mt-1">Unlimited search after limit</p>
                        </div>
                        <p className="mt-8">
                          <span className="text-5xl font-extrabold white">
                            ${billingInterval === 'month' ? 49 : 490}
                          </span>
                          <span className="text-base font-medium">
                            /{billingInterval}
                          </span>
                        </p>
                        <PrimaryButton
                          onClick={() => onSubscribeClick(planToPrice[billingInterval]['PROFESSIONAL'] || '', Plan.PROFESSIONAL)}
                          className="mt-4"
                          loading={selectedPlan === Plan.PROFESSIONAL && createCheckoutSession.isLoading}
                          disabled={selectedPlan === Plan.PROFESSIONAL && createCheckoutSession.isLoading}>
                          Subscribe
                        </PrimaryButton>
                      </div>

                    </div>
                    <div className="bg-zinc-100 rounded-md">
                      <div className="p-6">
                        <h2 className="text-2xl leading-6 font-semibold">
                          Enterprise
                        </h2>
                        <p className="mt-2 text-zinc-500">Best suited for startups</p>
                        <div className="mt-5">
                          <p>unlimited Projects</p>
                          <p className="mt-1">1000 Pages*</p>
                          <p className="mt-1">12000 Messages*/Month</p>
                          <p className="mt-1">Unlimited search after limit</p>
                        </div>
                        <p className="mt-8">
                          <span className="text-5xl font-extrabold white">
                            ${billingInterval === 'month' ? 129 : 1290}
                          </span>
                          <span className="text-base font-medium">
                            /{billingInterval}
                          </span>
                        </p>
                        <PrimaryButton
                          onClick={() => onSubscribeClick(planToPrice[billingInterval]['ENTERPRISE'] || '', Plan.ENTERPRISE)}
                          className="mt-4"
                          loading={selectedPlan === Plan.ENTERPRISE && createCheckoutSession.isLoading}
                          disabled={selectedPlan === Plan.ENTERPRISE && createCheckoutSession.isLoading}>
                          Subscribe
                        </PrimaryButton>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
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