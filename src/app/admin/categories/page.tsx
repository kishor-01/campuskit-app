// /src/app/admin/categories/page.tsx

import prisma from "@/lib/prisma";
import CategoryManager from "@/components/admin/CategoryManager";
import SearchControl from "@/components/admin/SearchControl";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const sp = await searchParams;
  const search = sp.search || "";

  const categories = await prisma.category.findMany({
    where: search
      ? { name: { contains: search, mode: "insensitive" } }
      : {},
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Manage Categories</h1>
          <p className="text-sm text-muted-foreground">
            Create, rename, and remove categories used by resources and other content.
          </p>
        </div>
        <SearchControl placeholder="Search categories..." paramName="search" />
      </div>
      <CategoryManager categories={categories} />
    </div>
  );
}