// /src/components/blog/BlogFilterControls.tsx

"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const filterOptions = [
  { label: "Latest", value: "latest" },
  { label: "Oldest", value: "oldest" },
];

function BlogFilterControlsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const currentSort = searchParams?.get("sort") || "latest";

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set("sort", value);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center justify-center md:justify-start gap-2 mb-8">
      {filterOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => handleSortChange(option.value)}
          className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
            currentSort === option.value
              ? "bg-primary text-primary-foreground"
              : "bg-muted/50 hover:bg-muted text-muted-foreground"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default function BlogFilterControls() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center md:justify-start gap-2 mb-8">
        <div className="w-20 h-9 bg-muted rounded-full animate-pulse" />
        <div className="w-20 h-9 bg-muted rounded-full animate-pulse" />
      </div>
    }>
      <BlogFilterControlsContent />
    </Suspense>
  );
}