// /src/components/admin/SortControl.tsx

'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

type SortOption = {
  label: string
  value: string
}

type SortControlProps = {
  options: SortOption[]
}

export default function SortControl({ options }: SortControlProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentSort = searchParams.get('sort') || options[0]?.value

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value
    const params = new URLSearchParams(searchParams)
    params.set('sort', newSort)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-control" className="text-sm font-medium text-muted-foreground">
        Sort by:
      </label>
      <select
        id="sort-control"
        value={currentSort}
        onChange={handleChange}
        className="p-2 bg-input rounded-md text-sm"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}