import prisma from "@/lib/prisma";
import { ResourceStatus } from "@prisma/client";
import ResourceManager from "@/components/admin/ResourceManager";
import SearchControl from "@/components/admin/SearchControl";
import SortControl from "@/components/admin/SortControl";
import Link from "next/link";

const PER_PAGE = 12;

export default async function AdminResourcesPage({ searchParams }: { searchParams?: { [key: string]: string | undefined } }) {
  const params = searchParams ?? {};
  const tab = (params.tab as ResourceStatus) || ResourceStatus.PENDING;
  const q = params.q || "";
  const sort = params.sort || "createdAt-desc";
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);

  // This database query logic is correct
  const searchFilter = q ? {
    OR: [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ]
  } : {};

  const where = { ...searchFilter, status: tab };

  const [total, resources, categories] = await Promise.all([
    prisma.resource.count({ where }),
    prisma.resource.findMany({
      where,
      include: { category: true },
      orderBy: ((): any => {
        const [field, dir] = sort.split("-");
        return { [field]: dir as "asc" | "desc" };
      })(),
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } })
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div className="max-w-7xl mx-auto px-4 sm-px-6 lg:px-8 py-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Resource Moderation</h1>
          <p className="text-sm text-muted-foreground mt-1">Approve, edit, or remove submitted resources.</p>
        </div>

        <div className="flex items-center gap-3">
          <SearchControl placeholder="Search resources..." />
          <SortControl options={[
            {label: 'Newest First', value: 'createdAt-desc'},
            {label: 'Oldest First', value: 'createdAt-asc'},
            {label: 'Name (A-Z)', value: 'name-asc'},
            {label: 'Name (Z-A)', value: 'name-desc'},
          ]} />
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-muted pb-3">
        <nav className="flex gap-6" aria-label="Resource tabs">
          <Link href={`/admin/resources?tab=APPROVED`} className={`pb-2 ${tab === "APPROVED" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>Approved</Link>
          <Link href={`/admin/resources?tab=PENDING`} className={`pb-2 ${tab === "PENDING" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>Pending</Link>
          <Link href={`/admin/resources?tab=REJECTED`} className={`pb-2 ${tab === "REJECTED" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>Rejected</Link>
        </nav>
      </div>

      {/* FIX: Corrected component name and simplified the props being passed */}
      <ResourceManager
        resources={resources}
        categories={categories}
      />
    </div>
  );
}