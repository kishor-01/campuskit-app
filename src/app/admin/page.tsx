// src/app/admin/page.tsx - Updated with role-based UI
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Users, Book, Map, Layers3, Briefcase, FileText, Link as LinkIcon, Shield } from "lucide-react";
import { checkPermission, isUserAtLeast, getCurrentUser } from "@/lib/auth-utils";
import { Permission, Role } from "@prisma/client";

export default async function AdminPage() {
  const currentUser = await getCurrentUser();
  
  // Only fetch data if user has appropriate permissions
  const [
    userCount,
    resourceCount,
    categoryCount,
    roadmapCount,
    opportunityCount,
    articleCount,
    affiliateLinkCount,
    pendingResourceCount,
    pendingOpportunityCount,
    canManageUsers,
    canManageBlog,
    canManageAffiliates,
    canModerateResources,
    canModerateOpportunities,
    isAtLeastEditor,
  ] = await Promise.all([
    (await checkPermission(Permission.USER_READ)) ? prisma.user.count() : 0,
    prisma.resource.count({ where: { status: 'APPROVED' } }),
    prisma.category.count(),
    prisma.roadmap.count({ where: { isPublished: true } }),
    prisma.opportunity.count({ where: { status: 'PUBLISHED' }}),
    prisma.article.count({ where: { status: 'PUBLISHED' }}),
    prisma.affiliateLink.count(),
    prisma.resource.count({ where: { status: 'PENDING' } }),
    prisma.opportunity.count({ where: { status: 'PENDING' } }),
    checkPermission(Permission.USER_MANAGE),
    checkPermission(Permission.BLOG_WRITE),
    checkPermission(Permission.AFFILIATE_MANAGE),
    checkPermission(Permission.RESOURCE_MODERATE),
    checkPermission(Permission.OPPORTUNITY_MODERATE),
    isUserAtLeast(Role.EDITOR),
  ]);

  const StatCard = ({ title, value, subtitle, href, icon, requiredPermission }: { 
    title: string; 
    value: number; 
    subtitle?: string; 
    href?: string; 
    icon: React.ReactNode;
    requiredPermission?: Permission;
  }) => {
    if (requiredPermission && !canManageUsers && requiredPermission === Permission.USER_MANAGE) {
      return null;
    }

    const Inner = () => (
      <div className="bg-muted/50 p-4 rounded-lg hover:shadow-md transition-shadow h-full flex items-start gap-4 border border-transparent hover:border-border">
        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center text-muted-foreground flex-shrink-0">
          {icon}
        </div>
        <div>
          <p className="text-xl font-bold text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground">{title}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
      </div>
    );

    return href ? <Link href={href} className="focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"><Inner /></Link> : <div><Inner /></div>;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-extrabold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Your role: <span className="font-semibold capitalize">{currentUser?.role?.toLowerCase().replace('_', ' ')}</span>
          </p>
        </div>
        {currentUser?.role === Role.SUPER_ADMIN && (
          <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full text-sm">
            <Shield size={16} />
            Super Admin
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard 
          title="Total Users" 
          value={userCount} 
          icon={<Users size={20} />}
          requiredPermission={Permission.USER_READ}
        />
        <StatCard 
          title="Approved Resources" 
          value={resourceCount} 
          subtitle={`${categoryCount} categories`} 
          href="/admin/resources?tab=APPROVED" 
          icon={<Book size={20} />} 
        />
        <StatCard 
          title="Manage Categories" 
          value={categoryCount} 
          href="/admin/categories" 
          icon={<Layers3 size={20} />} 
        />
        <StatCard 
          title="Published Roadmaps" 
          value={roadmapCount} 
          href="/admin/roadmaps" 
          icon={<Map size={20} />} 
        />
        
        {/* Conditional cards based on permissions */}
        {canManageBlog && (
          <StatCard 
            title="Published Articles" 
            value={articleCount} 
            href="/admin/blog" 
            icon={<FileText size={20} />} 
          />
        )}
        {canManageAffiliates && (
          <StatCard 
            title="Affiliate Links" 
            value={affiliateLinkCount} 
            href="/admin/affiliates" 
            icon={<LinkIcon size={20} />} 
          />
        )}
      </div>

      {/* Moderation Section - Only show if user can moderate */}
      {(canModerateResources || canModerateOpportunities) && (
        <div className="lg:col-span-2 bg-muted/50 p-6 rounded-lg border border-transparent hover:border-border transition-colors mb-6">
          <h2 className="text-xl font-bold mb-3">Moderation Queues</h2>
          <p className="text-sm text-muted-foreground">Review pending submissions for resources and opportunities.</p>
          <div className="mt-4 flex flex-wrap gap-4">
            {canModerateResources && (
              <Link href="/admin/resources?tab=PENDING" className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-semibold hover:bg-primary/90">
                Review Resources
                {pendingResourceCount > 0 && (
                  <span className="ml-2 inline-block py-0.5 px-2 rounded-full text-xs font-semibold bg-primary-foreground text-primary">
                    {pendingResourceCount}
                  </span>
                )}
              </Link>
            )}
            {canModerateOpportunities && (
              <Link href="/admin/opportunities?tab=PENDING" className="inline-flex items-center px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-semibold hover:bg-secondary/80">
                Review Opportunities
                {pendingOpportunityCount > 0 && (
                  <span className="ml-2 inline-block py-0.5 px-2 rounded-full text-xs font-semibold bg-secondary-foreground text-secondary">
                    {pendingOpportunityCount}
                  </span>
                )}
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions with permission checks */}
      <div className="bg-muted/50 p-6 rounded-lg border border-transparent hover:border-border transition-colors">
        <h2 className="text-xl font-bold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <Link href="/admin/resources" className="px-3 py-2 bg-background border border-muted rounded-md text-sm hover:bg-muted transition-colors text-center">
            Manage Resources
          </Link>
          <Link href="/admin/categories" className="px-3 py-2 bg-background border border-muted rounded-md text-sm hover:bg-muted transition-colors text-center">
            Manage Categories
          </Link>
          <Link href="/admin/roadmaps" className="px-3 py-2 bg-background border border-muted rounded-md text-sm hover:bg-muted transition-colors text-center">
            Manage Roadmaps
          </Link>
          
          {canManageBlog && (
            <Link href="/admin/blog" className="px-3 py-2 bg-background border border-muted rounded-md text-sm hover:bg-muted transition-colors text-center">
              Manage Blog
            </Link>
          )}
          
          <Link href="/admin/opportunities" className="px-3 py-2 bg-background border border-muted rounded-md text-sm hover:bg-muted transition-colors text-center">
            Manage Opportunities
          </Link>
          
          {canManageAffiliates && (
            <Link href="/admin/affiliates" className="px-3 py-2 bg-background border border-muted rounded-md text-sm hover:bg-muted transition-colors text-center">
              Manage Affiliates
            </Link>
          )}
          
          {canManageUsers && (
            <Link href="/admin/users" className="px-3 py-2 bg-background border border-muted rounded-md text-sm hover:bg-muted transition-colors text-center">
              Manage Users
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}