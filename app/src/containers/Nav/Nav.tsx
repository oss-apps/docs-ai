import Link from "next/link"
import { signOut } from "next-auth/react";
import { CustomButton } from "~/components/form/button";
import Image from "next/image";
import { User, type Org } from "@prisma/client";
import { LogOut, Sparkles, UserCog } from "lucide-react";
import { Separator } from "src/components/ui/Seperator"
import Avatar from "~/components/Avatar";



const Nav: React.FC<{ org?: Org, image?: string | null }> = ({ org, image }) => {
  return (
    <nav className="p-3 sm:p-5 border-b">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image src="/images/logo.png" width={30} height={30} alt="logo" className=" rounded-lg"></Image>
          <h2 className="ml-2 text-2xl hidden sm:block">DocsAI</h2>
        </Link>
        <div className="flex gap-1 items-center text-base text-gray-900">
          {org ? (
            <CustomButton tabIndex={-1}>
              <Link href={`/dashboard/${org.name}/subscription`} className="flex gap-1 items-center">
                <Sparkles className="w-4 h-4" />
                <span className="hidden md:block">  Subscription </span>
              </Link>
            </CustomButton>
          ) : null}

          {/* {org ?
            <>
              <Separator orientation="vertical" className="h-6" />
              <CustomButton >
                <Link href={`/dashboard/${org.name}/users`} className="flex gap-x-1 items-center">
                  <UserCog className="w-4 h-4" />
                  <span className="hidden md:block"> Users </span>
                </Link>
              </CustomButton></> :
            null} */}


          <Separator orientation="vertical" className="h-6" />

          <CustomButton onClick={() => void signOut()} className="flex text-red-400 gap-x-1">
            <LogOut className="w-4 h-4" />
            <span className="hidden lg:block"> Log out </span>
          </CustomButton>
          <Separator orientation="vertical" className="h-6  mr-1.5 lg:mr-3" />

          {image && <Avatar src={image} uid="" square srcIsUid size={24} />}


        </div>
      </div>
    </nav>
  )
}

export default Nav
