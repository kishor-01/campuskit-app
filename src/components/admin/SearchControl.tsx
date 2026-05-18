// /src/components/admin/SearchControl.tsx

'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce';

export default function SearchControl({ placeholder = "Search...", paramName = "q" }: { placeholder?: string; paramName?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set(paramName, term)
    } else {
      params.delete(paramName)
    }
    router.replace(`${pathname}?${params.toString()}`)
  }, 300);

  return (
    <div className="relative">
      <input
        type="text"
        placeholder={placeholder}
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get(paramName)?.toString()}
        className="p-2 pl-8 bg-input rounded-md text-sm w-64"
      />
    </div>
  )
}