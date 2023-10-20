import { type Project, type Org } from "@prisma/client"
import { type User } from "next-auth"
import Link from "next/link"
import { useRouter } from "next/router"
import Avatar from "~/components/Avatar"
import { SecondaryButton } from "~/components/form/button"
import { IconBot, IconDashboard, IconFolderOpen, IconHistory, IconPaintBrush, IconSettings, IconSubscription } from "~/components/icons/icons"

/**
 * Mainly used for the top navigation bar in the project page
 */
const AppNav: React.FC<{ user: User, org: Org, project: Project }> = ({ user, org, project }) => {
  const router = useRouter()
  return (
    <>
      <nav className="w-16 sm:w-64  h-screen border-r p-4">
      <div className="flex justify-between items-center">
        <Link href="/dashboard" className="flex items-center">
            <Avatar size={24} src={org.imageUrl} uid={org.id} />
            <span className="text-sm font-semibold ml-2 hidden sm:block  w-36 whitespace-nowrap text-ellipsis overflow-hidden">
            {org.name} / {project.name}
          </span>
        </Link>
        {/* <Avatar size={24} src={user?.image} uid={user.id} /> */}
      </div>

        <div className="mt-10 flex flex-col gap-y-2.5">
        <Link href={`/dashboard/${org.name}/${project.slug}`} className="w-full">
            <SecondaryButton className={`border-0 w-full flex  gap-2 text-left shadow-none focus:bg-gray-100 items-center hover:font-semibold ${router.pathname === '/dashboard/[orgname]/[projectSlug]' ? 'bg-gray-100 font-semibold' : 'bg-white'}`}>
              <IconDashboard className="h-5 w-5" />
              <span className="hidden sm:block">
              Dashboard
              </span>
          </SecondaryButton>
        </Link>

        <Link href={`/dashboard/${org.name}/${project.slug}/yourbot`} className="w-full">
            <SecondaryButton className={`border-0 text-left w-full shadow-none focus:bg-gray-100 flex  gap-2 items-center hover:font-semibold ${router.pathname === '/dashboard/[orgname]/[projectSlug]/yourbot' ? 'bg-gray-100 font-semibold' : 'bg-white'}`}>
              <IconBot className="h-5 w-5" />
              <span className="hidden sm:block">
                Your bot </span>
          </SecondaryButton>
        </Link>
        <Link href={`/dashboard/${org.name}/${project.slug}/agent`} className="w-full">
            <SecondaryButton className={`border-0  text-left w-full shadow-none focus:bg-gray-100 flex  gap-2 items-center  hover:font-semibold ${router.pathname === '/dashboard/[orgname]/[projectSlug]/agent' ? 'bg-gray-100 font-semibold' : 'bg-white'}`}>
              <IconPaintBrush className="h-5 w-5" />
              <span className="hidden sm:block">
                Bot Appearance </span>
          </SecondaryButton>
        </Link>
        {/* <Link href={`/dashboard/${org.name}/${project.slug}/QnA`} className="w-full">
          <SecondaryButton className={`mt-2 text-left w-full shadow-none focus:bg-gray-100 ${router.pathname === '/dashboard/[orgname]/[projectSlug]/QnA' ? 'bg-gray-100' : 'bg-white'}`}>
            QnA
          </SecondaryButton>
        </Link> */}
          <Link href={`/dashboard/${org.name}/${project.slug}/documents`} className="w-full">
            <SecondaryButton className={`border-0 text-left w-full shadow-none focus:bg-gray-100 flex  gap-2 items-center hover:font-semibold ${router.pathname === '/dashboard/[orgname]/[projectSlug]/documents' ? 'bg-gray-100 font-semibold' : 'bg-white'}`}>
              <IconFolderOpen className="h-5 w-5" />
              <span className="hidden sm:block">
                Documents </span>
          </SecondaryButton>
        </Link>
          <Link href={`/dashboard/${org.name}/${project.slug}/chats`} className="w-full">
            <SecondaryButton className={`border-0 text-left w-full shadow-none focus:bg-gray-100 flex  gap-2 items-center hover:font-semibold ${router.pathname === '/dashboard/[orgname]/[projectSlug]/chats' ? 'bg-gray-100 font-semibold' : 'bg-white'}`}>
              <IconHistory className="h-5 w-5" />
              <span className="hidden sm:block">
                Chat history </span>
          </SecondaryButton>
        </Link>
          <Link href={`/dashboard/${org.name}/${project.slug}/settings`} className="w-full">
            <SecondaryButton className={`border-0  text-left w-full shadow-none focus:bg-gray-100 flex  gap-2 items-center hover:font-semibold  ${router.pathname === '/dashboard/[orgname]/[projectSlug]/settings' ? 'bg-gray-100 font-semibold' : 'bg-white'}`}>
              <IconSettings className="h-5 w-5" />
              <span className="hidden sm:block">
                Settings </span>
          </SecondaryButton>
        </Link>

          <Link href={`/dashboard/${org.name}/subscription`} className="w-full">
            <SecondaryButton className={`border-0  text-left w-full shadow-none focus:bg-gray-100 flex  gap-2 items-center hover:font-semibold `}>
              <IconSubscription className="h-5 w-5" />
              <span className="hidden sm:block">
                Subscription </span>
            </SecondaryButton>
          </Link>
      </div>
    </nav >

      <div className="absolute text-center bottom-0 mb-6 hidden sm:block  w-56">
        <div className="flex flex-col text-sm">
          <a className="text-zinc-600 p-0.5 rounded-lg" target="_blank" rel="noreferrer" href="https://docsai.canny.io/featrue-requests">Got an Idea ?</a>
          <hr className="w-12 text-center mx-auto"></hr>
          <a className="text-zinc-600 p-0.5 rounded-lg" target="_blank" rel="noreferrer" href="https://docsai.canny.io/bugs">Report a Bug </a>
        </div>
      </div>
    </>

  )
}

export default AppNav


/**
 * <nav className="p-5 border-b sticky top-0 bg-white">
      <div className="flex justify-between px-10">
        <Link href="/">📚 Docs AI</Link>
        <Avatar src={user?.image} uid={user.id} />
      </div>
    </nav>
 */