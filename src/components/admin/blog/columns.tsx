// /src/components/admin/blog/columns.tsx

"use client"

import type { Article, ArticleStatus } from "@prisma/client"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type ArticleData = Article & {
  author?: { name?: string | null, email?: string | null } | null
}

const StatusBadge = ({ status }: { status: ArticleStatus }) => {
  const styles: Record<ArticleStatus, string> = {
    PUBLISHED: "bg-green-100 text-green-800",
    DRAFT: "bg-yellow-100 text-yellow-800",
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
      {status}
    </span>
  );
};

const RowActions = ({
  article,
  onEditClick,
  onDeleteSubmit
}: {
  article: ArticleData,
  onEditClick: (article: ArticleData) => void,
  onDeleteSubmit: (id: string) => void
}) => {
  const handleDelete = () => {
    if (!window.confirm("Are you sure you want to delete this article?")) return;
    onDeleteSubmit(article.id);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onEditClick(article)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Article
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleDelete}
          className="text-red-600 focus:bg-red-100 focus:text-red-700"
        >
          <Trash2 className="mr-2 h-4 w-4" /> Delete Article
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const columns = (
  onEditClick: (article: ArticleData) => void,
  onDeleteSubmit: (id: string) => void
): ColumnDef<ArticleData>[] => [
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue("title")}</div>,
  },
  {
    accessorKey: "author",
    header: "Author",
    cell: ({ row }) => <div>{row.original.authorOverride || row.original.author?.name || 'N/A'}</div>,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {new Date(row.getValue("createdAt")).toLocaleDateString()}
      </div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const article = row.original
      return (
        <div className="text-right">
          <RowActions article={article} onEditClick={onEditClick} onDeleteSubmit={onDeleteSubmit}/>
        </div>
      )
    },
  },
]