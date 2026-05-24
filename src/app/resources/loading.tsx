import { Skeleton } from "@/components/ui/skeleton";
import { Search, GraduationCap } from "lucide-react";

export default function ResourcesLoading() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pb-20">
      {/* SECTION 1: THE GOOGLE-STYLE SEARCH HERO */}
      <div className="pt-20 pb-12 px-4">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-6">
            <GraduationCap size={14} />
            <span>Digital Senior Toolkit</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-8 tracking-tight">
            What are you <span className="text-primary">learning</span> today?
          </h1>

          {/* THE GOOGLE SEARCH BAR */}
          <div className="relative group">
            <div className="relative flex items-center bg-card border border-border shadow-xl rounded-full px-6 py-4">
              <Search className="text-muted-foreground w-6 h-6 mr-4" />
              <div className="w-full h-[28px]" />
            </div>
          </div>
        </div>

        {/* SECTION 2: THE CONTROL PANEL (Categories & View Mode) */}
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 border-b border-border pb-8">
          {/* Category Selector */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mr-2">Topics:</div>
            <div className="relative flex-1 md:flex-none">
              <div className="bg-secondary/50 border border-border rounded-xl px-4 py-2 pr-10 text-sm font-medium w-full md:w-48 h-[38px] flex items-center text-muted-foreground/60">
                All Categories
              </div>
            </div>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
            <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mr-2">Sort By:</div>
            <div className="relative flex-1 md:flex-none">
              <div className="bg-secondary/50 border border-border rounded-xl px-4 py-2 pr-10 text-sm font-medium w-full md:w-48 h-[38px] flex items-center text-muted-foreground/60">
                Latest
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: THE RESULTS AREA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="relative h-full bg-card border border-border rounded-2xl overflow-hidden flex flex-col shadow-sm dark:shadow-none"
            >
              {/* Image Container */}
              <div className="relative h-40 w-full overflow-hidden shrink-0 bg-muted/40">
                <Skeleton className="w-full h-full rounded-none" />
                
                {/* Category Badge Overlay Skeleton */}
                <div className="absolute top-3 left-3 z-20">
                  <Skeleton className="h-5 w-20 rounded-md" />
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-grow flex flex-col justify-between">
                <div className="flex-grow flex flex-col">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                </div>

                <div className="flex items-center justify-between mt-auto border-t border-border/50 pt-3">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
