import Link from "next/link"
import { IconBack } from "./icons/icons"


const NavBack: React.FC<{ href: string }> = ({ href }) => {

  return (
    <button className=" bg-gray-200 hover:bg-gray-300 p-1 rounded px-3 flex justify-center my-2">
      <Link href={href} className="flex gap-2 justify-center items-center text-sm">
        <IconBack className="w-4 h-5" />
        Back
      </Link>
    </button>
  )
}

export default NavBack
