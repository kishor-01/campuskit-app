// /src/app/blog/[slug]/page.tsx

import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { FileText, Pencil, Clock, Tag } from "lucide-react";
import DOMPurify from 'isomorphic-dompurify';
import { unstable_noStore as noStore } from 'next/cache';

// Dynamic imports for client components
import ArticleContentRenderer from "@/components/blog/ArticleContentRenderer";
import ArticleToC from "@/components/blog/ArticleToC";
import SeriesWidget from "@/components/blog/SeriesWidget";
import CloneToGoalsWidget from "@/components/blog/CloneToGoalsWidget";
import BookmarkArticleButton from "@/components/blog/BookmarkArticleButton";

// LatestArticleCard component
const LatestArticleCard = ({
  article,
  index,
}: {
  article: { slug: string; title: string; imageUrl: string | null };
  index: number;
}) => {
  const bgColor = index % 2 === 0 ? "bg-card" : "bg-muted/50";
  return (
    <Link href={`/blog/${article.slug}`} className={`block p-3 rounded-lg ${bgColor} hover:bg-primary/10 transition-colors group`}>
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 shrink-0 rounded-md overflow-hidden bg-muted">
          {article.imageUrl ? ( <Image src={article.imageUrl} alt={article.title} fill className="object-cover"/> ) : ( <div className="w-full h-full flex items-center justify-center"><FileText className="w-6 h-6 text-muted-foreground" /></div> )}
        </div>
        <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-3">{article.title}</h4>
      </div>
    </Link>
  );
};

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  noStore(); // Force dynamic

  const resolvedParams = await params;

  // Fetch session first
  const session = await auth();
  const isAdmin = session?.user?.isAdmin === true;
  const userId = session?.user?.id;

  // Fetch article with series data
  const article = await prisma.article.findUnique({
      where: { slug: resolvedParams.slug, status: 'PUBLISHED' },
      include: {
        author: { select: { name: true } },
        series: {
          include: {
            articles: {
              where: { status: 'PUBLISHED' },
              select: { slug: true, title: true, seriesOrder: true },
              orderBy: { seriesOrder: 'asc' },
            },
          },
        },
      },
  });

  if (!article) {
    notFound();
  }

  // Check if user has saved this article
  let isArticleSaved = false;
  if (userId) {
    const savedRecord = await prisma.savedArticle.findUnique({
      where: { userId_articleId: { userId, articleId: article.id } },
    });
    isArticleSaved = !!savedRecord;
  }

  // Fetch latest articles
  const latestArticles = await prisma.article.findMany({
    where: { status: 'PUBLISHED', NOT: { id: article.id } },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { title: true, slug: true, imageUrl: true },
  });

  // Sanitize the HTML content
  const cleanHtml = DOMPurify.sanitize(article.content);

  const hasBlueprint = !!article.clonableBlueprint;
  const hasSeries = !!article.series;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">

        {/* Left sidebar — Table of Contents (desktop only) */}
        <div className="hidden lg:block lg:col-span-1">
          <ArticleToC htmlContent={cleanHtml} />
        </div>

        <article className="lg:col-span-3">
          {/* Admin edit link */}
          <div className="mb-8">
            {isAdmin && (
              <div className="mb-4">
                <Link href={`/admin/blog`} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80">
                  <Pencil size={16} />
                  Edit in Blog Manager
                </Link>
              </div>
            )}

            {/* Series Widget (top) */}
            {hasSeries && article.series && article.seriesOrder && (
              <SeriesWidget
                seriesTitle={article.series.title}
                seriesSlug={article.series.slug}
                currentOrder={article.seriesOrder}
                articles={article.series.articles}
              />
            )}

            {/* Clonable Blueprint Widget */}
            {hasBlueprint && userId && (
              <div className="mb-6">
                <CloneToGoalsWidget articleId={article.id} articleTitle={article.title} />
              </div>
            )}

            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 leading-tight">{article.title}</h1>

            {/* Article meta row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span>By {article.authorOverride || article.author?.name || 'Seniofy Team'}</span>
              <span className="hidden sm:inline">•</span>
              <span>{new Date(article.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
              <span className="hidden sm:inline">•</span>
              <span className="inline-flex items-center gap-1">
                <Clock size={14} />
                {article.readTimeMins} min read
              </span>
              {/* Bookmark button */}
              {userId && (
                <BookmarkArticleButton articleId={article.id} isInitiallySaved={isArticleSaved} />
              )}
            </div>

            {/* Tags */}
            {article.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <Tag size={14} className="text-muted-foreground" />
                {article.tags.map((tag) => (
                  <span key={tag} className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Image section */}
          <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden mb-8">
            {article.imageUrl ? ( <Image src={article.imageUrl} alt={article.title} fill className="object-cover"/> ) : ( <div className="w-full h-full flex items-center justify-center"><FileText className="w-16 h-16 text-muted-foreground" /></div> )}
          </div>

          {/* Render content with Sandpack + Mermaid interception */}
          <ArticleContentRenderer htmlContent={cleanHtml} />

          {/* Bottom series navigation */}
          {hasSeries && article.series && article.seriesOrder && (
            <SeriesWidget
              seriesTitle={article.series.title}
              seriesSlug={article.series.slug}
              currentOrder={article.seriesOrder}
              articles={article.series.articles}
            />
          )}
        </article>

        {/* Right sidebar */}
        <aside className="lg:col-span-1">
           <div className="sticky top-24 lg:-mr-14">
            <h3 className="text-xl font-bold text-foreground mb-4">Latest Articles</h3>
            <div className="space-y-4">
              {latestArticles.map((latest, index) => (
                <LatestArticleCard key={latest.slug} article={latest} index={index}/>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}