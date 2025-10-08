// src/components/FeaturedArticleCard.tsx

import type { Article } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";

export default function FeaturedArticleCard({ article }: { article: Article }) {
  return (
    <Link href={`/blog/${article.slug}`} className="block group">
      <div className="flex flex-col md:flex-row items-center gap-8 bg-muted/50 rounded-lg p-8 transition-colors hover:bg-muted">
        {article.imageUrl && (
          <div className="relative w-full md:w-1/3 h-64 md:h-48 rounded-md overflow-hidden flex-shrink-0">
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              style={{ objectFit: 'cover' }}
              className="group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="flex-grow">
          <p className="text-primary font-semibold text-sm mb-2">From the Blog</p>
          <h3 className="text-2xl font-bold text-foreground">{article.title}</h3>
          <p className="mt-3 text-muted-foreground line-clamp-2">{article.excerpt}</p>
          <span className="mt-4 inline-block font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Read More &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}