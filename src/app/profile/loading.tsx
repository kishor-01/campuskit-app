import { Skeleton } from "@/components/ui/skeleton";
import { Target, Settings } from "lucide-react";

export default function ProfileLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title Header - EXACT STATIC MATCH */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Your Digital Desk
        </h1>
        {/* Role Badge Skeleton */}
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      <div className="space-y-6">
        {/* --- Top Row: Profile & Goals --- */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Column: Passport, StatsRow, Heatmap */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            
            {/* Passport Card Skeleton */}
            <div className="relative bg-gradient-to-br from-card to-card/80 border border-border rounded-xl p-6 flex flex-col items-center text-center shadow-lg h-full">
              {/* Avatar circle */}
              <Skeleton className="w-24 h-24 rounded-full mb-4 border-2 border-primary/20" />
              {/* Name */}
              <Skeleton className="h-8 w-36 mb-1" />
              {/* Developer Title */}
              <Skeleton className="h-5 w-28 mb-2" />
              {/* Role Badge */}
              <Skeleton className="h-6 w-24 rounded-full mb-3" />
              {/* Education */}
              <Skeleton className="h-5 w-32 rounded-full mb-4" />
              {/* Social Links */}
              <div className="flex gap-3 mb-4">
                <Skeleton className="w-5 h-5 rounded-full" />
                <Skeleton className="w-5 h-5 rounded-full" />
              </div>
              {/* Badges Section */}
              <div className="flex gap-2 mb-4 justify-center">
                <Skeleton className="w-10 h-10 rounded-full" />
                <Skeleton className="w-10 h-10 rounded-full" />
                <Skeleton className="w-10 h-10 rounded-full" />
              </div>
              {/* Saved & Contributed count stats */}
              <div className="grid grid-cols-2 gap-4 w-full mt-2 border-t border-border/50 pt-4">
                <div>
                  <Skeleton className="h-6 w-10 mx-auto mb-1" />
                  <Skeleton className="h-3 w-12 mx-auto" />
                </div>
                <div>
                  <Skeleton className="h-6 w-10 mx-auto mb-1" />
                  <Skeleton className="h-3 w-12 mx-auto" />
                </div>
              </div>
              {/* Member Since */}
              <Skeleton className="h-3 w-32 mt-4 mx-auto" />
            </div>

            {/* Stats Row Skeleton */}
            <div className="bg-gradient-to-br from-card to-card/95 border border-border rounded-xl p-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 md:divide-x md:divide-border/40">
                <div className="flex flex-col items-center justify-center text-center p-2">
                  <div className="flex items-center justify-center gap-2.5 mb-2">
                    <Skeleton className="h-10 w-12" />
                    <Skeleton className="h-7 w-7 rounded-full" />
                  </div>
                  <Skeleton className="h-3.5 w-20" />
                </div>
                <div className="flex flex-col items-center justify-center text-center p-2">
                  <div className="flex items-center justify-center gap-2.5 mb-2">
                    <Skeleton className="h-10 w-12" />
                    <Skeleton className="h-7 w-7 rounded-full" />
                  </div>
                  <Skeleton className="h-3.5 w-20" />
                </div>
                <div className="flex flex-col items-center justify-center text-center p-2">
                  <div className="flex items-center justify-center gap-2.5 mb-2">
                    <Skeleton className="h-10 w-12" />
                    <Skeleton className="h-7 w-7 rounded-full" />
                  </div>
                  <Skeleton className="h-3.5 w-20" />
                </div>
              </div>
            </div>

            {/* Heatmap Activity Skeleton */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground">Contribution Activity</h3>
                <span className="text-xs text-muted-foreground">Last 30 Days</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[...Array(30)].map((_, i) => (
                  <Skeleton key={i} className="w-4 h-4 rounded-sm" />
                ))}
              </div>
              <div className="mt-4 flex items-center justify-end gap-2">
                <Skeleton className="h-3 w-16" />
              </div>
            </div>

          </div>

          {/* Right Column: Goal Architect Widget */}
          <div className="lg:col-span-3">
            <div className="bg-card border border-border rounded-xl p-6 h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Target size={20} className="text-primary" />
                  Goal Architect
                </h3>
                <span className="text-sm font-semibold text-primary/50">View All</span>
              </div>
              
              <div className="space-y-4 flex-grow">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-3 rounded-md">
                    <div className="flex justify-between items-center mb-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3.5 w-8" />
                    </div>
                    <Skeleton className="h-1.5 w-full rounded-full" />
                    <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                      <Skeleton className="h-3.5 w-24" />
                      <Skeleton className="h-3.5 w-20" />
                    </div>
                  </div>
                ))}
              </div>

              <Skeleton className="mt-4 w-full h-10 rounded-lg animate-pulse" />
            </div>
          </div>

        </div>

        {/* --- Middle Row: Resource Stack Skeleton --- */}
        <div className="h-full bg-card border border-border rounded-xl p-6 relative flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-4">My Stack</h3>
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="block p-3 bg-background border border-border rounded-md h-[74px] flex flex-col justify-between">
                  <Skeleton className="h-3.5 w-12 rounded-full" />
                  <Skeleton className="h-4 w-5/6 mt-2" />
                </div>
              ))}
            </div>
          </div>
          <Skeleton className="mt-4 h-4 w-24 animate-pulse" />
        </div>

        {/* --- Bottom Row: Contribution & Settings Skeletons --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ContributionWidget Skeleton */}
          <div className="bg-card border border-border rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Skeleton className="w-6 h-6 rounded" />
              </div>
              <div className="space-y-2 flex-grow">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <Skeleton className="h-10 w-full md:w-36 rounded-lg flex-shrink-0" />
          </div>

          {/* SettingsWidget Skeleton */}
          <div className="bg-card border border-border rounded-xl p-6 h-full flex flex-col justify-between">
            <div className="space-y-4 w-full">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Settings size={20} className="text-primary"/>
                Settings & Actions
              </h3>
              
              {/* Theme Toggle placeholder */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-6 w-10 rounded-full" />
              </div>

              {/* Account Management list */}
              <div className="pt-2 border-t border-border space-y-2">
                <div className="flex items-center p-3">
                  <Skeleton className="w-4 h-4 mr-2 rounded" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex items-center p-3">
                  <Skeleton className="w-4 h-4 mr-2 rounded" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>
            
            <Skeleton className="w-full mt-4 h-10 rounded-lg animate-pulse" />
          </div>
        </div>

      </div>
    </div>
  );
}
