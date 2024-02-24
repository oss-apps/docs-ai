import { type Project, type Org } from "@prisma/client"
import { Newspaper, Sparkles } from "lucide-react"
import { type User } from "next-auth"
import Link from "next/link"
import { useRouter } from "next/router"
import Avatar from "~/components/Avatar"
import { CustomButton, SecondaryButton } from "~/components/form/button"
import { IconAdd, IconBot, IconDashboard, IconFolderOpen, IconHistory, IconLink, IconPaintBrush, IconSettings, IconSubscription } from "~/components/icons/icons"

/**
 * Mainly used for the top navigation bar in the project page
 */
const AppNav: React.FC<{ user: User, org: Org, project: Project }> = ({ user, org, project }) => {
  const router = useRouter()
  return (
    <>
      <nav className="w-16 lg:w-64  h-screen border-r p-3">
      <div className="flex justify-between items-center">
        <Link href="/dashboard" className="flex items-center">
            <Avatar size={24} src={org.imageUrl} uid={org.id} />
            <span className="text-sm font-semibold ml-2 hidden lg:block  w-36 whitespace-nowrap text-ellipsis overflow-hidden">
            {org.name} / {project.name}
          </span>
        </Link>
        {/* <Avatar size={24} src={user?.image} uid={user.id} /> */}
      </div>

        <div className="mt-10 flex flex-col gap-y-1">
          <Link href={`/dashboard/${org.name}/${project.slug}`} className="w-full" tabIndex={-1}>
            <SecondaryButton className={` border-0 w-full flex  gap-2 text-left shadow-none   focus:bg-gray-100 items-center  ${router.pathname === '/dashboard/[orgname]/[projectSlug]' ? 'bg-gray-100 font-semibold' : 'bg-white'}`}>
              <IconDashboard className="h-5 w-5" />
              <span className="hidden lg:block">
              Dashboard
              </span>
          </SecondaryButton>
          </Link>

          <Link href={`/dashboard/${org.name}/${project.slug}/new_document`} className="w-full" tabIndex={-1}>
            <SecondaryButton className={`border-0 text-left w-full shadow-none  flex focus:outline-1  gap-2 items-center  ${router.pathname === '/dashboard/[orgname]/[projectSlug]/new_document' ? 'bg-gray-100 font-semibold' : 'bg-white'}`}>
              <IconAdd className="h-5 w-5" />
              <span className="hidden lg:block">
                Add Documents </span>
            </SecondaryButton>
          </Link>

          <Link href={`/dashboard/${org.name}/${project.slug}/yourbot`} className="w-full" tabIndex={-1}>
            <SecondaryButton className={`border-0 text-left w-full shadow-none  focus:bg-gray-100 flex  gap-2 items-center  ${router.pathname === '/dashboard/[orgname]/[projectSlug]/yourbot' ? 'bg-gray-100 font-semibold' : 'bg-white'}`}>
              <IconBot className="h-5 w-5" />
              <span className="hidden lg:block">
                Your Bot </span>
          </SecondaryButton>
          </Link>

          <Link href={`/dashboard/${org.name}/${project.slug}/documents`} className="w-full" tabIndex={-1}>
            <SecondaryButton className={`border-0 text-left w-full shadow-none focus:bg-gray-100  flex  gap-2 items-center  ${router.pathname === '/dashboard/[orgname]/[projectSlug]/documents' ? 'bg-gray-100 font-semibold' : 'bg-white'}`}>
              <IconFolderOpen className="h-5 w-5" />
              <span className="hidden lg:block">
                Documents </span>
          </SecondaryButton>
          </Link>

          <Link href={`/dashboard/${org.name}/${project.slug}/chats`} className="w-full" tabIndex={-1}>
            <SecondaryButton className={`border-0 text-left w-full shadow-none focus:bg-gray-100   flex  gap-2 items-center  ${router.pathname === '/dashboard/[orgname]/[projectSlug]/chats' ? 'bg-gray-100 font-semibold' : 'bg-white'}`}>
              <IconHistory className="h-5 w-5" />
              <span className="hidden lg:block">
                Chat History </span>
          </SecondaryButton>
          </Link>

          <Link href={`/dashboard/${org.name}/${project.slug}/agent`} className="w-full" tabIndex={-1}>
            <SecondaryButton className={` border-0 text-left w-full shadow-none   focus:bg-gray-100 flex  gap-2 items-center  ${router.pathname === '/dashboard/[orgname]/[projectSlug]/agent' ? 'bg-gray-100 font-semibold' : 'bg-white'}`}>
              <IconPaintBrush className="h-5 w-5" />
              <span className="hidden lg:block">
                Appearance </span>
            </SecondaryButton>
          </Link>

          <Link href={`/dashboard/${org.name}/${project.slug}/settings`} className="w-full" tabIndex={-1}>
            <SecondaryButton className={`border-0  text-left w-full shadow-none  focus:bg-gray-100 flex  gap-2 items-center   ${router.pathname === '/dashboard/[orgname]/[projectSlug]/settings' ? 'bg-gray-100 font-semibold' : 'bg-white'}`}>
              <IconSettings className="h-5 w-5" />
              <span className="hidden lg:block">
                Settings </span>
          </SecondaryButton>
          </Link>

          {
            org.plan !== 'FREE' ?
              <Link href={`/dashboard/${org.name}/subscription`} className="w-full " tabIndex={-1}>
                <SecondaryButton className={`border-0   w-full  text-left flex items-center gap-2`}>
                  <IconSubscription className="h-5 w-5" />
                  <span className="hidden lg:block">
                    Subscription  </span>
                </SecondaryButton>
              </Link>
              :
              <Link href={`/dashboard/${org.name}/subscription`} className="w-full mt-2" tabIndex={-1}>
                <CustomButton className={`bg-slate-900  text-sm w-full text-white text-left flex items-center gap-2`}>
                  <Sparkles className="h-5 w-5" />
                  <span className="hidden lg:block">
                    Upgrade  </span>
                </CustomButton>
              </Link>
          }
          <hr className="my-4"></hr>

          <Link href={`/docs/getting-started`} className="w-full" tabIndex={-1} target="_blank">
            <SecondaryButton className={`border-0  text-left w-full shadow-none  hover:bg-gray-100 flex  gap-2 items-center  `}>
              <IconLink className="h-5 w-5 text-zinc-500" />
              <span className="hidden lg:block">
                View docs </span>
            </SecondaryButton>
          </Link>

          <Link href={`/docs/release-notes`} className="w-full" tabIndex={-1} target="_blank">
            <SecondaryButton className={`border-0  text-left w-full shadow-none  hover:bg-gray-100 flex  gap-2 items-center  `}>
              <Newspaper className="h-5 w-5 text-zinc-500" />
              <span className="hidden lg:block">
                What&apos;s new? </span>
            </SecondaryButton>
          </Link>

      </div>
    </nav >

      <div className="absolute text-center bottom-0 mb-6 hidden lg:block  w-56">
        <div className="flex flex-col text-sm">
          <a className="text-zinc-700 p-0.5 rounded-lg" target="_blank" rel="noreferrer" href="https://docsai.canny.io/featrue-requests">Got an Idea ?</a>
          <hr className="w-12 text-center mx-auto"></hr>
          <a className="text-zinc-700 p-0.5 rounded-lg" target="_blank" rel="noreferrer" href="https://docsai.canny.io/bugs">Report a Bug </a>
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