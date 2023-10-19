import { type Org, Plan } from "@prisma/client"
import { useState } from "react"
import PrimaryButton from "~/components/form/button"
import { IconTick } from "~/components/icons/icons";
import { api } from "~/utils/api";

const Pricing: React.FC<{
  org?: Org,
  prices?: {
    month: Record<string, string>;
    year: Record<string, string>;
  },
  loggedIn?: boolean;
}> = ({ org, prices, loggedIn }) => {
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month')

  const [selectedPlan, setSelectedPlan] = useState<Plan>(Plan.PROFESSIONAL)

  const createCheckoutSession = api.org.createCheckoutSession.useMutation()

  const onSubscribeClick = async (price: string, _plan: Plan) => {
    if (org && price) {
      setSelectedPlan(_plan)
      const session = await createCheckoutSession.mutateAsync({ orgId: org.id, price })
      if (session?.url)
        window.location.assign(session.url);
    } else if (loggedIn) {
      window.location.assign('/dashboard')
    } else {
      window.location.assign('/api/auth/signin')
    }
  }


  return (
    <div className="mt-5" >
      <div className="sm:flex sm:flex-col sm:align-center">
        <h1 className="text-2xl font-semibold text-center sm:text-2xl">
          Our Plans
        </h1>
        <h2 className="mx-auto max-w-2xl text-center text-lg text-zinc-600">
          If these plans doesn&apos;t suit you, Contact <a className="text-zinc-800 font-semibold" href="mailto:hey@docsai.app">hey@docsai.app</a>.
        </h2>
        <div className="relative self-center p-0.5 flex flex-col mt-4 ">
          <div className="border flex  border-zinc-800 rounded-lg  ">
          <button
            onClick={() => setBillingInterval('month')}
            className={`${billingInterval === 'month'
              ? 'relative w-1/2 bg-black border-zinc-800 shadow-sm text-white'
              : 'ml-0.5 relative w-1/2 border border-transparent text-zinc-700'
              } rounded-md m-1 py-2 text-sm font-medium whitespace-nowrap focus:outline-none focus:z-10 sm:w-auto sm:px-8`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingInterval('year')}
            className={`${billingInterval === 'year'
              ? 'relative w-1/2 bg-black border-zinc-800 shadow-sm text-white'
              : 'ml-0.5 relative w-1/2 border border-transparent text-zinc-700'
              } rounded-md m-1 py-2 text-sm font-medium whitespace-nowrap focus:outline-none focus:z-10 sm:w-auto sm:px-8`}
          >
            Yearly
          </button>
          </div>
        </div>
        <p className="text-center mt-1"> Save <span className="text-zinc-800 font-semibold">🎉 2 months</span> on yearly plans. </p>

        <div className="mt-12 space-y-4 sm:mt-26 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
          <div className="bg-white rounded-md border">
            <div className="p-6">
              <h2 className="text-2xl leading-6 font-semibold">
                Basic
              </h2>
              <p className="mt-2 text-zinc-500">You have a small website</p>
              <div className="mt-5 h-60">
                <div className="flex items-start gap-2">
                  <IconTick />
                  <p>2 Projects</p>
                </div>
                <div className="flex items-start gap-2 mt-3">
                  <IconTick />
                  <p>5 MB storage</p>
                </div>
                <div className="flex items-start gap-2 mt-3">
                  <IconTick />
                  <p >1000 Messages/Month</p>
                </div>
                <div className="flex items-start gap-2 mt-3">
                  <IconTick />
                  <p >API Integration</p>
                </div>
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
                onClick={() => onSubscribeClick(prices?.[billingInterval]['BASIC'] || '', Plan.BASIC)}
                loading={selectedPlan === Plan.BASIC && createCheckoutSession.isLoading}
                disabled={selectedPlan === Plan.BASIC && createCheckoutSession.isLoading}
                className="mt-5 mx-auto w-full">
                Subscribe
              </PrimaryButton>
            </div>
          </div>
          <div className=" rounded-md border-4 border-black ">
            <div className="p-6">
              <h2 className="text-2xl leading-6 font-semibold">
                Professional
              </h2>
              <p className="mt-2 text-zinc-500">Best suited for startups</p>
              <div className="mt-5 h-60">
                <div className="flex items-start gap-2">
                  <IconTick />
                  <p>5 Projects</p>
                </div>
                <div className="flex items-start gap-2 mt-3">
                  <IconTick />
                  <p >25 MB storage</p>
                </div>
                <div className="flex items-start gap-2 mt-3">
                  <IconTick />
                  <p >5000 Messages/Month</p>
                </div>
                <div className="flex items-start gap-2 mt-3">
                  <IconTick />
                  <p >API Integration</p>
                </div>
                <div className="flex items-start gap-2 mt-3">
                  <IconTick />
                  <p >Unlimited search after credits</p>
                </div>
                <div className="flex items-start gap-2 mt-3">
                  <IconTick />
                  <p >Generate summary and mood for conversation</p>
                </div>
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
                onClick={() => onSubscribeClick(prices?.[billingInterval]['PROFESSIONAL'] || '', Plan.PROFESSIONAL)}
                className="mt-5 w-full"
                loading={selectedPlan === Plan.PROFESSIONAL && createCheckoutSession.isLoading}
                disabled={selectedPlan === Plan.PROFESSIONAL && createCheckoutSession.isLoading}>
                Subscribe
              </PrimaryButton>
            </div>

          </div>
          <div className="bg-white rounded-md border">
            <div className="p-6">
              <h2 className="text-2xl leading-6 font-semibold align-middle">
                Enterprise
              </h2>
              <p className="mt-2 text-zinc-500">Best suited for big companies</p>
              <div className="mt-5 h-60">
                <div className="flex items-start gap-2">
                  <IconTick />
                  <p>Unlimited Projects</p>
                </div>
                <div className="flex items-start gap-2 mt-3">
                  <IconTick />
                  <p >100 MB storage</p>
                </div>
                <div className="flex items-start gap-2 mt-3">
                  <IconTick />
                  <p >12000 Messages/Month</p>
                </div>
                <div className="flex items-start gap-2 mt-3">
                  <IconTick />
                  <p >API Integration</p>
                </div>
                <div className="flex items-start gap-2 mt-3">
                  <IconTick />
                  <p >Unlimited search after credits</p>
                </div>
                <div className="flex items-start gap-2 mt-3">
                  <IconTick />
                  <p >Generate summary and mood for conversation</p>
                </div>
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
                onClick={() => onSubscribeClick(prices?.[billingInterval]['ENTERPRISE'] || '', Plan.ENTERPRISE)}
                className="mt-5 w-full"
                loading={selectedPlan === Plan.ENTERPRISE && createCheckoutSession.isLoading}
                disabled={selectedPlan === Plan.ENTERPRISE && createCheckoutSession.isLoading}>
                Subscribe
              </PrimaryButton>
            </div>
          </div>
        </div>
        <h1 className="text-center text-lg my-4"> Try out our <b> free plan </b> with 1 project, 2 MB storage, and 30 messages/month.</h1>
        <hr></hr>
      </div>
    </div>
  )
}

export default Pricing