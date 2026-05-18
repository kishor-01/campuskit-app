"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User, Role } from "@prisma/client";
import { ArrowUpDown, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export type UserData = User;

const roleColors: Record<string, string> = {
  SUPER_ADMIN: "bg-purple-100 text-purple-800",
  ADMIN: "bg-red-100 text-red-800",
  EDITOR: "bg-blue-100 text-blue-800",
  CONTRIBUTOR: "bg-yellow-100 text-yellow-800",
  VIEWER: "bg-gray-100 text-gray-800",
};

export const columns = (
  onEdit: (user: UserData) => void,
  onDelete: (id: string) => void
): ColumnDef<UserData>[] => [
  {
    accessorKey: "email",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Email <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-medium px-4">{row.getValue("email") || row.original.username || 'No Email'}</div>,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <div>{row.getValue("name") || 'N/A'}</div>,
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${roleColors[role] || "bg-gray-100 text-gray-800"}`}>
          {role.replace("_", " ")}
        </span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Joined At",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return <div>{new Date(date).toLocaleDateString()}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => onEdit(user)} title="Edit Role">
            <Edit className="w-4 h-4 text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete ${user.email}? This action cannot be undone.`)) {
                onDelete(user.id);
              }
            }}
            title="Delete User"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      );
    },
  },
];
