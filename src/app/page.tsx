// src/app/page.tsx

import prisma from "@/lib/prisma";
import Link from 'next/link';
import HomePageClient from "@/components/HomePageClient";
import FeaturedArticleCard from "@/components/FeaturedArticleCard";

export default async function HomePage() {
  const latestArticle = await prisma.article.findFirst({
    where: { status: 'PUBLISHED' },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <>
      <HomePageClient />
      
      {latestArticle && (
        <section className="py-16 sm:py-20 bg-background border-y border-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FeaturedArticleCard article={latestArticle} />
            {/* CORRECTED: Add a link to the main blog page */}
            <div className="mt-8 text-center">
              <Link href="/blog" className="text-sm font-semibold text-primary hover:underline">
                View All Posts &rarr;
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="py-16 sm:py-20">
        <div className="max-w-3xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-foreground">
            Ready to Level Up Your Learning Experience?
          </h2>
          <div className="mt-8">
            <Link
              href="/resources"
              className="inline-block bg-primary text-primary-foreground font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-primary/90 transition-colors duration-300"
            >
              Browse All Resources
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}