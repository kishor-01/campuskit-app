import { Skeleton } from "@/components/ui/skeleton";

export default function BlogLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 md:pt-20 md:pb-8">
      {/* Static Hero/Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-3">
          Seniofy Blog
        </h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
          Guides, tips, and insights to help you thrive in your student journey.
        </p>
      </div>

      {/* Featured Article Card Skeleton */}
      <div className="mb-12">
        <div className="relative w-full h-[400px] rounded-lg overflow-hidden shadow-lg bg-muted">
          <Skeleton className="w-full h-full rounded-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-8">
            <Skeleton className="h-5 w-24 rounded-full mb-4 bg-white/20 animate-pulse" />
            <Skeleton className="h-9 w-3/4 mb-3 bg-white/20 animate-pulse" />
            <Skeleton className="h-4 w-1/2 bg-white/20 animate-pulse" />
          </div>
        </div>
      </div>

      {/* BlogFilterControls Skeletons */}
      <div className="flex items-center justify-center md:justify-start gap-2 mb-8">
        <Skeleton className="w-20 h-9 rounded-full" />
        <Skeleton className="w-20 h-9 rounded-full" />
      </div>

      {/* Article Cards Grid Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-full">
            <div className="bg-card border border-border rounded-lg overflow-hidden h-full flex flex-col shadow-sm">
              <div className="relative aspect-video bg-muted shrink-0">
                <Skeleton className="w-full h-full rounded-none" />
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2 flex-grow" />
                <div className="mt-4 pt-2">
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
