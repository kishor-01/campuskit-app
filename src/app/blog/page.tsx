// src/app/blog/page.tsx

import prisma from "@/lib/prisma";
import ArticleGrid from "@/components/ArticleGrid";
import Link from "next/link";
import Image from "next/image";

export default async function BlogPage() {
  const articles = await prisma.article.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { createdAt: 'desc' },
  });

  if (articles.length === 0) {
    return (
      <div className="text-center py-24">
        <h1 className="text-4xl font-bold">The Blog is Coming Soon</h1>
        <p className="text-muted-foreground mt-4">We're busy writing. Check back later for new articles!</p>
      </div>
    );
  }

  const featuredArticle = articles[0];
  const regularArticles = articles.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-extrabold text-foreground">CampusKit Blog</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Guides, tips, and insights to help you thrive in your student journey.
        </p>
      </div>

      {/* Featured Article */}
      <div className="mb-12 group">
        <Link href={`/blog/${featuredArticle.slug}`}>
          <div className="relative w-full h-96 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
            {featuredArticle.imageUrl && (
              <Image src={featuredArticle.imageUrl} alt={featuredArticle.title} layout="fill" objectFit="cover" className="group-hover:scale-105 transition-transform duration-300" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-8">
              <span className="bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full uppercase">Latest Post</span>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mt-4">{featuredArticle.title}</h2>
              <p className="text-white/80 mt-2 max-w-2xl line-clamp-2">{featuredArticle.excerpt}</p>
            </div>
          </div>
        </Link>
      </div>
      
      {/* Regular Articles */}
      <ArticleGrid articles={regularArticles} />
    </div>
  );
}