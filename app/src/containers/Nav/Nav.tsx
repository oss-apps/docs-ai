import Link from "next/link"
import { signOut } from "next-auth/react";
import { SecondaryButton } from "~/components/form/button";
import Image from "next/image";
import { type Org } from "@prisma/client";

const Nav: React.FC<{ org?: Org }> = ({ org }) => {
  return (
    <nav className="p-5 border-b">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image src="/images/logo.png" width={30} height={30} alt="logo" className="rounded-lg"></Image>
          <h2 className="ml-2 text-2xl">DocsAI</h2>
        </Link>
        <div className="flex gap-4 items-center">
          {org ? (
            <Link href={`/dashboard/${org.name}/subscription`} className="text-gray-600 hover:underline underline-offset-2 hover:text-gray-900">
              Subscription
            </Link>
          ) : null}
          <SecondaryButton className="border border-gray-700 justify-center" onClick={() => void signOut()}>
            Log out
          </SecondaryButton>
        </div>
      </div>
    </nav>
  )
}

export default Nav
