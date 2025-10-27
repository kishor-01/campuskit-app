// /src/components/OpportunityList.tsx

'use client'

import { useState, useMemo, Suspense } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSafeSearchParams } from '@/hooks/use-safe-search-params';
import { Opportunity, OpportunityType } from '@prisma/client';
import { Filter, Search } from 'lucide-react';

interface OpportunityListProps {
  opportunities: Opportunity[];
  types: OpportunityType[];
  totalPages: number;
  currentPage: number;
  currentType?: OpportunityType;
}

function OpportunityListContent({
  opportunities,
  types,
  totalPages,
  currentPage,
  currentType,
}: OpportunityListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSafeSearchParams();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  const filteredOpportunities = useMemo(() => {
    if (!searchQuery) return opportunities;
    
    const query = searchQuery.toLowerCase();
    return opportunities.filter(opportunity =>
      opportunity.title.toLowerCase().includes(query) ||
      opportunity.organization.toLowerCase().includes(query) ||
      opportunity.description.toLowerCase().includes(query)
    );
  }, [opportunities, searchQuery]);

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

  const handleTypeChange = (type: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (type) {
      params.set('type', type);
    } else {
      params.delete('type');
    }
    
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const formatOpportunityType = (type: OpportunityType) => {
    return type.toLowerCase().replace('_', ' ');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Opportunities</h1>
          <p className="text-muted-foreground">
            Discover internships, jobs, scholarships, and more
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
                placeholder="Search opportunities..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="flex gap-2">
            <select
              value={currentType || ''}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="px-3 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All Types</option>
              {types.map(type => (
                <option key={type} value={type}>
                  {formatOpportunityType(type)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Opportunities List */}
        <div className="space-y-4">
          {filteredOpportunities.map(opportunity => (
            <div
              key={opportunity.id}
              className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {opportunity.title}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                    <span className="font-medium">{opportunity.organization}</span>
                    <span>•</span>
                    <span className="capitalize">{formatOpportunityType(opportunity.type)}</span>
                    <span>•</span>
                    <span>{opportunity.location}</span>
                  </div>
                  <p className="text-foreground line-clamp-2">
                    {opportunity.description}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <a
                    href={opportunity.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors text-center"
                  >
                    Apply Now
                  </a>
                  {opportunity.startDate && (
                    <span className="text-xs text-muted-foreground text-center">
                      Starts: {new Date(opportunity.startDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredOpportunities.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No opportunities found matching your criteria.</p>
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

export default function OpportunityList(props: OpportunityListProps) {
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
            </div>
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    }>
      <OpportunityListContent {...props} />
    </Suspense>
  );
}