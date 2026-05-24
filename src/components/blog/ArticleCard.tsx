// src/components/blog/ArticleCard.tsx
'use client'

import Link from 'next/link';
import Image from 'next/image';
import { FileText } from 'lucide-react';

// Define a type for the article data we expect
type Article = {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  imageUrl: string | null;
  createdAt: Date;
}

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <div className="h-full">
      <Link href={`/blog/${article.slug}`} className="block group h-full">
        <div className="bg-card border border-border rounded-lg overflow-hidden h-full flex flex-col shadow-sm hover:shadow-md transition-shadow">
          <div className="relative aspect-video bg-muted">
            {article.imageUrl ? (
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FileText className="w-10 h-10 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="p-4 flex flex-col flex-grow">
            <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{article.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground flex-grow line-clamp-3">{article.excerpt}</p>
            <div className="mt-4 text-xs text-muted-foreground">
              {new Date(article.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

