// src/components/ResourceList.tsx
'use client'

import { useState, useMemo, useEffect } from 'react';
import type { Prisma } from '@prisma/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import ResourceCard from '@/components/ResourceCard';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type ResourceWithDetails = Prisma.ResourceGetPayload<{
  include: { category: true };
}>;
type ResourceListProps = {
  resources: (ResourceWithDetails & { isInitiallySaved: boolean })[]
};

export default function ResourceList({ resources }: ResourceListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { data: session } = useSession();
  const router = useRouter();

  const categories = ['All', ...Array.from(new Set(resources.map(r => r.category.name)))];

  const filteredResources = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return resources.filter(resource => {
      const categoryMatch = selectedCategory === 'All' || resource.category.name === selectedCategory;
      const searchMatch = !q || resource.name.toLowerCase().includes(q) || resource.description.toLowerCase().includes(q);
      return categoryMatch && searchMatch;
    });
  }, [resources, searchQuery, selectedCategory]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
  };

  const onSubmitClick = () => {
    if (!session) {
      router.push('/login');
    } else {
      router.push('/submit-resource');
    }
  };

  // sticky mobile CTA: show if user scrolls down a bit
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  useEffect(() => {
    const handler = () => setShowStickyCTA(window.scrollY > 220);
    handler();
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Heading row */}
      <div className="mb-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-foreground">Find the Best Tools & Resources</h1>
      </div>

      {/* Subheading + submit button on next row (mobile-first stacking) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <p className="text-lg text-muted-foreground max-w-2xl">
          A curated collection to help you succeed in college and beyond.
        </p>

        <div className="flex-shrink-0">
          <button
            onClick={onSubmitClick}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-semibold hover:bg-primary/90 transition-colors"
          >
            Submit Resource
          </button>
        </div>
      </div>

      {/* Search and categories */}
      <div className="mt-2 space-y-4">
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 pl-12 bg-background border border-muted rounded-full focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                selectedCategory === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 hover:bg-muted text-muted-foreground'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* grid of uniform cards */}
      <motion.div
        key={selectedCategory + searchQuery}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mt-8 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr"
      >
        <AnimatePresence>
          {filteredResources.length > 0 ? (
            filteredResources.map((resource) => (
              <motion.div key={resource.id} layout>
                <ResourceCard resource={resource} isInitiallySaved={resource.isInitiallySaved} />
              </motion.div>
            ))
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No resources found. Try a different search or category!</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Mobile sticky CTA */}
      {showStickyCTA && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 sm:hidden">
          <button onClick={onSubmitClick} className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold shadow-lg">
            Submit Resource
          </button>
        </div>
      )}
    </div>
  );
}
