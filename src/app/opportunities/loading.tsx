import { Skeleton } from "@/components/ui/skeleton";
import { Search, Trophy } from "lucide-react";

export default function OpportunitiesLoading() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Dynamic Hero Search Section - EXACT STATIC MATCH */}
      <div className="bg-card border-b border-border/40 relative overflow-hidden pt-24 pb-12 md:pt-20 md:pb-12 px-4">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
          <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[150%] bg-gradient-to-l from-primary/30 to-transparent blur-3xl rounded-full transform rotate-12" />
          <div className="absolute -bottom-[50%] -left-[10%] w-[60%] h-[150%] bg-gradient-to-r from-primary/20 to-transparent blur-3xl rounded-full transform -rotate-12" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
              <Trophy size={14} /> Competitive Intelligence Hub
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-3">
              Find your next <span className="text-primary">big opportunity.</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
              Tier-1 global programs, elite internships, and exclusive deals — curated and ranked by career impact.
            </p>
          </div>

          {/* Huge Search Bar Skeleton */}
          <div className="max-w-3xl mx-auto relative mt-4">
            <div className="relative bg-background rounded-full border-2 border-border flex items-center px-4">
              <Search className="text-muted-foreground w-6 h-6 ml-2" />
              <div className="w-full bg-transparent px-4 py-4 text-lg select-none">&nbsp;</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tier filter skeleton row */}
        <div className="flex gap-2 mb-4 overflow-hidden">
          <Skeleton className="h-10 w-24 rounded-full" />
          <Skeleton className="h-10 w-24 rounded-full" />
          <Skeleton className="h-10 w-24 rounded-full" />
          <Skeleton className="h-10 w-24 rounded-full" />
        </div>

        {/* Filtering & Sorting Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex gap-2 overflow-hidden flex-grow">
            <Skeleton className="h-10 w-24 rounded-full" />
            <Skeleton className="h-10 w-32 rounded-full" />
            <Skeleton className="h-10 w-28 rounded-full" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-10 w-32 rounded-full" />
          </div>
        </div>

        {/* Opportunities Grid Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="relative bg-card border border-border/40 rounded-2xl overflow-hidden flex flex-col shadow-sm dark:shadow-none h-full"
            >
              {/* Top Accent Bar */}
              <div className="h-1 w-full bg-primary/20" />

              <div className="p-5 flex flex-col h-full mt-4">
                {/* Header skeleton */}
                <div className="flex items-center justify-between mb-3 gap-2">
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-20 rounded-md" />
                    <Skeleton className="h-6 w-24 rounded-md" />
                  </div>
                </div>

                {/* Organization title skeleton */}
                <div className="flex items-center gap-1.5 mb-2">
                  <Skeleton className="h-3 w-3 rounded" />
                  <Skeleton className="h-4 w-28" />
                </div>

                {/* Title and description skeleton */}
                <div className="flex-grow">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-3" />
                </div>

                {/* Skill tags skeleton */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <Skeleton className="h-5 w-14 rounded-md" />
                  <Skeleton className="h-5 w-16 rounded-md" />
                  <Skeleton className="h-5 w-12 rounded-md" />
                </div>

                {/* Metadata rows skeleton */}
                <div className="flex items-center flex-wrap gap-x-4 gap-y-1 border-t border-border pt-3 mb-4">
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>

                {/* Action button skeleton */}
                <Skeleton className="w-full h-10 rounded-xl mt-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
