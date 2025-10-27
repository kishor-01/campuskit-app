// /src/hooks/use-safe-search-params.ts

'use client'

import { useSearchParams as useNextSearchParams } from 'next/navigation';
import { useMemo } from 'react';

export function useSafeSearchParams() {
  const searchParams = useNextSearchParams();
  
  return useMemo(() => {
    return {
      get: (key: string) => searchParams?.get(key) || null,
      getAll: (key: string) => searchParams?.getAll(key) || [],
      has: (key: string) => searchParams?.has(key) || false,
      toString: () => searchParams?.toString() || '',
      entries: () => searchParams?.entries() || [][Symbol.iterator](),
      keys: () => searchParams?.keys() || [][Symbol.iterator](),
      values: () => searchParams?.values() || [][Symbol.iterator](),
    };
  }, [searchParams]);
}