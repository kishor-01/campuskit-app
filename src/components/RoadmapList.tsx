'use client';

import { useState, useMemo, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Map, Search, ChevronDown, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RoadmapCard, { RoadmapCardProps } from './RoadmapCard';
import { DifficultyTier } from '@prisma/client';

interface RoadmapListProps {
  roadmaps: RoadmapCardProps['roadmap'][];
  totalPages: number;
  currentPage: number;
  currentTier?: DifficultyTier;
}

function useSafeSearchParams() {
  const searchParams = useSearchParams();
  return searchParams || new URLSearchParams();
}

type SortOption = 'latest' | 'oldest' | 'a-z' | 'difficulty';

const difficultyFilters = [
  { value: '', label: 'All Levels' },
  { value: 'BEGINNER', label: '🌱 Beginner' },
  { value: 'INTERMEDIATE', label: '⚡ Intermediate' },
  { value: 'SENIOR', label: '🛡️ Senior' },
];

const difficultyOrder: Record<string, number> = {
  BEGINNER: 0,
  INTERMEDIATE: 1,
  SENIOR: 2,
};

function RoadmapListContent({
  roadmaps,
  totalPages,
  currentPage,
  currentTier,
}: RoadmapListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSafeSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState<SortOption>('latest');

  const isActiveSearch = searchQuery.length > 0 || !!currentTier;

  const filteredAndSortedRoadmaps = useMemo(() => {
    let filtered = roadmaps;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = roadmaps.filter(roadmap =>
        roadmap.title.toLowerCase().includes(query) ||
        roadmap.description.toLowerCase().includes(query)
      );
    }

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          // We don't have createdAt in the current projection, fallback to id for stable sort if needed, 
          // or assume they are pre-sorted by latest by the server. 
          // We'll just reverse the server order for oldest if createdAt is not available.
          return a.id.localeCompare(b.id);
        case 'a-z':
          return a.title.localeCompare(b.title);
        case 'difficulty':
          return (difficultyOrder[a.difficultyTier] ?? 3) - (difficultyOrder[b.difficultyTier] ?? 3);
        case 'latest':
        default:
          return b.id.localeCompare(a.id); // Simple fallback for latest since they usually have sequential CUIDs/UUIDs based on time
      }
    });
  }, [roadmaps, searchQuery, sortBy]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const params = new URLSearchParams(searchParams.toString());

    if (query) {
      params.set('search', query);
    } else {
      params.delete('search');
    }

    // Reset to page 1 on new search
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

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Dynamic Hero Search Section */}
      <motion.div
        layout
        className="bg-card border-b border-border relative overflow-hidden"
        animate={{
          paddingBottom: isActiveSearch ? "2rem" : "5rem",
          paddingTop: isActiveSearch ? "2rem" : "5rem"
        }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
          <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[150%] bg-gradient-to-l from-primary/30 to-transparent blur-3xl rounded-full transform rotate-12" />
          <div className="absolute -bottom-[50%] -left-[10%] w-[60%] h-[150%] bg-gradient-to-r from-primary/20 to-transparent blur-3xl rounded-full transform -rotate-12" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <AnimatePresence mode="wait">
            {!isActiveSearch && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                transition={{ duration: 0.3 }}
                className="mb-8"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
                  <Map size={16} /> Learning Architecture
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-4">
                  Skill Tree <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">Roadmaps</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                  Navigate branching learning paths designed by seniors. Choose your specialization and master skills systematically.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Huge Search Bar */}
          <motion.div layout className="max-w-3xl mx-auto relative group mt-4">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/40 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-background rounded-full border-2 border-border focus-within:border-primary focus-within:shadow-md shadow-sm overflow-hidden flex items-center px-4 transition-all">
              <Search className="text-muted-foreground w-6 h-6 ml-2" />
              <input
                type="text"
                placeholder="Search by title, technology, or description..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-transparent border-none px-4 py-4 text-lg focus:outline-none focus:ring-0 text-foreground placeholder:text-muted-foreground/60"
              />
            </div>
          </motion.div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Filtering & Sorting Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          
          {/* Difficulty Filter Chips */}
          <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar scroll-smooth flex-grow">
            {difficultyFilters.map(filter => (
              <button
                key={filter.value}
                onClick={() => handleTierChange(filter.value)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  (currentTier || '') === filter.value
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {filter.label}
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
                <option value="difficulty">Difficulty</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Roadmaps Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredAndSortedRoadmaps.map((roadmap) => (
              <motion.div
                key={roadmap.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <RoadmapCard roadmap={roadmap} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredAndSortedRoadmaps.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-muted/30 rounded-3xl mt-8 border border-border border-dashed"
          >
            <Rocket className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">No roadmaps found</h3>
            <p className="text-muted-foreground text-sm">Try adjusting your search or difficulty filter.</p>
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

export default function RoadmapList(props: RoadmapListProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <div className="h-64 bg-card border-b border-border animate-pulse" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-3 mb-8 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 w-24 bg-muted rounded-full animate-pulse shrink-0" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-[280px] bg-muted rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    }>
      <RoadmapListContent {...props} />
    </Suspense>
  );
}
