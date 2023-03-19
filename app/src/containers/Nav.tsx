import Link from "next/link"

const Nav: React.FC = () => {
  return (
    <nav className="p-5 border-b">
      <div className="max-w-6xl mx-auto">
        <Link href="/">📚 Docs AI</Link>
      </div>
    </nav>
  )
}

export default Nav
