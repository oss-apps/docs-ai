import { ReactMarkdown } from "react-markdown/lib/react-markdown";

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
        components={{ a: ({ node, ...props }) => <a {...props} href={getUrl(props.href)} target="_blank" rel="noreferrer" /> }}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
};