// src/app/roadmaps/[slug]/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function RoadmapDetailLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header Skeleton */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-10 w-2/3 mx-auto rounded-lg mb-4" />
        <Skeleton className="h-5 w-1/2 mx-auto rounded mb-2" />
        <Skeleton className="h-5 w-1/3 mx-auto rounded" />
        
        {/* Prerequisites */}
        <div className="flex justify-center gap-2 mt-4">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
        
        {/* Button */}
        <div className="mt-6">
          <Skeleton className="h-10 w-44 mx-auto rounded-xl" />
        </div>
      </div>

      {/* Senior Insight Skeleton */}
      <div className="p-5 bg-amber-500/5 border border-amber-500/15 rounded-2xl mb-10 flex gap-3">
        <Skeleton className="w-5 h-5 rounded-full shrink-0" />
        <div className="space-y-2 w-full">
          <Skeleton className="h-4 w-28 rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-5/6 rounded" />
        </div>
      </div>

      {/* RoadmapTree Skeleton */}
      <div className="relative w-full py-8 md:py-12">
        {/* Pulsing Vertical Line */}
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-border/60 -translate-x-1/2 animate-pulse" />

        <div className="space-y-8 md:space-y-12">
          {[...Array(5)].map((_, index) => {
            const isEven = index % 2 === 0;
            return (
              <div key={index} className="relative w-full min-h-[90px]">
                {/* Marker Skeleton */}
                <div className="absolute left-4 md:left-1/2 top-5 w-8 h-8 rounded-full bg-muted border-2 border-border/60 -translate-x-1/2 z-10 animate-pulse flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                </div>

                {/* Card Skeleton Wrapper */}
                <div
                  className={`w-full md:w-1/2
                    ${isEven
                      ? 'md:mr-auto md:pr-8 md:flex md:justify-end'
                      : 'md:ml-auto md:pl-8 md:flex md:justify-start'
                    }
                    ml-8 md:ml-0
                  `}
                >
                  <div className="w-full max-w-md border border-border/80 bg-card/65 rounded-xl shadow-sm animate-pulse">
                    {/* CardHeader equivalent padding */}
                    <div className="p-4 pb-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-16 rounded-full" />
                        <Skeleton className="h-5 w-24 rounded-full" />
                      </div>
                      <Skeleton className="h-6 w-3/4 rounded" />
                    </div>
                    {/* CardContent equivalent padding */}
                    <div className="p-4 pt-0 space-y-3">
                      <Skeleton className="h-4 w-full rounded" />
                      <Skeleton className="h-4 w-5/6 rounded" />
                      <div className="flex items-center gap-1.5 pt-1">
                        <Skeleton className="h-3 w-3 rounded-full" />
                        <Skeleton className="h-3.5 w-32 rounded" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
