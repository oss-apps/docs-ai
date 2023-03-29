import Link from "next/link"


const NavBack: React.FC<{ href: string }> = ({ href }) =>{

  return (
		<Link href={href}>
      <button className="text-blue-500">&lt; Back</button>
    </Link>		
	)
}

export default NavBack
