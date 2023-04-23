import Image from "next/image"
import Link from "next/link"
import { AuthButton } from "./AuthButton"

const HomeNav: React.FC = () => {
  return (
    <nav className="flex p-5 px-10 items-center justify-between bg-transparent">
      <Link href="/">
        <div className="flex items-center">
          <Image src="/images/logo.png" width={40} height={40} alt="logo" className="rounded-lg"></Image>
          <h2 className="ml-2 text-2xl">DocsAI</h2>
        </div>
      </Link>
      <div className="flex items-center gap-5">
        <Link href="/" className="text-zinc-600 hidden lg:block">
          Home
        </Link>
        <Link href="/terms" className="text-zinc-600 hidden lg:block">
          Terms
        </Link>
        <Link href="/privacy" className="text-zinc-600 hidden lg:block">
          Privacy
        </Link>
        <Link href="/pricing" className="text-zinc-600 hidden lg:block">
          Pricing
        </Link>
        <div className="ml-10">
          <AuthButton />
        </div>
      </div>
    </nav>
  )
}

export default HomeNav