import { PAGE_DESC, PAGE_IMG, PAGE_TITLE } from "~/utils/seo";

const DynamicSEO: React.FC<{ pageTitle?: string | null, pageDesc?: string | null, pageImg?: string }> = ({
  pageTitle, pageDesc, pageImg
}) => {
  return (
    <>
      <meta property="og:title" content={pageTitle || PAGE_TITLE} />
      <meta property="og:description" content={pageDesc || PAGE_DESC} />
      <meta name="description" content={pageDesc || PAGE_DESC} />
      <meta property="og:image" content={pageImg || PAGE_IMG} />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:url" content="https://docsai.app"></meta>
      <meta name="twitter:title" content={pageTitle || PAGE_TITLE} />
      <meta name="twitter:description" content={pageDesc || PAGE_DESC} />
      <meta name="twitter:image" content={pageImg || PAGE_IMG} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta property="og:type" content="website"></meta>
    </>
  )
}

export default DynamicSEO;

