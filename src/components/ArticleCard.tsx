// src/components/ArticleCard.tsx

"use client";

import type { Article } from "@prisma/client";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import ReportContentModal from "./ReportContentModal";

interface ArticleCardProps {
  article: Article; // Fixed the typo from 'artiacle' to 'article'
}

// Fixed Framer Motion variants with proper easing types
const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 30 
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.5, 
      ease: [0.25, 0.46, 0.45, 0.94] as const // Use easing array instead of string
    } 
  },
};

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <motion.div 
      variants={cardVariants} 
      initial="hidden"
      animate="visible"
      className="h-full"
    >
      <div className="relative h-full">
        <Link href={`/blog/${article.slug}`} className="block h-full">
          <div className="flex flex-col h-full bg-muted/50 rounded-lg overflow-hidden group shadow-sm hover:shadow-xl transition-shadow duration-300">
            {article.imageUrl && (
            <div className="relative w-full h-48 overflow-hidden">
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{ objectFit: 'cover' }}
                className="group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          <div className="p-6 flex-grow flex flex-col">
            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
              {article.title}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground flex-grow line-clamp-3">
              {article.excerpt}
            </p>
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(article.createdAt)}
              </span>
              <span className="font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Read More &rarr;
              </span>
            </div>
          </div>
        </div>
      </Link>
      <div className="absolute top-4 right-4 z-20" onClick={(e) => e.preventDefault()}>
        <ReportContentModal contentType="ARTICLE" contentId={article.id} />
      </div>
      </div>
    </motion.div>
  );
}