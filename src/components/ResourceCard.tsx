// src/components/ResourceCard.tsx

"use client";

import { motion } from 'framer-motion';
import type { Prisma } from '@prisma/client';
import BookmarkButton from './BookmarkButton';

type ResourceWithCategory = Prisma.ResourceGetPayload<{
  include: { category: true }
}>;

interface ResourceCardProps {
  resource: ResourceWithCategory;
  isInitiallySaved: boolean;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function ResourceCard({ resource, isInitiallySaved }: ResourceCardProps) {
  return (
    <motion.div 
      variants={cardVariants}
      className="h-full bg-background border border-muted rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-transform duration-300 group relative flex flex-col"
    >
      <div className="p-6 flex-grow">
        {/* The title is the primary link */}
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="pr-12" // Padding to avoid overlapping the button
        >
          <h3 className="text-xl font-bold text-foreground group-hover:text-primary">{resource.name}</h3>
        </a>
        
        {/* FIX: Moved category tag to its own line for better layout */}
        <div className="mt-2">
            <span className="bg-primary/10 text-primary text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap">
                {resource.category.name}
            </span>
        </div>

        <p className="mt-3 text-muted-foreground text-sm">{resource.description}</p>
      </div>

      {/* Place the bookmark button in the top-right corner */}
      <BookmarkButton resourceId={resource.id} isInitiallySaved={isInitiallySaved} />
    </motion.div>
  );
}