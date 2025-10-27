// /src/components/admin/resources/columns.tsx

"use client"

import { Resource, Category, ResourceStatus } from "@prisma/client"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Check, X, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "react-hot-toast"
import { updateResourceStatus } from "@/actions"
import { useState, useTransition } from "react"

export type ResourceData = Resource & { category: Category }

const StatusBadge = ({ status }: { status: ResourceStatus }) => {
  const styles: Record<ResourceStatus, string> = {
    APPROVED: "bg-green-100 text-green-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    REJECTED: "bg-red-100 text-red-800",
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
      {status}
    </span>
  );
};

const RowActions = ({
  resource,
  onEditClick,
  onDeleteSubmit
}: {
  resource: ResourceData,
  onEditClick: (resource: ResourceData) => void,
  onDeleteSubmit: (id: string) => void
}) => {
  const [isStatusPending, startStatusTransition] = useTransition();

  const handleStatusUpdate = (newStatus: ResourceStatus) => {
    startStatusTransition(async () => {
      const result = await updateResourceStatus(resource.id, newStatus);
      if (result?.message) {
        toast.success(result.message);
      } else if (result?.error) {
        toast.error(typeof result.error === 'string' ? result.error : "Failed to update status.");
      }
    });
  };

  const handleDelete = () => {
    if (!window.confirm("Are you sure you want to delete this resource?")) return;
    onDeleteSubmit(resource.id);
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
        <DropdownMenuItem onClick={() => onEditClick(resource)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Resource
        </DropdownMenuItem>
        {resource.status !== ResourceStatus.APPROVED && (
          <DropdownMenuItem
            disabled={isStatusPending}
            onClick={() => handleStatusUpdate(ResourceStatus.APPROVED)}
            className="text-green-600 focus:bg-green-100 focus:text-green-700"
          >
            <Check className="mr-2 h-4 w-4" /> Approve
          </DropdownMenuItem>
        )}
        {resource.status !== ResourceStatus.PENDING && (
          <DropdownMenuItem
            disabled={isStatusPending}
            onClick={() => handleStatusUpdate(ResourceStatus.PENDING)}
            className="text-yellow-600 focus:bg-yellow-100 focus:text-yellow-700"
          >
            <X className="mr-2 h-4 w-4" /> Move to Pending
          </DropdownMenuItem>
        )}
        {resource.status !== ResourceStatus.REJECTED && (
          <DropdownMenuItem
            disabled={isStatusPending}
            onClick={() => handleStatusUpdate(ResourceStatus.REJECTED)}
            className="text-red-600 focus:bg-red-100 focus:text-red-700"
          >
            <X className="mr-2 h-4 w-4" /> Reject
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleDelete}
          className="text-red-600 focus:bg-red-100 focus:text-red-700"
        >
          <Trash2 className="mr-2 h-4 w-4" /> Delete Resource
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const columns = (
  onEditClick: (resource: ResourceData) => void,
  onDeleteSubmit: (id: string) => void
): ColumnDef<ResourceData>[] => [
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => <div>{row.original.category.name}</div>,
    filterFn: (row, id, value) => {
      return value.includes(row.original.category.id)
    },
  },
  {
    accessorKey: "url",
    header: "URL",
    cell: ({ row }) => (
      <a
        href={row.getValue("url")}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline truncate max-w-[250px] block"
        title={row.getValue("url")}
      >
        {row.getValue("url")}
      </a>
    ),
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
          Submitted
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
      const resource = row.original
      return (
        <div className="text-right">
          <RowActions resource={resource} onEditClick={onEditClick} onDeleteSubmit={onDeleteSubmit}/>
        </div>
      )
    },
  },
]