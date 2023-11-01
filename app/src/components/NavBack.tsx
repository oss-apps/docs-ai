import Link from "next/link"
import { IconBack } from "./icons/icons"


const NavBack: React.FC<{ href: string }> = ({ href }) => {

  return (
    <button className=" border rounded-md hover:bg-gray-100 py-1  px-3 flex justify-center my-2">
      <Link href={href} className="flex gap-2 justify-center items-center text-sm">
        <IconBack className="w-4 h-4" />
        Back
      </Link>
    </button>
  )
}

export default NavBack
