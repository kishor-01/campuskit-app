// src/app/admin/page.tsx

import prisma from "@/lib/prisma";
import { Users, Book, Folder, Briefcase, FileText } from "lucide-react";
import CategoryManager from "@/components/admin/CategoryManager";
import ResourceManager from "@/components/admin/ResourceManager";
import OpportunityManager from "@/components/admin/OpportunityManager";
import BlogManager from "@/components/admin/BlogManager";

const StatCard = ({ 
  title, 
  value, 
  icon 
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
  // Fetch all required data in parallel for better performance
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
    prisma.article.count(),
    prisma.category.findMany({ 
      orderBy: { name: "asc" } 
    }),
    prisma.resource.findMany({
      include: { 
        category: true 
      },
      orderBy: { 
        createdAt: "desc" 
      },
    }),
    prisma.opportunity.findMany({ 
      orderBy: { 
        createdAt: "desc" 
      } 
    }),
    prisma.article.findMany({
      include: {
        author: {
          select: {
            name: true,
            email: true,
          }
        }
      },
      orderBy: { 
        createdAt: "desc" 
      }
    })
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-foreground mb-2">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage your platform content and monitor statistics
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
        <StatCard 
          title="Total Users" 
          value={userCount} 
          icon={<Users size={24} />} 
        />
        <StatCard 
          title="Total Resources" 
          value={resourceCount} 
          icon={<Book size={24} />} 
        />
        <StatCard 
          title="Total Categories" 
          value={categoryCount} 
          icon={<Folder size={24} />} 
        />
        <StatCard 
          title="Total Opportunities" 
          value={opportunityCount} 
          icon={<Briefcase size={24} />} 
        />
        <StatCard 
          title="Total Articles" 
          value={articleCount} 
          icon={<FileText size={24} />} 
        />
      </div>

      {/* Management Sections */}
      <div className="grid grid-cols-1 gap-8">
        {/* Blog Management */}
        <BlogManager articles={articles} />

        {/* Category & Resource Management */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <CategoryManager categories={categories} />
          <ResourceManager 
            resources={resources} 
            categories={categories} 
          />
        </div>

        {/* Opportunity Management */}
        <OpportunityManager opportunities={opportunities} />
      </div>
    </div>
  );
}