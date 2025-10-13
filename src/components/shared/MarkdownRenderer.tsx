// /src/components/shared/MarkdownRenderer.tsx
'use client'

import ReactMarkdown from 'react-markdown';
import AffiliateLink from './AffiliateLink';
import remarkGfm from 'remark-gfm'; // ADDED: Import the GFM plugin

type MarkdownRendererProps = {
  content: string;
};

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      // ADDED: Pass the plugin to the renderer
      remarkPlugins={[remarkGfm]} 
      components={{
        a: ({ node, ...props }) => {
          if (props.href?.startsWith('affiliate://')) {
            const slug = props.href.replace('affiliate://', '');
            return <AffiliateLink slug={slug}>{props.children}</AffiliateLink>;
          }
          return <a {...props} target="_blank" rel="noopener noreferrer" />;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}