// src/components/blog/SeriesWidget.tsx
import Link from 'next/link';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

interface SeriesArticle {
  slug: string;
  title: string;
  seriesOrder: number | null;
}

interface SeriesWidgetProps {
  seriesTitle: string;
  seriesSlug: string;
  currentOrder: number;
  articles: SeriesArticle[];
}

/**
 * Multi-part series navigator.
 * Renders a "Part X of Y" navigation box with links to previous/next chapters.
 */
export default function SeriesWidget({
  seriesTitle,
  seriesSlug,
  currentOrder,
  articles,
}: SeriesWidgetProps) {
  const sorted = [...articles].sort((a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0));
  const total = sorted.length;

  const currentIndex = sorted.findIndex((a) => a.seriesOrder === currentOrder);
  const prevArticle = currentIndex > 0 ? sorted[currentIndex - 1] : null;
  const nextArticle = currentIndex < total - 1 ? sorted[currentIndex + 1] : null;

  return (
    <div className="my-8 rounded-xl border border-border bg-gradient-to-br from-primary/5 via-transparent to-primary/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-border bg-primary/5">
        <BookOpen className="w-5 h-5 text-primary" />
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            Series
          </p>
          <p className="text-sm font-semibold text-foreground">{seriesTitle}</p>
        </div>
        <span className="ml-auto text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded-full">
          Part {currentOrder} of {total}
        </span>
      </div>

      {/* All Parts */}
      <div className="px-5 py-3 space-y-1 max-h-48 overflow-y-auto">
        {sorted.map((article) => (
          <Link
            key={article.slug}
            href={`/blog/${article.slug}`}
            className={`
              flex items-center gap-2 text-sm py-1.5 px-2 rounded-md transition-colors
              ${article.seriesOrder === currentOrder
                ? 'bg-primary/10 text-primary font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }
            `}
          >
            <span className="w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold bg-muted border border-border shrink-0">
              {article.seriesOrder}
            </span>
            <span className="line-clamp-1">{article.title}</span>
          </Link>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/30">
        {prevArticle ? (
          <Link
            href={`/blog/${prevArticle.slug}`}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="line-clamp-1 max-w-[180px]">{prevArticle.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {nextArticle ? (
          <Link
            href={`/blog/${nextArticle.slug}`}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <span className="line-clamp-1 max-w-[180px]">{nextArticle.title}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <span className="text-xs text-emerald-600 font-semibold">🎉 Series Complete</span>
        )}
      </div>
    </div>
  );
}
