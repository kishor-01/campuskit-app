// /src/app/admin/categories/page.tsx

import prisma from "@/lib/prisma";
import CategoryManager from "@/components/admin/CategoryManager";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-3">Manage Categories</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Create, rename, and remove categories used by resources and other content.
      </p>
      <CategoryManager categories={categories} />
    </div>
  );
}