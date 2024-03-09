import { PAGE_DESC, PAGE_IMG, PAGE_TITLE } from "~/utils/seo";

const CommonSEO: React.FC = () => {
  return (
    <>
      <meta property="og:title" content={PAGE_TITLE} />
      <meta property="og:description" content={PAGE_DESC} />
      <meta name="description" content={PAGE_DESC} />
      <meta property="og:image" content={PAGE_IMG} />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:width" content="1200" />
      <meta name="twitter:title" content={PAGE_TITLE} />
      <meta property="og:url" content="https://docsai.app"></meta>
      <meta name="twitter:description" content={PAGE_DESC} />
      <meta name="twitter:image" content={PAGE_IMG} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta property="og:type" content="website"></meta>
    </>
  )
}

export default CommonSEO;

