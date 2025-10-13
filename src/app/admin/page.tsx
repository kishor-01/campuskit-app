
// src/app/admin/page.tsx

import prisma from "@/lib/prisma";
import { Users, Book, Briefcase, FileText, DollarSign, Map } from "lucide-react"; 
import Link from "next/link";

// MODIFIED: The StatCard now accepts an optional subtitle
const StatCard = ({ 
  title, 
  value, 
  subtitle, // ADDED
  icon,
  href 
}: { 
  title: string; 
  value: number; 
  subtitle?: string; // ADDED
  icon: React.ReactNode;
  href?: string;
}) => {
  const CardContent = () => (
    <div className="bg-muted/50 p-6 rounded-lg flex items-center gap-4 hover:bg-muted/70 transition-colors h-full">
      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center text-muted-foreground flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-3xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        {/* ADDED: Conditionally render the subtitle */}
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </div>
    </div>
  );
  
  return href ? <Link href={href}><CardContent /></Link> : <CardContent />;
};

export default async function AdminPage() {
  const [
    userCount,
    resourceCount,
    categoryCount, // ADDED: Re-added category count
    opportunityCount,
    articleCount,
    affiliatePartnerCount,
    roadmapCount, // ADDED: Fetch count for roadmaps
  ] = await Promise.all([
    prisma.user.count(),
    prisma.resource.count(),
    prisma.category.count(), // ADDED
    prisma.opportunity.count(),
    prisma.article.count(),
    prisma.affiliatePartner.count(),
    prisma.roadmap.count(), // ADDED: Fetch count for roadmaps
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-foreground mb-2">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          A central hub to monitor statistics and manage platform content.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
        <StatCard 
          title="Total Users" 
          value={userCount} 
          icon={<Users size={24} />} 
        />
        {/* MODIFIED: The resources card now has a clearer title and a subtitle */}
        <StatCard 
          title="Total Resources" 
          value={resourceCount}
          subtitle={`in ${categoryCount} Categories`}
          icon={<Book size={24} />}
          href="/admin/resources"
        />
        <StatCard 
          title="Manage Opportunities" 
          value={opportunityCount} 
          icon={<Briefcase size={24} />}
          href="/admin/opportunities"
        />
        <StatCard 
          title="Manage Articles" 
          value={articleCount} 
          icon={<FileText size={24} />}
          href="/admin/blog"
        />
        <StatCard 
          title="Affiliate Partners" 
          value={affiliatePartnerCount} 
          icon={<DollarSign size={24} />}
          href="/admin/affiliates"
        />
        {/* ADDED: New card for Roadmaps */}
        <StatCard 
          title="Manage Roadmaps" 
          value={roadmapCount} 
          icon={<Map size={24} />}
          href="/admin/roadmaps"
        />
      </div>
    </div>
  );
}