// /src/app/admin/resources/page.tsx

import prisma from "@/lib/prisma";
import { Prisma, ResourceStatus } from "@prisma/client";
import ResourceManager from "@/components/admin/ResourceManager";
import SearchControl from "@/components/admin/SearchControl";
import SortControl from "@/components/admin/SortControl";
import Link from "next/link";
import PaginationControls from "@/components/blog/PaginationControls";

const PER_PAGE = 12;

export default async function AdminResourcesPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | undefined };
}) {
  const params = searchParams ?? {};
  const tab = (params.tab as ResourceStatus) || ResourceStatus.PENDING;
  const q = params.q || "";
  const sort = params.sort || "createdAt-desc";
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);

  const searchFilter: Prisma.ResourceWhereInput = q
    ? {
        OR: [
          { name: { contains: q, mode: Prisma.QueryMode.insensitive } },
          { description: { contains: q, mode: Prisma.QueryMode.insensitive } },
        ],
      }
    : {};

  const where: Prisma.ResourceWhereInput = { ...searchFilter, status: tab };

  const [total, resources, categories] = await Promise.all([
    prisma.resource.count({ where }),
    prisma.resource.findMany({
      where,
      include: { category: true },
      orderBy: ((): Prisma.ResourceOrderByWithRelationInput => {
        const [field, dir] = sort.split("-");
        return { [field]: dir as Prisma.SortOrder };
      })(),
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Resource Moderation</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Approve, edit, or remove submitted resources.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SearchControl placeholder="Search resources..." />
          <SortControl
            options={[
              { label: "Newest First", value: "createdAt-desc" },
              { label: "Oldest First", value: "createdAt-asc" },
              { label: "Name (A-Z)", value: "name-asc" },
              { label: "Name (Z-A)", value: "name-desc" },
            ]}
          />
        </div>
      </div>
      <div className="mb-6 border-b border-muted">
        <nav className="flex gap-6 -mb-px" aria-label="Resource tabs">
          <Link
            href={`/admin/resources?tab=APPROVED${q ? `&q=${q}` : ''}${sort ? `&sort=${sort}` : ''}`}
            className={`whitespace-nowrap py-3 px-1 border-b-2 text-sm font-medium ${
              tab === "APPROVED"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
            }`}
          >
            Approved ({tab === 'APPROVED' ? total : ''})
          </Link>
          <Link
            href={`/admin/resources?tab=PENDING${q ? `&q=${q}` : ''}${sort ? `&sort=${sort}` : ''}`}
            className={`whitespace-nowrap py-3 px-1 border-b-2 text-sm font-medium ${
              tab === "PENDING"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
            }`}
          >
            Pending ({tab === 'PENDING' ? total : ''})
          </Link>
          <Link
            href={`/admin/resources?tab=REJECTED${q ? `&q=${q}` : ''}${sort ? `&sort=${sort}` : ''}`}
            className={`whitespace-nowrap py-3 px-1 border-b-2 text-sm font-medium ${
              tab === "REJECTED"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
            }`}
          >
            Rejected ({tab === 'REJECTED' ? total : ''})
          </Link>
        </nav>
      </div>
      <ResourceManager resources={resources} categories={categories} />
      <div className="mt-12">
        <PaginationControls
          currentPage={page}
          totalPages={totalPages}
          baseUrl="/admin/resources"
        />
      </div>
    </div>
  );
}