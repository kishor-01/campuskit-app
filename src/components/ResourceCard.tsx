// src/components/ResourceCard.tsx
'use client';

import { motion } from 'framer-motion';
import { Resource, Category } from '@prisma/client';
import { ArrowUpRight, Bookmark as BookmarkIcon, Link as LinkIcon } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';

// Define the shape of the resource prop, including the category
type ResourceWithCategory = Resource & {
  category: Category;
};

interface ResourceCardProps {
  resource: ResourceWithCategory;
  isSaved: boolean;
  onToggleSave: () => void;
  viewMode: 'grid' | 'list';
}

export default function ResourceCard({ resource, isSaved, onToggleSave, viewMode }: ResourceCardProps) {
  const { data: session } = useSession();

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session) {
      // Optionally redirect to login or show a toast
      return;
    }
    onToggleSave();
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        whileHover={{ y: -2, boxShadow: "0 5px 15px -5px rgba(0,0,0,0.1)" }}
        className="bg-card border border-border rounded-xl overflow-hidden group"
      >
        <div className="flex flex-col md:flex-row">
          {/* Image Section */}
          <div className="relative md:w-48 h-48 md:h-auto overflow-hidden">
            {resource.imageUrl ? (
              <Image
                src={resource.imageUrl}
                alt={resource.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 192px"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <LinkIcon className="w-10 h-10 text-muted-foreground/50" />
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="p-6 flex-grow flex flex-col">
            <div className="flex justify-between items-start gap-4 mb-3">
              <span className="text-xs bg-primary/10 text-primary font-bold px-3 py-1 rounded-full">
                {resource.category.name}
              </span>
              <button
                onClick={handleSaveClick}
                className={`p-2 rounded-full transition-colors ${
                  isSaved 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
                title={isSaved ? "Remove from saved" : "Save resource"}
              >
                <BookmarkIcon size={16} fill={isSaved ? "currentColor" : "none"} />
              </button>
            </div>

            <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
              {resource.name}
            </h3>
            
            <p className="text-muted-foreground mb-4 line-clamp-2 flex-grow">
              {resource.description}
            </p>

            <div className="flex items-center justify-between">
              <Link
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Visit Site <ArrowUpRight size={16} />
              </Link>
              <span className="text-xs text-muted-foreground">
                {new Date(resource.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid View (default)
  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0 10px 20px -5px rgba(0,0,0,0.07)" }}
      className="h-full bg-card border border-border rounded-xl overflow-hidden flex flex-col group"
    >
      {/* Image Section */}
      <div className="relative aspect-video overflow-hidden">
        {resource.imageUrl ? (
          <Image
            src={resource.imageUrl}
            alt={resource.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <LinkIcon className="w-10 h-10 text-muted-foreground/50" />
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 flex-grow flex flex-col">
        <div className="flex justify-between items-start gap-2 mb-2">
          <span className="text-xs bg-primary/10 text-primary font-bold px-2 py-1 rounded-full">
            {resource.category.name}
          </span>
          <button
            onClick={handleSaveClick}
            className={`p-1 rounded-full transition-colors ${
              isSaved 
                ? 'text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            title={isSaved ? "Remove from saved" : "Save resource"}
          >
            <BookmarkIcon size={16} fill={isSaved ? "currentColor" : "none"} />
          </button>
        </div>

        <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {resource.name}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-4 flex-grow line-clamp-3">
          {resource.description}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <Link
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Visit Site <ArrowUpRight size={16} />
          </Link>
          <span className="text-xs text-muted-foreground">
            {new Date(resource.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </motion.div>
  );
}