// src/app/profile/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import PassportCard from "@/components/profile/PassportCard";
import ActivityHeatmap from "@/components/profile/ActivityHeatmap";
import GoalArchitectWidget from "@/components/profile/GoalArchitectWidget";
import ResourceStackWidget from "@/components/profile/ResourceStackWidget";
import SettingsWidget from "@/components/profile/SettingsWidget";
import ContributionWidget from "@/components/profile/ContributionWidget";
import AdminQuickActions from "@/components/profile/AdminQuickActions";
import StatsRow from "@/components/profile/StatsRow";

export default async function ProfilePage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  // Fetch all data in parallel for the new widget-based layout
  const [user, goals, savedResources, submissionCount, adminStats, analyticsEvents, totalContributions] = await Promise.all([
    prisma.user.findUnique({ 
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        education: true,
        role: true,
        createdAt: true,
        image: true,
        developerTitle: true,
        githubUrl: true,
        portfolioUrl: true,
        badges: true,
        currentStreak: true,
        longestStreak: true,
        lastActiveAt: true,
      }
    }),
    prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: {
        milestones: { 
          include: { 
            topics: { 
              include: { 
                subTopics: true 
              } 
            } 
          } 
        },
      },
    }),
    prisma.savedResource.findMany({
      where: { userId },
      include: { 
        resource: { 
          include: { 
            category: true 
          } 
        } 
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.resource.count({ where: { submittedById: userId } }),
    // Admin stats - only fetch if user is admin
    // Use the user role from the database, not the session
    (async () => {
      const user = await prisma.user.findUnique({ 
        where: { id: userId },
        select: { role: true }
      });
      
      if (user?.role === Role.ADMIN || user?.role === Role.SUPER_ADMIN) {
        const [pendingResources, pendingOpportunities, totalUsers] = await Promise.all([
          prisma.resource.count({ where: { status: 'PENDING' } }),
          prisma.opportunity.count({ where: { status: 'PENDING' } }),
          prisma.user.count(),
        ]);
        return { pendingResources, pendingOpportunities, totalUsers };
      }
      return null;
    })(),
    prisma.analyticsEvent.findMany({
      where: { 
        userId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      select: {
        id: true,
        eventType: true,
        createdAt: true,
      }
    }),
    prisma.analyticsEvent.count({ where: { userId } })
  ]);

  if (!user) {
    redirect("/login");
  }

  // Calculate progress for each goal and include date fields
  const goalsWithProgress = goals.map(g => {
    let total = 0;
    let completed = 0;
    g.milestones.forEach(m => m.topics.forEach(t => {
      total += t.subTopics.length;
      completed += t.subTopics.filter(st => st.isCompleted).length;
    }));
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    return {
        id: g.id,
        title: g.title,
        percent,
        createdAt: g.createdAt.toISOString(),
        targetDate: g.targetDate ? g.targetDate.toISOString() : null,
    };
  });

  const isAdmin = user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Your Digital Desk
        </h1>
        {/* Role Badge */}
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
          user.role === Role.SUPER_ADMIN ? 'bg-purple-100 text-purple-800 border border-purple-200' :
          user.role === Role.ADMIN ? 'bg-red-100 text-red-800 border border-red-200' :
          user.role === Role.EDITOR ? 'bg-blue-100 text-blue-800 border border-blue-200' :
          user.role === Role.CONTRIBUTOR ? 'bg-green-100 text-green-800 border border-green-200' :
          'bg-gray-100 text-gray-800 border border-gray-200'
        }`}>
          {user.role.replace('_', ' ')}
        </div>
      </div>

      <div className="space-y-6">
        {/* Admin Quick Actions - Only show for admins */}
        {isAdmin && adminStats && (
          <AdminQuickActions stats={adminStats} />
        )}

        {/* --- Top Row: Profile & Goals --- */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 flex flex-col gap-6">
            <PassportCard
              user={user}
              savedCount={savedResources.length}
              submittedCount={submissionCount}
            />
            <StatsRow
              currentStreak={user.currentStreak}
              longestStreak={user.longestStreak}
              totalContributions={totalContributions}
              lastActiveAt={user.lastActiveAt}
            />
            <ActivityHeatmap events={analyticsEvents} />
          </div>
          <div className="lg:col-span-3">
            <GoalArchitectWidget goals={goalsWithProgress} />
          </div>
        </div>

        {/* --- Middle Row: Resource Stack --- */}
        <ResourceStackWidget savedResources={savedResources} />

        {/* --- Bottom Row: Contribution & Settings --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ContributionWidget 
            submissionCount={submissionCount} 
            userRole={user.role}
          />
          <SettingsWidget userRole={user.role} />
        </div>
      </div>
    </div>
  );
}