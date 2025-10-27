// /src/app/admin/affiliates/page.tsx

import prisma from "@/lib/prisma";
import AffiliatePartnerManager from "@/components/admin/AffiliatePartnerManager";
import AffiliateLinkManager from "@/components/admin/AffiliateLinkManager";
import SortControl from "@/components/admin/SortControl";
import SearchControl from "@/components/admin/SearchControl";

const sortOptions = [
  { label: "Newest First", value: "createdAt-desc" },
  { label: "Oldest First", value: "createdAt-asc" },
  { label: "Title (A-Z)", value: "title-asc" },
  { label: "Title (Z-A)", value: "title-desc" },
];

export default async function AffiliateManagementPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const sort = searchParams.sort || "createdAt-desc";
  const query = searchParams.q;
  const [field, order] = sort.split("-");

  const orderBy = { [field]: order };

  const where = query
    ? {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { slug: { contains: query, mode: "insensitive" } },
        ],
      }
    : {};

  const [partners, links] = await Promise.all([
    prisma.affiliatePartner.findMany({ orderBy: { name: "asc" } }),
    prisma.affiliateLink.findMany({
      where,
      include: { partner: true },
      orderBy,
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-foreground mb-2">Affiliate Management</h1>
          <p className="text-muted-foreground">Manage affiliate partners and trackable links for monetization.</p>
        </div>
        <div className="flex items-center gap-4">
          <SearchControl placeholder="Search links..." />
          <SortControl options={sortOptions} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <AffiliatePartnerManager partners={partners} />
        </div>
        <div className="lg:col-span-2">
          <AffiliateLinkManager links={links} partners={partners} />
        </div>
      </div>
    </div>
  );
}