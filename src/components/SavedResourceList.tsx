// /src/components/SavedResourceList.tsx

'use client'

import { useState, useMemo, Suspense } from 'react';
import { useSafeSearchParams } from '@/hooks/use-safe-search-params';
import ResourceCard from './ResourceCard';
import { Category, Resource } from '@prisma/client';
import { Search, Grid, List } from 'lucide-react';

interface ResourceWithSaveStatus extends Resource {
  category: Category;
  isInitiallySaved: boolean;
  savedAt?: Date;
}

interface SavedResourceListProps {
  resources: ResourceWithSaveStatus[];
}

function SavedResourceListContent({ resources }: SavedResourceListProps) {
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
          <h1 className="text-3xl font-bold text-foreground mb-2">My Saved Resources</h1>
          <p className="text-muted-foreground">
            Your personal collection of learning materials
          </p>
        </div>

        {/* Search and View Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search saved resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

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

        {/* Resources Grid/List */}
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        }>
          {filteredResources.map(resource => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              isSaved={savedResources.has(resource.id)}
              onToggleSave={() => toggleSave(resource.id)}
              viewMode={viewMode}
              showSavedDate={true}
              savedAt={resource.savedAt}
            />
          ))}
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            {resources.length === 0 ? (
              <>
                <p className="text-muted-foreground mb-4">You haven't saved any resources yet.</p>
                <p className="text-sm text-muted-foreground">
                  Browse the <a href="/resources" className="text-primary hover:underline">resources page</a> to find learning materials to save.
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">No saved resources found matching your search.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SavedResourceList(props: SavedResourceListProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
            <div className="flex gap-4 mb-8">
              <div className="h-10 bg-muted rounded flex-1"></div>
              <div className="h-10 bg-muted rounded w-20"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    }>
      <SavedResourceListContent {...props} />
    </Suspense>
  );
}