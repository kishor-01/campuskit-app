// src/components/ArticleGrid.tsx
"use client";

import { motion } from "framer-motion";
import type { Article } from "@prisma/client";
import ArticleCard from "./ArticleCard";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

export default function ArticleGrid({ articles }: { articles: Article[] }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
    >
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </motion.div>
  );
}