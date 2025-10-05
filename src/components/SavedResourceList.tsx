// src/components/SavedResourceList.tsx

"use client";

import { useState, useMemo } from "react";
import type { Prisma } from "@prisma/client";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, List, ArrowRight, Bookmark } from "lucide-react";
import ResourceCard from "@/components/ResourceCard";
import Link from "next/link";

// Define the types for our props
type ResourceWithDetails = Prisma.ResourceGetPayload<{
  include: { category: true };
}> & { isInitiallySaved: boolean; savedAt: Date };

export default function SavedResourceList({ resources }: { resources: ResourceWithDetails[] }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("savedAt_desc"); // 'savedAt_desc', 'name_asc'
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'

  const categories = ["All", ...Array.from(new Set(resources.map(r => r.category.name)))];

  const sortedAndFilteredResources = useMemo(() => {
    let result = [...resources];

    if (selectedCategory !== "All") {
      result = result.filter(r => r.category.name === selectedCategory);
    }

    result.sort((a, b) => {
      if (sortBy === 'name_asc') {
        return a.name.localeCompare(b.name);
      }
      // Default to 'savedAt_desc'
      return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
    });

    return result;
  }, [resources, selectedCategory, sortBy]);

  // Handle the "empty state"
  if (resources.length === 0) {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6 mx-auto">
                <Bookmark className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Your Bookshelf is Empty</h1>
            <p className="text-lg text-muted-foreground mt-2 mb-6">
                You haven't saved any resources yet. Start exploring to build your personal library.
            </p>
            <Link href="/resources" className="inline-flex items-center bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-lg text-base hover:bg-primary/90 transition-colors">
                Explore Resources <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-extrabold text-foreground text-center mb-4">My Bookshelf</h1>
      <p className="text-lg text-muted-foreground text-center mb-12">Your personal collection of saved resources.</p>
      
      {/* Control Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 p-4 bg-muted/50 rounded-lg">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold mr-2">Filter by:</span>
            {categories.map((category) => (
              <button key={category} onClick={() => setSelectedCategory(category)} className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${selectedCategory === category ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}>
                {category}
              </button>
            ))}
        </div>
        
        {/* Sort and View Controls */}
        <div className="flex items-center gap-4">
            <select onChange={(e) => setSortBy(e.target.value)} value={sortBy} className="bg-background border border-muted rounded-md px-3 py-1.5 text-sm">
                <option value="savedAt_desc">Sort by Date (Newest)</option>
                <option value="name_asc">Sort by Name (A-Z)</option>
            </select>
            <div className="flex items-center bg-background rounded-md border border-muted p-0.5">
                <button onClick={() => setViewMode('grid')} className={`p-1 rounded ${viewMode === 'grid' ? 'bg-muted' : ''}`}><LayoutGrid className="w-5 h-5"/></button>
                <button onClick={() => setViewMode('list')} className={`p-1 rounded ${viewMode === 'list' ? 'bg-muted' : ''}`}><List className="w-5 h-5"/></button>
            </div>
        </div>
      </div>

      {/* Animated Resource Display */}
      <motion.div 
        layout 
        className={`grid gap-8 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}
      >
        <AnimatePresence>
          {sortedAndFilteredResources.map((resource) => (
            <motion.div layout="position" key={resource.id}>
              <ResourceCard
                resource={resource}
                isInitiallySaved={resource.isInitiallySaved}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}