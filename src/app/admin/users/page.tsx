import prisma from "@/lib/prisma";
import { Prisma, Role } from "@prisma/client";
import UserManager from "@/components/admin/UserManager";
import SortControl from "@/components/admin/SortControl";
import SearchControl from "@/components/admin/SearchControl";
import PaginationControls from "@/components/blog/PaginationControls";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

const sortOptions = [
  { label: "Newest First", value: "createdAt-desc" },
  { label: "Oldest First", value: "createdAt-asc" },
  { label: "Email (A-Z)", value: "email-asc" },
  { label: "Email (Z-A)", value: "email-desc" },
];

const USERS_PER_PAGE = 10;

export default async function UserManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
    redirect('/admin');
  }

  const sp = await searchParams;
  const sort = sp.sort || "createdAt-desc";
  const query = sp.q;
  const page = Math.max(1, parseInt(sp.page || "1", 10));

  const [field, order] = sort.split("-");
  const orderBy: Prisma.UserOrderByWithRelationInput = { [field]: order as Prisma.SortOrder };

  const searchFilter: Prisma.UserWhereInput = query
    ? {
        OR: [
          { email: { contains: query, mode: Prisma.QueryMode.insensitive } },
          { name: { contains: query, mode: Prisma.QueryMode.insensitive } },
          { username: { contains: query, mode: Prisma.QueryMode.insensitive } },
        ],
      }
    : {};

  const where: Prisma.UserWhereInput = searchFilter;

  const [totalUsers, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy,
      skip: (page - 1) * USERS_PER_PAGE,
      take: USERS_PER_PAGE,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalUsers / USERS_PER_PAGE));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-foreground mb-2">User Management</h1>
          <p className="text-muted-foreground">Manage user roles, permissions, and access.</p>
        </div>
        <div className="flex items-center gap-4">
          <SearchControl placeholder="Search users by email or name..." />
          <SortControl options={sortOptions} />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-8">
        <UserManager users={users} currentUserRole={session.user.role} />
      </div>
      <div className="mt-12">
        <PaginationControls
          currentPage={page}
          totalPages={totalPages}
          baseUrl="/admin/users"
        />
      </div>
    </div>
  );
}
