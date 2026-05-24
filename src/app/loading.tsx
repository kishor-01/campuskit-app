import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="overflow-x-hidden">
      {/* HERO HEADER SKELETON */}
      <header className="relative py-24 md:py-32 px-4 overflow-hidden bg-background">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
          {/* Left Side - Text Content */}
          <div className="relative z-40 w-full">
            <Skeleton className="h-16 w-full mb-4" />
            <Skeleton className="h-16 w-3/4 mb-6" />
            <div className="space-y-3 mb-8">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            {/* Search Bar */}
            <div className="h-[160px] md:h-[66px] w-full bg-card border border-border rounded-xl shadow-lg flex flex-col md:flex-row items-stretch p-1 gap-2 md:gap-0 overflow-hidden select-none">
              <div className="flex md:border-r border-b md:border-b-0 border-border p-1 w-full md:w-auto shrink-0 gap-2">
                <Skeleton className="flex-1 md:w-24 h-10 rounded-lg" />
                <Skeleton className="flex-1 md:w-24 h-10 rounded-lg" />
              </div>
              <div className="flex-grow flex items-center px-4 py-3">
                <Skeleton className="w-5 h-5 mr-3 shrink-0" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="p-1 w-full md:w-auto flex items-stretch">
                <Skeleton className="w-full md:w-32 h-10 rounded-lg" />
              </div>
            </div>
          </div>

          {/* Right Side - Terminal (Hidden on mobile) */}
          <div className="relative w-full hidden md:flex justify-center lg:justify-end z-10">
            <div className="w-full max-w-lg">
              <Skeleton className="h-80 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </header>

      {/* VALUE PROP SECTION */}
      <section className="py-16 md:py-24 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <Skeleton className="h-5 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-background p-6 rounded-lg border border-border text-center">
                <Skeleton className="h-12 w-12 rounded-full mx-auto mb-4" />
                <Skeleton className="h-6 w-32 mx-auto mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTENT SHELVES */}
      {['Latest Resources', 'Trending Opportunities', 'Featured Roadmaps', 'Latest Articles'].map((title) => {
        const hasCategory = title === 'Latest Resources' || title === 'Trending Opportunities';
        return (
          <section key={title} className="py-12 md:py-16 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-5 w-24" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-card rounded-xl border border-border overflow-hidden h-full flex flex-col">
                    <div className="relative aspect-video bg-muted shrink-0">
                      <Skeleton className="w-full h-full rounded-none" />
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                      {hasCategory && <Skeleton className="h-4 w-20 mb-2" />}
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* TESTIMONIALS SECTION */}
      <section className="py-16 md:py-24 bg-background px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-64 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-4 mb-4">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}