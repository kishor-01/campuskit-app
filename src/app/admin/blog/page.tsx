// /src/app/admin/blog/page.tsx - UPDATED
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import BlogManager from "@/components/admin/BlogManager";
import SortControl from "@/components/admin/SortControl";
import SearchControl from "@/components/admin/SearchControl";
import PaginationControls from "@/components/blog/PaginationControls";

const sortOptions = [
  { label: "Newest First", value: "createdAt-desc" },
  { label: "Oldest First", value: "createdAt-asc" },
  { label: "Title (A-Z)", value: "title-asc" },
  { label: "Title (Z-A)", value: "title-desc" },
];

const ARTICLES_PER_PAGE = 10;

export default async function BlogManagementPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const sortParam = searchParams.sort || "createdAt-desc";
  const queryParam = searchParams.q;
  const pageParam = searchParams.page || "1";

  const page = Math.max(1, parseInt(pageParam, 10));
  const [field, order] = sortParam.split("-");
  const orderBy: Prisma.ArticleOrderByWithRelationInput = { [field]: order as Prisma.SortOrder };

  const where: Prisma.ArticleWhereInput = queryParam
    ? {
        OR: [
          { title: { contains: queryParam, mode: Prisma.QueryMode.insensitive } },
          { content: { contains: queryParam, mode: Prisma.QueryMode.insensitive } },
        ],
      }
    : {};

  // NEW: Fetch affiliate links along with articles
  const [totalArticles, articles, affiliateLinks] = await Promise.all([
    prisma.article.count({ where }),
    prisma.article.findMany({
      where,
      include: { author: { select: { name: true, email: true } } },
      orderBy,
      skip: (page - 1) * ARTICLES_PER_PAGE,
      take: ARTICLES_PER_PAGE,
    }),
    prisma.affiliateLink.findMany({
      include: {
        partner: true,
      },
      orderBy: {
        name: 'asc'
      }
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalArticles / ARTICLES_PER_PAGE));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-foreground mb-2">Blog Management</h1>
          <p className="text-muted-foreground">Create, edit, and manage all your articles.</p>
        </div>
        <div className="flex items-center gap-4">
          <SearchControl placeholder="Search articles..." />
          <SortControl options={sortOptions} />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-8">
        {/* NEW: Pass affiliateLinks to BlogManager */}
        <BlogManager articles={articles} affiliateLinks={affiliateLinks} />
      </div>
      <div className="mt-12">
        <PaginationControls
          currentPage={page}
          totalPages={totalPages}
          baseUrl="/admin/blog"
        />
      </div>
    </div>
  );
}