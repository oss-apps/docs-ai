import Link from "next/link"
import { IconBack } from "./icons/icons"


const NavBack: React.FC<{ href: string }> = ({ href }) => {

  return (
    <Link href={href} className="border rounded-md hover:bg-gray-100 py-1  px-3  my-2 flex gap-2 w-20 items-center text-sm">
        <IconBack className="w-4 h-4" />
        Back
    </Link>
  )
}

export default NavBack
