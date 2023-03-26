import Link from "next/link"
import { signOut } from "next-auth/react";
import { SecondaryButton } from "~/components/form/button";

const Nav: React.FC = () => {
  return (
    <nav className="p-5 border-b">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/">📚 Docs AI</Link>
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
