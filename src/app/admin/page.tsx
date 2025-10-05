// src/app/admin/page.tsx

import prisma from "@/lib/prisma"; // ✅ CORRECTED: Changed { prisma } to prisma
import { Users, Book, Folder, BadgePercent } from "lucide-react";
import CategoryManager from "@/components/admin/CategoryManager";
import ResourceManager from "@/components/admin/ResourceManager";
import DealManager from "@/components/admin/DealManager"; // ✅ Added new component

const StatCard = ({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) => (
  <div className="bg-muted/50 p-6 rounded-lg flex items-center gap-4">
    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
      {icon}
    </div>
    <div>
      <p className="text-3xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground font-medium">{title}</p>
    </div>
  </div>
);

export default async function AdminPage() {
  // ✅ Fetch all necessary dashboard stats and data (including deals)
  const [
    userCount,
    resourceCount,
    categoryCount,
    dealCount,
    categories,
    resources,
    deals,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.resource.count(),
    prisma.category.count(),
    prisma.deal.count(),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.resource.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.deal.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-extrabold text-foreground mb-8">
        Admin Dashboard
      </h1>

      {/* ✅ Dashboard Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard title="Total Users" value={userCount} icon={<Users />} />
        <StatCard title="Total Resources" value={resourceCount} icon={<Book />} />
        <StatCard title="Total Categories" value={categoryCount} icon={<Folder />} />
        <StatCard title="Total Deals" value={dealCount} icon={<BadgePercent />} />
      </div>

      {/* ✅ Management Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <CategoryManager categories={categories} />
        <ResourceManager resources={resources} categories={categories} />
        <DealManager deals={deals} /> {/* ✅ Added DealManager */}
      </div>
    </div>
  );
}
