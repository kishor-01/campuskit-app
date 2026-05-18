// src/components/ResourceList.tsx
'use client'

import { useState, useMemo, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import ResourceCard, { ResourceWithCategory } from './ResourceCard';
import { Category } from '@prisma/client';
import { Search, LayoutGrid, List, Sparkles, GraduationCap, ChevronDown } from 'lucide-react';

interface ResourceListProps {
  resources: ResourceWithCategory[];
  categories: Category[];
  totalPages: number;
  currentPage: number;
  currentCategory?: string;
  currentSort?: string;
}

function useSafeSearchParams() {
  const searchParams = useSearchParams();
  return searchParams || new URLSearchParams();
}

function ResourceListContent({
  resources,
  categories,
  totalPages,
  currentPage,
  currentCategory,
  currentSort,
}: ResourceListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSafeSearchParams();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  const filteredResources = useMemo(() => {
    if (!searchQuery) return resources;
    const query = searchQuery.toLowerCase();
    return resources.filter(resource =>
      resource.name.toLowerCase().includes(query) ||
      resource.description.toLowerCase().includes(query) ||
      resource.category.name.toLowerCase().includes(query)
    );
  }, [resources, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const params = new URLSearchParams(searchParams.toString());
    if (query) params.set('search', query); else params.delete('search');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category) params.set('category', category); else params.delete('category');
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (sort) params.set('sort', sort); else params.delete('sort');
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pb-20">
      
      {/* SECTION 1: THE GOOGLE-STYLE SEARCH HERO */}
      <div className="pt-20 pb-12 px-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-6">
            <GraduationCap size={14} />
            <span>Digital Senior Toolkit</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-8 tracking-tight">
            What are you <span className="text-primary">learning</span> today?
          </h1>

          {/* THE GOOGLE SEARCH BAR */}
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center bg-card border border-border shadow-xl rounded-full px-6 py-4 transition-all duration-300 group-focus-within:border-primary/50 group-focus-within:shadow-primary/10">
              <Search className="text-muted-foreground w-6 h-6 mr-4" />
              <input
                type="text"
                placeholder="Search for roadmaps, tutorials, memory maps..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-transparent text-lg focus:outline-none text-foreground placeholder:text-muted-foreground/60"
              />
              {searchQuery && (
                <button 
                  onClick={() => handleSearch('')}
                  className="ml-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* SECTION 2: THE CONTROL PANEL (Categories & View Mode) */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 border-b border-border pb-8"
        >
          {/* Category Selector */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mr-2">Topics:</div>
            <div className="relative flex-1 md:flex-none">
              <select
                value={currentCategory || ''}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="appearance-none bg-secondary/50 border border-border rounded-xl px-4 py-2 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer w-full md:w-48"
              >
                <option value="">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
            <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mr-2">Sort By:</div>
            <div className="relative flex-1 md:flex-none">
              <select
                value={currentSort || 'latest'}
                onChange={(e) => handleSortChange(e.target.value)}
                className="appearance-none bg-secondary/50 border border-border rounded-xl px-4 py-2 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer w-full md:w-48"
              >
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
                <option value="popular">Popular</option>
                <option value="a-z">A to Z</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* SECTION 3: THE RESULTS AREA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredResources.map(resource => (
            <ResourceCard key={resource.id} resource={resource} viewMode="grid" />
          ))}
        </div>

        {/* Empty State */}
        {filteredResources.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-32"
          >
            <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-muted-foreground/40" />
            </div>
            <h3 className="text-2xl font-bold mb-2">No resources found</h3>
            <p className="text-muted-foreground mb-6">Try a different keyword or category</p>
            <button
              onClick={() => { setSearchQuery(''); handleCategoryChange(''); }}
              className="text-primary font-bold hover:underline"
            >
              Reset everything
            </button>
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-20">
            <div className="flex gap-2 p-2 bg-card border border-border rounded-2xl">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-10 h-10 rounded-xl font-bold transition-all ${
                    page === currentPage
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResourceList(props: ResourceListProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium animate-pulse">Consulting your digital senior...</p>
        </div>
      </div>
    }>
      <ResourceListContent {...props} />
    </Suspense>
  );
}