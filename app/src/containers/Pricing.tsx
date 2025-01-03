import { type Org, Plan } from "@prisma/client"
import { useState } from "react"
import PrimaryButton, { SecondaryButton } from "~/components/form/button"
import { IconTick } from "~/components/icons/icons";
import { api } from "~/utils/api";
import Footer from "./Footer";
import { motion } from 'framer-motion';

const Pricing: React.FC<{
  org?: Org,
  prices?: {
    month: Record<string, string>;
    year: Record<string, string>;
  },
  loggedIn?: boolean;
  manage?: () => Promise<void>
}> = ({ org, prices, loggedIn, manage }) => {
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month')

  const [selectedPlan, setSelectedPlan] = useState<Plan>(Plan.PROFESSIONAL)

  const createCheckoutSession = api.org.createCheckoutSession.useMutation()

  const onSubscribeClick = async (price: string, _plan: Plan) => {
    if (manage) {
      await manage()
      return
    }
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
        <div className="hidden  sm:flex sm:justify-center">
          <div className="relative rounded-full px-2 py-0.5 text-xs leading-6 text-gray-700 ring-1 ring-gray-700 hover:ring-gray-900/20">
            <a href="https://github.com/oss-apps/docs-ai" rel="noreferrer" target='_blank'>
              DocsAI is now open source
            </a>
          </div>
        </div>
        <h1 className="text-2xl sm:text-4xl mt-2 font-medium  text-center">
          Pricing
        </h1>
        {/* <p className="text-base text-zinc-700 text-center my-2"> No hidden fees, no surprises</p> */}
        <div className="relative self-center p-0.5 flex flex-col mt-4  ">
          <div className="border flex  border-zinc-800 rounded-lg shadow-lg ">
          <button
            onClick={() => setBillingInterval('month')}
            className={`${billingInterval === 'month'
              ? 'relative w-1/2 bg-black border-zinc-800 shadow-sm text-white'
              : 'ml-0.5 relative w-1/2 border border-transparent text-zinc-700'
              } rounded-md m-1 py-2 text-sm font-medium whitespace-nowrap focus:outline-none focus:z-10 sm:w-auto sm:px-8`}
          >
              <span className="hover:scale-105">  Monthly </span>
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
        <p className="text-center mt-3 max-w-md mx-auto"> Save <span className="text-zinc-800 font-semibold">🎉 2 months</span> on yearly plans.
          Free plan includes 30 Credits and 2MB of storage </p>

        <div className="mt-12 space-y-2 sm:mt-26 sm:space-y-0 sm:grid sm:grid-cols-1 gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 md:grid-cols-2 lg:grid-cols-3">

          <motion.div animate={{ scale: 1.08 }} transition={{ duration: 0.4, repeat: 1, delay: 0.9, repeatType: 'reverse' }} exit={{ scale: 1 }}
            className="bg-white rounded-md border-2 hover:border-gray-200 hover:shadow-gray-200 hover:shadow-2xl duration-500 ">
            <div className="p-6">
              <h2 className="text-3xl leading-6 font-semibold">
                Basic
              </h2>
              <p className="mt-2 text-zinc-500 text-sm">You have a small website</p>
              <hr className="my-2"></hr>

              <div className="mt-5 md:h-72">
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
                  <p >1000 Credits/Month</p>
                </div>
                <div className="flex items-start gap-2 mt-3">
                  <IconTick />
                  <p >API Integration</p>
                </div>

                <div className="flex items-start gap-2 mt-3">
                  <IconTick />
                  <p> Freedom credits *</p>
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
              <SecondaryButton
                onClick={() => onSubscribeClick(prices?.[billingInterval]['BASIC'] || '', Plan.BASIC)}
                loading={selectedPlan === Plan.BASIC && createCheckoutSession.isLoading}
                disabled={selectedPlan === Plan.BASIC && createCheckoutSession.isLoading}
                className="mt-5 mx-auto w-full font-semibold justify-center">
                Subscribe
              </SecondaryButton>
            </div>
          </motion.div >

          <motion.div animate={{ scale: 1.08 }} transition={{ duration: 0.4, repeat: 1, delay: 1.2, repeatType: 'reverse' }} exit={{ scale: 1 }}
            className=" rounded-md border-2 border-gray-600  hover:border-gray-600  hover:shadow-slate-400 hover:shadow-2xl duration-500">
            <div className="p-6">
              <h2 className="text-3xl leading-6 font-semibold">
                Professional
              </h2>
              <p className="mt-2 text-zinc-500 text-sm">You have startups</p>
              <hr className="my-2"></hr>

              <div className="mt-5 md:h-72">
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
                  <p >5000 Credits/Month</p>
                </div>
                <div className="flex items-start gap-2 mt-3">
                  <IconTick />
                  <p >API Integration</p>
                </div>
                <div className="flex items-start gap-2 mt-3">
                  <IconTick />
                  <p> Freedom credits *</p>
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

          </motion.div>

          <motion.div animate={{ scale: 1.08 }} transition={{ duration: 0.4, repeat: 1, delay: 1.5, repeatType: 'reverse' }} exit={{ scale: 1 }}
            className="bg-white rounded-md border-2 hover:border-gray-200 hover:shadow-gray-200  hover:shadow-2xl duration-500">
            <div className="p-6">
              <h2 className="text-3xl leading-6 font-semibold align-middle">
                Enterprise
              </h2>
              <p className="mt-2 text-zinc-500 text-sm">You have big companies</p>
              <hr className="my-2"></hr>

              <div className="mt-5 md:h-72">
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
                  <p >12000 Credits/Month</p>
                </div>
                <div className="flex items-start gap-2 mt-3">
                  <IconTick />
                  <p >API Integration</p>
                </div>
                <div className="flex items-start gap-2 mt-3">
                  <IconTick />
                  <p> Freedom credits *</p>
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
              <SecondaryButton
                onClick={() => onSubscribeClick(prices?.[billingInterval]['ENTERPRISE'] || '', Plan.ENTERPRISE)}
                className="mt-5 mx-auto w-full font-semibold justify-center"
                loading={selectedPlan === Plan.ENTERPRISE && createCheckoutSession.isLoading}
                disabled={selectedPlan === Plan.ENTERPRISE && createCheckoutSession.isLoading}>
                Subscribe
              </SecondaryButton>
            </div>
          </motion.div>
        </div>
      </div>

      <p className="text-center mt-4 lg:mt-8 text-base ">
        * Freedom credits! They&apos;re yours to keep forever when you pay.
        Use them as you need, and if things change, simply cancel your subscription.
        You&apos;ll still have access to all the credits you&apos;ve already purchased.
      </p>
      <Footer />
    </div>
  )
}

export default Pricing