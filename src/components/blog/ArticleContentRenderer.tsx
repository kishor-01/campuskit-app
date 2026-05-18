// src/components/blog/ArticleContentRenderer.tsx
'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';

// Lazy-load heavy components
const InteractiveSandbox = dynamic(() => import('./InteractiveSandbox'), { ssr: false });
const MermaidRenderer = dynamic(() => import('@/components/MermaidRenderer'), { ssr: false });

interface ArticleContentRendererProps {
  htmlContent: string;
}

/**
 * Parses sanitized HTML article content and intercepts:
 * 1. Code blocks with data-interactive="true" → renders InteractiveSandbox
 * 2. Code blocks with class="language-mermaid" → renders MermaidRenderer
 * 3. All other content → renders as static HTML
 *
 * Parsing protocol:
 * - <code data-interactive="true"> or <code class="language-sandpack"> → Sandpack
 * - <code class="language-mermaid"> → Mermaid SVG diagram
 * - Standard <pre><code> → static code block (unchanged)
 */
export default function ArticleContentRenderer({ htmlContent }: ArticleContentRendererProps) {
  const segments = useMemo(() => parseContent(htmlContent), [htmlContent]);

  return (
    <div className="prose prose-lg dark:prose-invert max-w-none
                    prose-p:text-muted-foreground
                    prose-headings:text-foreground
                    prose-a:text-primary hover:prose-a:underline
                    prose-strong:text-foreground
                    prose-blockquote:border-primary
                    prose-code:text-primary prose-code:before:content-[''] prose-code:after:content-['']
                    prose-img:rounded-lg">
      {segments.map((segment, index) => {
        if (segment.type === 'sandpack') {
          return (
            <InteractiveSandbox
              key={`sandpack-${index}`}
              code={segment.code}
              language={segment.language}
            />
          );
        }

        if (segment.type === 'mermaid') {
          return (
            <div key={`mermaid-${index}`} className="my-6">
              <MermaidRenderer chart={segment.code} />
            </div>
          );
        }

        // Static HTML segment
        return (
          <div
            key={`html-${index}`}
            dangerouslySetInnerHTML={{ __html: segment.html }}
          />
        );
      })}
    </div>
  );
}

// --- Content Parser ---

type Segment =
  | { type: 'html'; html: string }
  | { type: 'sandpack'; code: string; language: string }
  | { type: 'mermaid'; code: string };

function parseContent(html: string): Segment[] {
  const segments: Segment[] = [];

  // Match <pre> blocks containing interactive or mermaid code
  // Pattern: <pre...><code ...class="language-mermaid"...>...</code></pre>
  //       or <pre...><code ...data-interactive="true"...>...</code></pre>
  //       or <pre...><code ...class="language-sandpack"...>...</code></pre>
  const preBlockRegex = /<pre[^>]*>\s*<code([^>]*)>([\s\S]*?)<\/code>\s*<\/pre>/gi;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = preBlockRegex.exec(html)) !== null) {
    const [fullMatch, codeAttrs, rawCode] = match;
    const matchStart = match.index;

    // Check if this code block is interactive or mermaid
    const isInteractive =
      codeAttrs.includes('data-interactive="true"') ||
      codeAttrs.includes("data-interactive='true'") ||
      codeAttrs.includes('class="language-sandpack"') ||
      codeAttrs.includes("class='language-sandpack'");

    const isMermaid =
      codeAttrs.includes('class="language-mermaid"') ||
      codeAttrs.includes("class='language-mermaid'");

    if (!isInteractive && !isMermaid) {
      // Standard code block — skip, will be part of static HTML
      continue;
    }

    // Push preceding static HTML
    if (matchStart > lastIndex) {
      const precedingHtml = html.substring(lastIndex, matchStart);
      if (precedingHtml.trim()) {
        segments.push({ type: 'html', html: precedingHtml });
      }
    }

    // Decode HTML entities in code content
    const code = decodeHtmlEntities(rawCode);

    if (isMermaid) {
      segments.push({ type: 'mermaid', code });
    } else {
      // Extract language from class attribute
      const langMatch = codeAttrs.match(/class="language-(\w+)"/);
      const language = langMatch ? langMatch[1] : 'javascript';
      segments.push({ type: 'sandpack', code, language: language === 'sandpack' ? 'javascript' : language });
    }

    lastIndex = matchStart + fullMatch.length;
  }

  // Push remaining HTML
  if (lastIndex < html.length) {
    const remainingHtml = html.substring(lastIndex);
    if (remainingHtml.trim()) {
      segments.push({ type: 'html', html: remainingHtml });
    }
  }

  // If no special blocks were found, return the entire HTML as a single segment
  if (segments.length === 0) {
    return [{ type: 'html', html }];
  }

  return segments;
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/');
}
