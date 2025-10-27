// src/components/blog/MarkdownProse.tsx
'use client'

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// This component is a simple wrapper that applies our rich typography styles
// to the Markdown content rendered from the database.
export default function MarkdownProse({ content }: { content: string }) {
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none 
                  prose-p:text-muted-foreground
                  prose-headings:text-foreground
                  prose-a:text-primary hover:prose-a:underline
                  prose-strong:text-foreground
                  prose-blockquote:border-primary
                  prose-code:text-primary prose-code:before:content-[''] prose-code:after:content-['']
                  prose-img:rounded-lg">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

