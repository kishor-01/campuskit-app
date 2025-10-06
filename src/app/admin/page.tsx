// src/app/admin/page.tsx

import prisma from "@/lib/prisma";
import { Users, Book, Folder, Briefcase, FileText } from "lucide-react"; // ✅ Added FileText
import CategoryManager from "@/components/admin/CategoryManager";
import ResourceManager from "@/components/admin/ResourceManager";
import OpportunityManager from "@/components/admin/OpportunityManager";
import BlogManager from "@/components/admin/BlogManager"; // ✅ New import

// ✅ StatCard component retained from original
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
  // ✅ Fetch all required data including new "articles"
  const [
    userCount,
    resourceCount,
    categoryCount,
    opportunityCount,
    articleCount,
    categories,
    resources,
    opportunities,
    articles,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.resource.count(),
    prisma.category.count(),
    prisma.opportunity.count(),
    prisma.article.count(), // ✅ New
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.resource.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.opportunity.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.article.findMany({ orderBy: { createdAt: "desc" } }), // ✅ New
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-extrabold text-foreground mb-8">
        Admin Dashboard
      </h1>

      {/* ✅ Dashboard Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
        <StatCard title="Total Users" value={userCount} icon={<Users />} />
        <StatCard title="Total Resources" value={resourceCount} icon={<Book />} />
        <StatCard title="Total Categories" value={categoryCount} icon={<Folder />} />
        <StatCard title="Total Opportunities" value={opportunityCount} icon={<Briefcase />} />
        <StatCard title="Total Articles" value={articleCount} icon={<FileText />} />
      </div>

      {/* ✅ Management Section */}
      <div className="grid grid-cols-1 gap-8">
        {/* New BlogManager Section */}
        <BlogManager articles={articles} />

        {/* Keep existing Category & Resource Managers */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <CategoryManager categories={categories} />
          <ResourceManager resources={resources} categories={categories} />
        </div>

        {/* Keep OpportunityManager below */}
        <OpportunityManager opportunities={opportunities} />
      </div>
    </div>
  );
}
