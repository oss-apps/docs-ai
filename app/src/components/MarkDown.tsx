import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import remarkGfm from 'remark-gfm'


export const MarkDown: React.FC<{ markdown: string }> = ({ markdown }) => {

  const getUrl = (url?: string) => {
    if (url && !url.startsWith("http")) {
      return `https://${url}`
    }

    return url
  }

  return (
    <div className="markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{ a: ({ node, ...props }) => <a {...props} href={getUrl(props.href)} target="_blank" rel="noreferrer" /> }}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
};