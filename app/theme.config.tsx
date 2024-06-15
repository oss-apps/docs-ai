import Image from "next/image"
import Footer from "~/containers/Footer"
import type { DocsThemeConfig } from 'nextra-theme-docs';
import { useConfig } from 'nextra-theme-docs'
import { useRouter } from 'next/router'
import { DOCS_DESC } from "~/utils/seo";

const config: DocsThemeConfig = {
  head: () => {
    const { asPath, defaultLocale, locale } = useRouter()
    let { title } = useConfig()

    if (title) {
      title += ' | DocsAI'
    }
    else title = 'DocsAI'
    const url =
      'https://docsai.app' +
      (defaultLocale === locale ? asPath : `/${locale}${asPath}`)
    const ogImage = `https://dynamicog.com/og/docs/img?dark=true&title=${title}&sub=Build your Personalized AI Chatbot&name=DocsAI&website=https://docsai.app&logo=https://docsai.app/images/logo.png`;
    return (
      <>
        <title>{title}</title>
        <meta property="og:url" content={url} />
        <meta property="og:title" content={title} />
        <meta property="og:image" content={ogImage} />
        <meta name="og:description" content={DOCS_DESC} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:type" content="website"></meta>
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={DOCS_DESC} />
        <meta name="description" content={DOCS_DESC} />

      </>
    )
  },
  useNextSeoProps() {

  },
  logo: (
    <div className="flex items-center">
      <Image src="/images/logo.png" width={40} height={40} alt="logo" className="rounded-lg"></Image>
      <h2 className="ml-2 text-2xl">DocsAI</h2>
    </div>
  ),

  logoLink: '/',
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
    toggleButton: true,
  },
  feedback: {
    content: null,
  },
  editLink: {
    text: ''
  },
  nextThemes: {
    defaultTheme: 'light',
    forcedTheme : 'light'
  },
  banner: {
    key: '2.0-release',
    text: (
      <a href="/docs/integrations/integration-web" target="_blank">
        🎉 Chatbot v2.0 is released. Read more →
      </a>
    )
  }
}


export default config