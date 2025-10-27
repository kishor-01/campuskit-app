// /src/components/blog/PaginationControls.tsx

'use client'

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Suspense } from 'react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

function PaginationControlsContent({ currentPage, totalPages, baseUrl }: PaginationControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('page', String(newPage));
    router.push(`${baseUrl}?${params.toString()}`);
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-4 mt-12">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-card border border-border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={16} />
        Previous
      </button>

      <span className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-card border border-border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

export default function PaginationControls(props: PaginationControlsProps) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center gap-4 mt-12">
        <div className="w-20 h-9 bg-muted rounded-md animate-pulse" />
        <div className="w-24 h-9 bg-muted rounded-md animate-pulse" />
        <div className="w-20 h-9 bg-muted rounded-md animate-pulse" />
      </div>
    }>
      <PaginationControlsContent {...props} />
    </Suspense>
  );
}