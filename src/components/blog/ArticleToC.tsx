// src/components/blog/ArticleToC.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { List } from 'lucide-react';

interface TocItem {
  id: string;
  text: string;
  level: number; // 2 or 3
}

interface ArticleToCProps {
  htmlContent: string;
}

/**
 * Sticky Table of Contents for article detail pages.
 * Parses <h2> and <h3> tags from the article HTML, generates anchor IDs,
 * and uses IntersectionObserver to highlight the active section on scroll.
 */
export default function ArticleToC({ htmlContent }: ArticleToCProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  // Parse headings from HTML content on mount
  useEffect(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const headings = doc.querySelectorAll('h2, h3');

    const items: TocItem[] = [];
    headings.forEach((heading, index) => {
      const text = heading.textContent?.trim() || '';
      if (!text) return;
      
      // Generate a stable ID
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || `heading-${index}`;
      
      items.push({
        id,
        text,
        level: heading.tagName === 'H2' ? 2 : 3,
      });
    });

    setTocItems(items);
  }, [htmlContent]);

  // Inject IDs into the actual DOM headings and set up IntersectionObserver
  useEffect(() => {
    if (tocItems.length === 0) return;

    // Find all h2/h3 in the article content area
    const articleEl = document.querySelector('article');
    if (!articleEl) return;

    const headings = articleEl.querySelectorAll('h2, h3');
    let tocIndex = 0;

    headings.forEach((heading) => {
      const text = heading.textContent?.trim() || '';
      if (!text || tocIndex >= tocItems.length) return;

      if (text === tocItems[tocIndex].text) {
        heading.id = tocItems[tocIndex].id;
        tocIndex++;
      }
    });

    // Set up IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -70% 0px',
        threshold: 0.1,
      }
    );

    tocItems.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [tocItems]);

  const handleClick = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  if (tocItems.length < 2) return null; // Don't show ToC for very short articles

  return (
    <nav className="sticky top-24 space-y-1" aria-label="Table of Contents">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
        <List className="w-4 h-4 text-primary" />
        <span className="text-xs font-bold uppercase tracking-widest text-primary">
          On This Page
        </span>
      </div>
      <ul className="space-y-0.5">
        {tocItems.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => handleClick(item.id)}
              className={`
                block w-full text-left text-sm py-1.5 transition-all duration-200
                border-l-2 hover:text-primary
                ${item.level === 3 ? 'pl-6' : 'pl-3'}
                ${activeId === item.id
                  ? 'border-primary text-primary font-semibold bg-primary/5'
                  : 'border-transparent text-muted-foreground hover:border-primary/40'
                }
              `}
            >
              {item.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
