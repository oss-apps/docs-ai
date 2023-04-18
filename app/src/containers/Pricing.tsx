import Link from "next/link"
import { useState } from "react"
import PrimaryButton from "~/components/form/button"

const Pricing: React.FC = () => {
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month')

  return (
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
                <p className="mt-1">25 Messages/Month</p>
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
                <p className="mt-1">1000 Messages/Month</p>
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
              <Link href="/dashboard">
                <PrimaryButton
                  className="mt-4">
                  Subscribe
                </PrimaryButton>
              </Link>
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
                <p className="mt-1">5000 Messages/Month</p>
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
              <Link href="/dashboard">
                <PrimaryButton
                  className="mt-4">
                  Subscribe
                </PrimaryButton>
              </Link>
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
                <p className="mt-1">12000 Messages/Month</p>
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
              <Link href="/dashboard">
                <PrimaryButton
                  className="mt-4">
                  Subscribe
                </PrimaryButton>
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Pricing