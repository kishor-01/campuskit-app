// src/app/blog/[slug]/page.tsx

import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  // Fetch the specific article by its slug
  const article = await prisma.article.findUnique({
    where: { slug: params.slug, status: 'PUBLISHED' },
    include: { author: true },
  });

  // If no article is found, show a 404 page
  if (!article) {
    notFound();
  }

  // Fetch the 5 latest articles for the sidebar
  const latestArticles = await prisma.article.findMany({
    where: { status: 'PUBLISHED', NOT: { id: article.id } },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { title: true, slug: true },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        
        {/* Main Article Content */}
        <article className="lg:col-span-3">
          {article.imageUrl && (
            <div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden">
              <Image src={article.imageUrl} alt={article.title} layout="fill" objectFit="cover" />
            </div>
          )}
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">{article.title}</h1>
          <div className="flex items-center text-sm text-muted-foreground mb-8">
            <span>By {article.author.name}</span>
            <span className="mx-2">•</span>
            <span>{new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(article.createdAt)}</span>
          </div>

          {/* Render Markdown content */}
          <div className="prose prose-lg dark:prose-invert max-w-none 
                        prose-headings:text-foreground prose-p:text-muted-foreground 
                        prose-a:text-primary prose-strong:text-foreground
                        prose-blockquote:border-primary prose-code:text-primary">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {article.content}
            </ReactMarkdown>
          </div>
        </article>

        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 bg-muted/50 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-foreground mb-4">Latest Articles</h3>
            <ul className="space-y-4">
              {latestArticles.map((latest) => (
                <li key={latest.slug}>
                  <Link href={`/blog/${latest.slug}`} className="font-semibold text-muted-foreground hover:text-primary transition-colors">
                    {latest.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

      </div>
    </div>
  );
}