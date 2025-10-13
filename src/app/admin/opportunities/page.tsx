// /src/app/admin/opportunities/page.tsx

import prisma from "@/lib/prisma";
import OpportunityManager from "@/components/admin/OpportunityManager";
import SortControl from "@/components/admin/SortControl";
import SearchControl from "@/components/admin/SearchControl";
import { OpportunityStatus } from "@prisma/client";
import Link from "next/link";

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

export default async function OpportunityManagementPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const sort = searchParams.sort || "createdAt-desc";
  const query = searchParams.q;
  const tab = searchParams.tab || OpportunityStatus.PUBLISHED;

  const [field, order] = sort.split("-");
  const orderBy = { [field]: order };

  const searchFilter = query
    ? {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { organization: { contains: query, mode: "insensitive" } },
        ],
      }
    : {};

  const statusFilter = { status: tab as OpportunityStatus };
  
  const where = { ...searchFilter, ...statusFilter };

  const opportunities = await prisma.opportunity.findMany({
    where,
    orderBy,
  });

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

      {/* Tab Navigation */}
      <div className="border-b border-muted mb-8">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((item) => (
            <Link
              key={item.name}
              href={`?tab=${item.status}`}
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
    </div>
  );
}