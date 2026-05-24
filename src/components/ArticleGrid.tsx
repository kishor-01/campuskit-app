// src/components/ArticleGrid.tsx
"use client";

import type { Article } from "@prisma/client";
import ArticleCard from "./ArticleCard";

export default function ArticleGrid({ articles }: { articles: Article[] }) {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
    >
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}