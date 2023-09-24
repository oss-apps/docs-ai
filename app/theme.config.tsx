import Image from "next/image"
import Footer from "~/containers/Footer"
import type { DocsThemeConfig } from 'nextra-theme-docs';


const config: DocsThemeConfig = {
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
  feedback: {
    content: null,
  },
  useNextSeoProps() {
    return {
      titleTemplate: '%s - DocsAI',
    }
  },
  editLink: {
    text: ''
  },
  nextThemes: {
    defaultTheme: 'light',
    forcedTheme: 'light'
  }
}


export default config