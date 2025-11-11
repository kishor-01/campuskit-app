// /src/components/ResourceList.tsx

'use client'

import { useState, useMemo, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import ResourceCard from './ResourceCard';
import { Category, Resource } from '@prisma/client';
import { Filter, Search, Grid, List } from 'lucide-react';

// Define the interface that matches what we pass from the server
export interface ResourceWithSaveStatus extends Resource {
  category: Category;
  isInitiallySaved: boolean;
}

interface ResourceListProps {
  resources: ResourceWithSaveStatus[];
  categories: Category[];
  totalPages: number;
  currentPage: number;
  currentCategory?: string;
}

// Custom hook to safely use search params
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
}: ResourceListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSafeSearchParams();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [savedResources, setSavedResources] = useState<Set<string>>(
    new Set(resources.filter(r => r.isInitiallySaved).map(r => r.id))
  );

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
    
    if (query) {
      params.set('search', query);
    } else {
      params.delete('search');
    }
    
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const toggleSave = async (resourceId: string) => {
    try {
      const response = await fetch('/api/resources/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceId }),
      });

      if (response.ok) {
        setSavedResources(prev => {
          const newSet = new Set(prev);
          if (newSet.has(resourceId)) {
            newSet.delete(resourceId);
          } else {
            newSet.add(resourceId);
          }
          return newSet;
        });
      }
    } catch (error) {
      console.error('Failed to toggle save:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Learning Resources</h1>
          <p className="text-muted-foreground">
            Discover curated learning materials to help you achieve your goals
          </p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2">
            <select
              value={currentCategory || ''}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="px-3 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* View Toggle */}
            <div className="flex bg-card border border-border rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1 rounded ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Resources Grid/List */}
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            : "space-y-6"
        }>
          {filteredResources.map(resource => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              isSaved={savedResources.has(resource.id)}
              onToggleSave={() => toggleSave(resource.id)}
              viewMode={viewMode}
            />
          ))}
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No resources found matching your criteria.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 rounded-lg ${
                    page === currentPage
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border border-border text-foreground hover:bg-muted'
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
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
            <div className="flex gap-4 mb-8">
              <div className="h-10 bg-muted rounded flex-1"></div>
              <div className="h-10 bg-muted rounded w-32"></div>
              <div className="h-10 bg-muted rounded w-20"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    }>
      <ResourceListContent {...props} />
    </Suspense>
  );
}