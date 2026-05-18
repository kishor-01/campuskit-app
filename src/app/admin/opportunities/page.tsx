// /src/app/admin/opportunities/page.tsx

import prisma from "@/lib/prisma";
import { Prisma, OpportunityStatus } from "@prisma/client";
import OpportunityManager from "@/components/admin/OpportunityManager";
import SortControl from "@/components/admin/SortControl";
import SearchControl from "@/components/admin/SearchControl";
import Link from "next/link";
import PaginationControls from "@/components/blog/PaginationControls";

const sortOptions = [
  { label: "Newest First", value: "createdAt-desc" },
  { label: "Oldest First", value: "createdAt-asc" },
  { label: "Title (A-Z)", value: "title-asc" },
  { label: "Title (Z-A)", value: "title-desc" },
];

const tabs = [
  { name: "Published", status: OpportunityStatus.PUBLISHED },
  { name: "Pending Review", status: OpportunityStatus.PENDING },
  { name: "Rejected", status: OpportunityStatus.REJECTED },
];

const OPPORTUNITIES_PER_PAGE = 10;

export default async function OpportunityManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const sp = await searchParams;
  const sort = sp.sort || "createdAt-desc";
  const query = sp.q;
  const tab = sp.tab || OpportunityStatus.PUBLISHED;
  const page = Math.max(1, parseInt(sp.page || "1", 10));

  const [field, order] = sort.split("-");
  const orderBy: Prisma.OpportunityOrderByWithRelationInput = { [field]: order as Prisma.SortOrder };

  const searchFilter: Prisma.OpportunityWhereInput = query
    ? {
        OR: [
          { title: { contains: query, mode: Prisma.QueryMode.insensitive } },
          { organization: { contains: query, mode: Prisma.QueryMode.insensitive } },
        ],
      }
    : {};

  const statusFilter: Prisma.OpportunityWhereInput = { status: tab as OpportunityStatus };
  const where: Prisma.OpportunityWhereInput = { ...searchFilter, ...statusFilter };

  const [totalOpportunities, opportunities] = await Promise.all([
    prisma.opportunity.count({ where }),
    prisma.opportunity.findMany({
      where,
      orderBy,
      skip: (page - 1) * OPPORTUNITIES_PER_PAGE,
      take: OPPORTUNITIES_PER_PAGE,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalOpportunities / OPPORTUNITIES_PER_PAGE));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-4xl font-extrabold text-foreground mb-2">Opportunity Management</h1>
          <p className="text-muted-foreground">Review, approve, and manage all opportunities.</p>
        </div>
        <div className="flex items-center gap-4">
          <SearchControl placeholder="Search opportunities..." />
          <SortControl options={sortOptions} />
        </div>
      </div>
      <div className="border-b border-muted mb-8">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((item) => (
            <Link
              key={item.name}
              href={`?tab=${item.status}${sort ? `&sort=${sort}` : ''}${query ? `&q=${query}` : ''}`}
              className={`${
                tab === item.status
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
      <div className="grid grid-cols-1 gap-8">
        <OpportunityManager opportunities={opportunities} />
      </div>
      <div className="mt-12">
        <PaginationControls
          currentPage={page}
          totalPages={totalPages}
          baseUrl="/admin/opportunities"
        />
      </div>
    </div>
  );
}