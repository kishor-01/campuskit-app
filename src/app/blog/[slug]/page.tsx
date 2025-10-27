// /src/app/blog/[slug]/page.tsx

import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { FileText, Pencil } from "lucide-react";
import DOMPurify from 'isomorphic-dompurify';
import { unstable_noStore as noStore } from 'next/cache';

// LatestArticleCard component (unchanged)
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

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  noStore(); // Force dynamic

  // Fetch session first
  const session = await auth();
  const isAdmin = session?.user?.isAdmin === true;

  // Fetch article
  const article = await prisma.article.findUnique({
      where: { slug: params.slug, status: 'PUBLISHED' },
      include: { author: { select: { name: true } } },
  });

  if (!article) {
    notFound();
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">

        <div className="hidden lg:block lg:col-span-1"></div>

        <article className="lg:col-span-3">
          <div className="mb-8">
            {isAdmin && (
              <div className="mb-4">
                <Link href={`/admin/blog`} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80">
                  <Pencil size={16} />
                  Edit in Blog Manager
                </Link>
              </div>
            )}
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 leading-tight">{article.title}</h1>
            <div className="flex items-center text-sm text-muted-foreground">
              <span>By {article.author?.name ?? 'EduLink Team'}</span>
              <span className="mx-2">•</span>
              <span>{new Date(article.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
            </div>
          </div>

          {/* Image section (unchanged) */}
          <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden mb-8">
            {article.imageUrl ? ( <Image src={article.imageUrl} alt={article.title} fill className="object-cover"/> ) : ( <div className="w-full h-full flex items-center justify-center"><FileText className="w-16 h-16 text-muted-foreground" /></div> )}
          </div>

          {/* Render sanitized HTML */}
          <div
            className="prose prose-lg dark:prose-invert max-w-none
                       prose-p:text-muted-foreground
                       prose-headings:text-foreground
                       prose-a:text-primary hover:prose-a:underline
                       prose-strong:text-foreground
                       prose-blockquote:border-primary
                       prose-code:text-primary prose-code:before:content-[''] prose-code:after:content-['']
                       prose-img:rounded-lg"
            dangerouslySetInnerHTML={{ __html: cleanHtml }}
          />

        </article>

        {/* Sidebar section (unchanged) */}
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