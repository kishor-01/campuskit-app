// src/components/ArticleCard.tsx

"use client";

import type { Article } from "@prisma/client";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

interface ArticleCardProps {
  article: Article;
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <motion.div variants={cardVariants} className="h-full">
      <Link href={`/blog/${article.slug}`} className="block h-full">
        <div className="flex flex-col h-full bg-muted/50 rounded-lg overflow-hidden group shadow-sm hover:shadow-xl transition-shadow duration-300">
          {article.imageUrl && (
            <div className="relative w-full h-48 overflow-hidden">
              <Image
                src={article.imageUrl}
                alt={article.title}
                layout="fill"
                objectFit="cover"
                className="group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          <div className="p-6 flex-grow flex flex-col">
            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{article.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground flex-grow line-clamp-3">{article.excerpt}</p>
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>{new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(article.createdAt)}</span>
              <span className="font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Read More &rarr;
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}