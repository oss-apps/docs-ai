import Link from "next/link"


const NavBack: React.FC<{ href: string }> = ({ href }) => {

  return (
    <button className=" bg-gray-200 hover:bg-gray-300 p-1 rounded px-3 flex justify-center">
      <Link href={href} className="text-sm">
        Back
      </Link>
    </button>
  )
}

export default NavBack
