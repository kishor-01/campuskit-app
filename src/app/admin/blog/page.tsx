// /src/app/admin/blog/page.tsx

import prisma from "@/lib/prisma";
import BlogManager from "@/components/admin/BlogManager";
import SortControl from "@/components/admin/SortControl";
import SearchControl from "@/components/admin/SearchControl"; // 1. Import component

const sortOptions = [
  // ... (same as before)
];

export default async function BlogManagementPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const sort = searchParams.sort || "createdAt-desc";
  const query = searchParams.q; // 2. Get the search query
  const [field, order] = sort.split("-");
  const orderBy = { [field]: order };

  // 3. Create a dynamic where clause for searching
  const where = query
    ? {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { content: { contains: query, mode: "insensitive" } },
        ],
      }
    : {};

  const articles = await prisma.article.findMany({
    where, // 4. Use the where clause in the query
    include: { author: { select: { name: true, email: true }}},
    orderBy,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-foreground mb-2">Blog Management</h1>
          <p className="text-muted-foreground">Create, edit, and manage all your articles.</p>
        </div>
        <div className="flex items-center gap-4"> {/* 5. Add components to UI */}
          <SearchControl placeholder="Search articles..." />
          <SortControl options={sortOptions} />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-8">
        <BlogManager articles={articles} />
      </div>
    </div>
  );
}