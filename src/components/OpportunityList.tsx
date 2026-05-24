// src/components/OpportunityList.tsx

'use client'

import { useState, useMemo, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import OpportunityCard from './OpportunityCard';
import { Opportunity, OpportunityType, OpportunityTier } from '@prisma/client';
import { Search, Briefcase, ChevronDown, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OpportunityListProps {
  opportunities: Opportunity[];
  types: OpportunityType[];
  totalPages: number;
  currentPage: number;
  currentType?: OpportunityType;
  currentTier?: OpportunityTier;
}

function useSafeSearchParams() {
  const searchParams = useSearchParams();
  return searchParams || new URLSearchParams();
}

type SortOption = 'latest' | 'oldest' | 'a-z' | 'tier';

const tierFilters = [
  { value: '', label: 'All Tiers' },
  { value: 'TIER_1', label: '🥇 Tier 1', emoji: '🥇' },
  { value: 'TIER_2', label: '🥈 Tier 2', emoji: '🥈' },
  { value: 'TIER_3', label: '🥉 Tier 3', emoji: '🥉' },
];

const tierOrder: Record<string, number> = {
  TIER_1: 0,
  TIER_2: 1,
  TIER_3: 2,
};

function OpportunityListContent({
  opportunities,
  types,
  totalPages,
  currentPage,
  currentType,
  currentTier,
}: OpportunityListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSafeSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState<SortOption>('latest');

  const isActiveSearch = searchQuery.length > 0 || !!currentType || !!currentTier;

  const filteredAndSortedOpportunities = useMemo(() => {
    let filtered = opportunities;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = opportunities.filter(opportunity =>
        opportunity.title.toLowerCase().includes(query) ||
        opportunity.organization.toLowerCase().includes(query) ||
        opportunity.description.toLowerCase().includes(query) ||
        opportunity.skillsRequired?.some(s => s.toLowerCase().includes(query))
      );
    }

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'a-z':
          return a.title.localeCompare(b.title);
        case 'tier':
          return (tierOrder[a.tier] ?? 3) - (tierOrder[b.tier] ?? 3);
        case 'latest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [opportunities, searchQuery, sortBy]);

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

  const handleTierChange = (tier: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (tier) {
      params.set('tier', tier);
    } else {
      params.delete('tier');
    }

    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const formatOpportunityType = (type: string) => {
    return type.toLowerCase().replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Dynamic Hero Search Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-card border-b border-border/40 relative overflow-hidden pt-24 pb-12 md:pt-20 md:pb-12 px-4"
      >
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
          <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[150%] bg-gradient-to-l from-primary/30 to-transparent blur-3xl rounded-full transform rotate-12" />
          <div className="absolute -bottom-[50%] -left-[10%] w-[60%] h-[150%] bg-gradient-to-r from-primary/20 to-transparent blur-3xl rounded-full transform -rotate-12" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
              <Trophy size={14} /> Competitive Intelligence Hub
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-3">
              Find your next <span className="text-primary">big opportunity.</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
              Tier-1 global programs, elite internships, and exclusive deals — curated and ranked by career impact.
            </p>
          </motion.div>

          {/* Google-style Huge Search Bar */}
          <div className="max-w-3xl mx-auto relative group mt-4">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/40 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-background rounded-full border-2 border-border focus-within:border-primary focus-within:shadow-md shadow-sm overflow-hidden flex items-center px-4 transition-all">
              <Search className="text-muted-foreground w-6 h-6 ml-2" />
              <input
                type="text"
                placeholder="Search opportunities, companies, skills..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-transparent border-none px-4 py-4 text-lg focus:outline-none focus:ring-0 text-foreground placeholder:text-muted-foreground/60"
              />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Tier Filter Row */}
        <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar scroll-smooth mb-4">
          {tierFilters.map(tf => (
            <button
              key={tf.value}
              onClick={() => handleTierChange(tf.value)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                (currentTier || '') === tf.value
                  ? tf.value === 'TIER_1'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-white shadow-md shadow-amber-500/20'
                    : tf.value === 'TIER_2'
                      ? 'bg-gradient-to-r from-slate-400 to-slate-300 text-slate-800 shadow-md'
                      : 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* Filtering & Sorting Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          {/* Type Chips */}
          <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar scroll-smooth flex-grow">
            <button
              onClick={() => handleTypeChange('')}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !currentType
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              All Types
            </button>
            {types.map(type => (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  currentType === type
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {formatOpportunityType(type)}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm text-muted-foreground font-medium">Sort by:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none bg-card border border-border text-foreground text-sm font-medium rounded-full px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer"
              >
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
                <option value="a-z">A - Z</option>
                <option value="tier">By Tier</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Opportunities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedOpportunities.map((opportunity) => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} />
          ))}
        </div>

        {filteredAndSortedOpportunities.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-muted/30 rounded-3xl mt-8 border border-border border-dashed"
          >
            <Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">No opportunities found</h3>
            <p className="text-muted-foreground text-sm">Try adjusting your search, type, or tier filter.</p>
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <div className="flex gap-2 bg-card p-1.5 rounded-full border border-border shadow-sm">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all ${
                    page === currentPage
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

export default function OpportunityList(props: OpportunityListProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <div className="h-64 bg-card border-b border-border animate-pulse" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-3 mb-8 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 w-24 bg-muted rounded-full animate-pulse shrink-0" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-[380px] bg-muted rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    }>
      <OpportunityListContent {...props} />
    </Suspense>
  );
}