// src/components/ResourceCard.tsx
'use client';

import { motion } from 'framer-motion';
import { Resource, Category } from '@prisma/client';
import { Link as LinkIcon, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import BookmarkButton from './BookmarkButton';
import ReportContentModal from './ReportContentModal';

// We extend the type to ensure compatibility with the Page and List
export type ResourceWithCategory = Resource & {
  category: Category;
  isInitiallySaved?: boolean;
};

interface ResourceCardProps {
  resource: ResourceWithCategory;
  // Made these optional so the component is flexible
  isSaved?: boolean;
  onToggleSave?: (isSaved: boolean) => void;
  viewMode: 'grid' | 'list';
}

export default function ResourceCard({
  resource,
  viewMode,
  isSaved: propIsSaved,
  onToggleSave,
}: ResourceCardProps) {
  // Determine saved status: Priority to prop, then resource object
  const isSaved = propIsSaved !== undefined ? propIsSaved : (resource.isInitiallySaved || false);

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ y: -2 }}
        className="relative bg-card border border-border rounded-2xl overflow-hidden group transition-shadow hover:shadow-md"
      >
        <Link href={`/resources/${resource.id}`} className="flex flex-col md:flex-row">
          {/* Image Section */}
          <div className="relative md:w-56 h-48 md:h-auto overflow-hidden shrink-0">
            {resource.imageUrl ? (
              <Image
                src={resource.imageUrl}
                alt={resource.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, 224px"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <LinkIcon className="w-10 h-10 text-muted-foreground/50" />
              </div>
            )}
          </div>

          {/* Text Content Section */}
          <div className="p-6 flex-grow flex flex-col pr-16">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] uppercase tracking-widest font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md">
                {resource.category.name}
              </span>
              {/* Inline Save Button for List Mode */}
              <div className="absolute top-4 right-4 z-20 flex items-center gap-2" onClick={(e) => e.preventDefault()}>
                <ReportContentModal contentType="RESOURCE" contentId={resource.id} />
                <BookmarkButton 
                  resourceId={resource.id} 
                  isInitiallySaved={isSaved} 
                  onChange={onToggleSave}
                />
              </div>
            </div>

            <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
              {resource.name}
            </h3>
            <p className="text-muted-foreground mb-4 line-clamp-2 text-sm leading-relaxed">
              {resource.description}
            </p>
            
            <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
              <span className="text-xs text-muted-foreground">
                Added {new Date(resource.createdAt).toLocaleDateString()}
              </span>
              <span className="text-xs font-medium text-primary flex items-center gap-1">
                View Details <ArrowRight size={14} />
              </span>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  // GRID VIEW
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="relative h-full bg-card border border-border rounded-2xl overflow-hidden flex flex-col group transition-all hover:shadow-xl hover:shadow-primary/5"
    >
      <Link href={`/resources/${resource.id}`} className="flex flex-col h-full relative z-10">
        {/* Image Container */}
        <div className="relative aspect-video overflow-hidden shrink-0">
          {resource.imageUrl ? (
            <Image
              src={resource.imageUrl}
              alt={resource.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <LinkIcon className="w-10 h-10 text-muted-foreground/50" />
            </div>
          )}
          {/* Overlay for Grid to make text pop */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Content */}
        <div className="p-5 flex-grow flex flex-col">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] uppercase tracking-widest font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
              {resource.category.name}
            </span>
          </div>

          <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
            {resource.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-grow">
            {resource.description}
          </p>

          <div className="text-[11px] text-muted-foreground flex items-center justify-between mt-auto border-t border-border pt-3">
            <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
            <span className="text-primary font-semibold">Explore →</span>
          </div>
        </div>
      </Link>
      
      {/* Save Button explicitly outside the link */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2" onClick={(e) => e.preventDefault()}>
        <ReportContentModal contentType="RESOURCE" contentId={resource.id} />
        <BookmarkButton 
          resourceId={resource.id} 
          isInitiallySaved={isSaved} 
          onChange={onToggleSave}
        />
      </div>
    </motion.div>
  );
}