// /src/app/admin/roadmaps/ViewRoadmapButton.tsx

'use client'

import Link from 'next/link'
import { Eye } from 'lucide-react'

interface ViewRoadmapButtonProps {
  isPublished: boolean
  slug: string
}

export default function ViewRoadmapButton({ isPublished, slug }: ViewRoadmapButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (!isPublished) {
      e.preventDefault()
      alert('This roadmap is not published yet. Please publish it to view the public page.')
    }
  }

  if (isPublished) {
    return (
      <Link
        href={`/roadmaps/${slug}`}
        target="_blank"
        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
        title="View Public Page"
      >
        <Eye size={16} />
      </Link>
    )
  }

  return (
    <button
      onClick={handleClick}
      className="p-2 text-gray-400 cursor-not-allowed rounded-md"
      title="Not published - click for details"
    >
      <Eye size={16} />
    </button>
  )
}