import Link from "next/link"
import { signOut } from "next-auth/react";
import { SecondaryButton } from "~/components/form/button";
import Image from "next/image";

const Nav: React.FC = () => {
  return (
    <nav className="p-5 border-b">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image src="/images/logo.png" width={30} height={30} alt="logo" className="rounded-lg"></Image>
          <h2 className="ml-2 text-2xl">DocsAI</h2>
        </Link>
        <div>
          <SecondaryButton className="border border-gray-700" onClick={() => void signOut()}>
            Log out
          </SecondaryButton>
        </div>
      </div>
    </nav>
  )
}

export default Nav
