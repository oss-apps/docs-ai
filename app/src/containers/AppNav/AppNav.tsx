import { type Project, type Org } from "@prisma/client"
import { type User } from "next-auth"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/router"
import Avatar from "~/components/Avatar"
import { SecondaryButton } from "~/components/form/button"

/**
 * Mainly used for the top navigation bar in the project page
 */
const AppNav: React.FC<{ user: User, org: Org, project: Project }> = ({ user, org, project }) => {
  const router = useRouter()

  return (
    <nav className="w-64 border border-r p-5">
      <div className="flex justify-between items-center">
        <Link href="/dashboard" className="flex items-center">
          <Avatar square size={24} src={org.imageUrl} uid={org.id} />
          <span className="ml-2">
            {org.name}
          </span>
        </Link>
        {/* <Avatar size={24} src={user?.image} uid={user.id} /> */}
      </div>

      <div className="mt-10">
        <Link href={`/dashboard/${org.name}/${project.slug}`} className="w-full">
          <SecondaryButton className={`w-full text-left shadow-none focus:bg-gray-100 ${router.pathname === '/dashboard/[orgname]/[projectSlug]' ? 'bg-gray-100' : 'bg-white'}`}>
            Dashboard
          </SecondaryButton>
        </Link>
        <Link href={`/dashboard/${org.name}/${project.slug}/agent`} className="w-full">
          <SecondaryButton className={`mt-2 text-left w-full shadow-none focus:bg-gray-100 ${router.pathname === '/dashboard/[orgname]/[projectSlug]/agent' ? 'bg-gray-100' : 'bg-white'}`}>
            Agent
          </SecondaryButton>
        </Link>
        {/* <Link href={`/dashboard/${org.name}/${project.slug}/QnA`} className="w-full">
          <SecondaryButton className={`mt-2 text-left w-full shadow-none focus:bg-gray-100 ${router.pathname === '/dashboard/[orgname]/[projectSlug]/QnA' ? 'bg-gray-100' : 'bg-white'}`}>
            QnA
          </SecondaryButton>
        </Link> */}
        <Link href={`/dashboard/${org.name}/${project.slug}/documents`} className="w-full mt-4">
          <SecondaryButton className={`mt-2 text-left w-full shadow-none focus:bg-gray-100 ${router.pathname === '/dashboard/[orgname]/[projectSlug]/documents' ? 'bg-gray-100' : 'bg-white'}`}>
            Documents
          </SecondaryButton>
        </Link>
      </div>
    </nav >
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