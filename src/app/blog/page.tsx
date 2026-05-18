// src/app/blog/page.tsx
import prisma from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import ArticleCard from "@/components/blog/ArticleCard";
import PaginationControls from "@/components/blog/PaginationControls";
import BlogFilterControls from "@/components/blog/BlogFilterControls";

const FeaturedArticleCard = ({
  article,
}: {
  article: { slug: string; title: string; excerpt: string; imageUrl: string | null; createdAt: Date };
}) => {
  return (
    <div className="group relative w-full h-[400px] rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
      <Link href={`/blog/${article.slug}`}>
        {article.imageUrl && (
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-8 text-white">
          <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Latest Post
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold mt-4 max-w-2xl leading-tight">
            {article.title}
          </h2>
          <p className="text-white/80 mt-2 max-w-2xl line-clamp-2">
            {article.excerpt}
          </p>
        </div>
      </Link>
    </div>
  );
};

export const revalidate = 60;

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const page = parseInt(sp["page"] as string) || 1;
  const sort = (sp["sort"] as string) || "latest";
  // Updated the limit to 12 blogs per page.
  const limit = 12;
  const offset = (page - 1) * limit;

  const totalArticles = await prisma.article.count({
    where: { status: "PUBLISHED", publishedAt: { lte: new Date() } },
  });
  
  const latestArticle = await prisma.article.findFirst({
    where: { status: "PUBLISHED", publishedAt: { lte: new Date() } },
    orderBy: { createdAt: "desc" },
    select: {
        slug: true,
        title: true,
        excerpt: true,
        imageUrl: true,
        createdAt: true,
    }
  });

  if (!latestArticle) {
    return (
      <div className="text-center py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold">The Blog is Coming Soon</h1>
        <p className="text-muted-foreground mt-4">
          We're busy writing. Check back later for new articles!
        </p>
      </div>
    );
  }

  const orderBy = sort === 'oldest' 
    ? { createdAt: 'asc' as const } 
    : { createdAt: 'desc' as const };

  const otherArticles = await prisma.article.findMany({
    where: { status: "PUBLISHED", publishedAt: { lte: new Date() }, NOT: { slug: latestArticle.slug } },
    orderBy,
    skip: offset,
    take: limit,
    select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        imageUrl: true,
        createdAt: true,
    }
  });

  const totalPages = Math.ceil((totalArticles - 1) / limit);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-extrabold text-foreground">
          Seniofy Blog
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Guides, tips, and insights to help you thrive in your student journey.
        </p>
      </div>

      <div className="mb-12">
        <FeaturedArticleCard article={latestArticle} />
      </div>
      
      <div className="mb-12">
        <BlogFilterControls />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {otherArticles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      <div className="mt-16">
        <PaginationControls
          currentPage={page}
          totalPages={totalPages}
          baseUrl="/blog"
        />
      </div>
    </div>
  );
}

