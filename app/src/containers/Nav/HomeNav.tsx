import Image from "next/image"
import Link from "next/link"

const HomeNav: React.FC = () => {
  return (
    <nav className="flex sticky z-10 p-5 px-10 items-center justify-between bg-transparent">
      <Link href="/">
        <div className="flex items-center">
          <Image src="/images/logo.png" width={35} height={35} alt="logo" className="rounded-lg"></Image>
          <h2 className="ml-2 text-2xl">DocsAI</h2>
        </div>
      </Link>
      <div className="flex items-center gap-5">
        <Link href="/pricing" className="text-zinc-600">
          Pricing
        </Link>
        <Link href="/docs/faq" className="text-zinc-600 hidden sm:block">
          FAQs
        </Link>
        <Link href="/terms" className="text-zinc-600 hidden md:block">
          Terms
        </Link>
        <Link href="/privacy" className="text-zinc-600 hidden md:block">
          Privacy
        </Link>
        <Link href="https://github.com/docs-ai/docs-ai" target="_blank" className="text-zinc-600 hidden md:block">
          Github
        </Link>

        <Link href="/docs/getting-started" className="text-zinc-600 hidden sm:flex gap-1  items-center" target="_blank">
          Docs
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </Link>
      </div>
    </nav>
  )
}

export default HomeNav