import Image from "next/image"
import { useRouter } from "next/router"
import { useConfig } from "nextra-theme-docs"
import Footer from "~/containers/Footer"


const config = {
  logo: (
    <div className="flex items-center">
      <Image src="/images/logo.png" width={40} height={40} alt="logo" className="rounded-lg"></Image>
      <h2 className="ml-2 text-2xl">DocsAI</h2>
    </div>
  ),

  logoLink: '/docs/getting-started',

  project: {
    link: 'https://github.com/docs-ai/docs-ai',
  },
  search: {
    component: null
  },
  darkMode: false,
  footer: {
    component: <Footer />
  },
  sidebar: {
    toggleButton: false,
  },
  editLink: {
    component: null,
  },
  feedback: {
    content: null,
  },
  useNextSeoProps() {
    return {
      titleTemplate: '%s - DocsAI',
    }
  },
  breadcrumb: {
    component: null,
  },
}


export default config