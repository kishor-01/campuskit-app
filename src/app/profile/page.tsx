// src/app/profile/page.tsx
// Elite Engineering Dossier — Bento-Box Profile
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';
import ActivityHeatmap from '@/components/profile/ActivityHeatmap';
import BentoSettings from '@/components/profile/BentoSettings';
import {
  Flame, Trophy, BarChart3, UserCircle2, CalendarDays,
  CheckCircle2, BookOpen, Map, Star, Zap,
} from 'lucide-react';
import { computeNodeStatuses } from '@/lib/graphEngine';

export const metadata = {
  title: 'Profile Dossier — Seniofy',
  description: 'Your elite engineering profile and activity dashboard.',
};

export default async function ProfilePage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect('/login');

  // ── Parallel data fetching ───────────────────────────────────────────────
  const [user, analyticsEvents, totalContributions, completedRoadmaps] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        developerTitle: true,
        githubUrl: true,
        portfolioUrl: true,
        badges: true,
        currentStreak: true,
        longestStreak: true,
        lastActiveAt: true,
        education: true,
      },
    }),
    prisma.analyticsEvent.findMany({
      where: {
        userId,
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      select: { id: true, eventType: true, createdAt: true },
    }),
    prisma.analyticsEvent.count({ where: { userId } }),
    // Roadmaps where user completed ALL nodes
    (async () => {
      const progressRecords = await prisma.userNodeProgress.findMany({
        where: { userId, status: 'COMPLETED' },
        select: { nodeId: true },
      });
      const completedIds = new Set(progressRecords.map((p) => p.nodeId));
      if (completedIds.size === 0) return [];

      const activeNodes = await prisma.learningNode.findMany({
        where: { id: { in: [...completedIds] } },
        select: { roadmapId: true },
        distinct: ['roadmapId'],
      });
      const roadmapIds = activeNodes.map((n) => n.roadmapId);

      const roadmaps = await prisma.roadmap.findMany({
        where: { id: { in: roadmapIds }, isPublished: true },
        include: {
          learningNodes: { select: { id: true } },
          learningEdges: { select: { sourceNodeId: true, targetNodeId: true } },
        },
      });

      // Only roadmaps where 100% nodes are completed
      return roadmaps.filter((rm) => {
        const statusMap = computeNodeStatuses(
          rm.learningNodes.map((n) => ({ id: n.id })),
          rm.learningEdges.map((e) => ({ sourceNodeId: e.sourceNodeId, targetNodeId: e.targetNodeId })),
          completedIds
        );
        return rm.learningNodes.every((n) => statusMap.get(n.id) === 'COMPLETED');
      });
    })(),
  ]);

  if (!user) redirect('/login');

  const isActiveToday = (() => {
    if (!user.lastActiveAt) return false;
    const now = new Date();
    const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const la = user.lastActiveAt;
    const laUTC = Date.UTC(la.getUTCFullYear(), la.getUTCMonth(), la.getUTCDate());
    return todayUTC === laUTC;
  })();

  const joinedMonth = user.createdAt.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Ambient glow accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute top-0 right-1/4 w-[500px] h-[200px] rounded-full bg-violet-500/5 blur-[80px]" />
        <div className="absolute bottom-1/3 left-0 w-[400px] h-[200px] rounded-full bg-indigo-500/5 blur-[80px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
              Engineer Dossier
            </p>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Your Profile</h1>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg
              border border-violet-500/30 bg-violet-500/10 text-violet-500
              hover:bg-violet-500/20 transition-all"
          >
            <Zap className="w-3.5 h-3.5" /> Mission Control
          </Link>
        </div>

        {/* ── BENTO GRID ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* ── BENTO 1: Identity Card (col span 1) ──────────────────── */}
          <div className="md:col-span-1 rounded-2xl border border-border bg-card/80 backdrop-blur-sm
            p-6 flex flex-col items-center text-center gap-4 relative overflow-hidden">
            {/* Gradient orb */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full
              bg-gradient-to-br from-violet-500/10 to-indigo-500/5 blur-2xl pointer-events-none" />

            {/* Avatar */}
            <div className="relative z-10">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name ?? 'User'}
                  width={88}
                  height={88}
                  className="w-22 h-22 rounded-2xl ring-2 ring-border object-cover"
                />
              ) : (
                <div className="w-22 h-22 rounded-2xl bg-muted flex items-center justify-center ring-2 ring-border">
                  <UserCircle2 className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
              {/* Active streak dot */}
              {isActiveToday && user.currentStreak > 0 && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-orange-500 ring-2 ring-background flex items-center justify-center">
                  <Flame className="w-2.5 h-2.5 text-white fill-white" />
                </div>
              )}
            </div>

            {/* Identity */}
            <div className="z-10 space-y-1">
              <h2 className="text-lg font-bold text-foreground leading-tight">
                {user.name ?? 'Anonymous Engineer'}
              </h2>
              {user.developerTitle && (
                <p className="text-xs font-semibold text-violet-500">{user.developerTitle}</p>
              )}
              <p className="text-xs text-muted-foreground truncate max-w-[200px] mx-auto">
                {user.email}
              </p>
              {user.username && (
                <Link
                  href={`/u/${user.username}`}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors font-mono"
                >
                  @{user.username}
                </Link>
              )}
            </div>

            {/* Role badge + joined */}
            <div className="z-10 flex flex-col items-center gap-2 w-full pt-2 border-t border-border">
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full
                ${user.role === Role.SUPER_ADMIN ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' :
                  user.role === Role.ADMIN ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                  user.role === Role.EDITOR ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                  user.role === Role.CONTRIBUTOR ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                  'bg-muted text-muted-foreground border border-border'
                }`}
              >
                {user.role.replace('_', ' ')}
              </span>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <CalendarDays className="w-3.5 h-3.5" />
                Member since {joinedMonth}
              </div>
            </div>

            {/* External links */}
            {(user.githubUrl || user.portfolioUrl) && (
              <div className="z-10 flex gap-2 w-full justify-center">
                {user.githubUrl && (
                  <a href={user.githubUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs font-semibold text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg border border-border hover:bg-muted/50 transition-all">
                    GitHub
                  </a>
                )}
                {user.portfolioUrl && (
                  <a href={user.portfolioUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs font-semibold text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg border border-border hover:bg-muted/50 transition-all">
                    Portfolio
                  </a>
                )}
              </div>
            )}
          </div>

          {/* ── BENTO 2: Activity Heatmap + Streak Metrics (col span 2) ── */}
          <div className="md:col-span-2 rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6 flex flex-col gap-5">
            {/* Streak headline metrics */}
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  label: 'Current Streak',
                  value: user.currentStreak,
                  icon: <Flame className={`w-5 h-5 ${user.currentStreak > 0 && isActiveToday ? 'text-orange-500 fill-orange-400' : 'text-muted-foreground/40'}`} />,
                  color: user.currentStreak > 0 && isActiveToday ? 'text-orange-500' : 'text-foreground',
                },
                {
                  label: 'Best Streak',
                  value: user.longestStreak,
                  icon: <Trophy className="w-5 h-5 text-amber-500" />,
                  color: 'text-amber-500',
                },
                {
                  label: 'Contributions',
                  value: totalContributions,
                  icon: <BarChart3 className="w-5 h-5 text-indigo-500" />,
                  color: 'text-indigo-500',
                },
              ].map(({ label, value, icon, color }) => (
                <div key={label} className="flex flex-col items-center justify-center py-4 px-3
                  rounded-xl bg-muted/40 border border-border/50 gap-1.5 text-center">
                  {icon}
                  <p className={`text-3xl font-black tabular-nums leading-none ${color}`}>{value}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
                </div>
              ))}
            </div>

            {/* Activity Heatmap */}
            <div className="flex-1">
              <ActivityHeatmap events={analyticsEvents} />
            </div>
          </div>

          {/* ── BENTO 3: Mission Trophies (col span 1) ────────────────── */}
          <div className="md:col-span-1 rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Mission Trophies</h3>
              {completedRoadmaps.length > 0 && (
                <span className="ml-auto text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  {completedRoadmaps.length} secured
                </span>
              )}
            </div>

            {completedRoadmaps.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-8 text-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-muted/60 border border-border flex items-center justify-center">
                  <Star className="w-6 h-6 text-muted-foreground/40" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">No missions fully secured yet.</p>
                  <p className="text-xs text-muted-foreground/60 mt-1 leading-relaxed max-w-[180px] mx-auto">
                    Complete every node in a roadmap to earn a trophy.
                  </p>
                </div>
                <Link
                  href="/roadmaps"
                  className="mt-2 flex items-center gap-1.5 text-xs font-bold text-violet-500
                    px-3 py-2 rounded-lg border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 transition-all"
                >
                  <Map className="w-3.5 h-3.5" /> Browse Roadmaps
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {completedRoadmaps.map((rm) => (
                  <Link
                    key={rm.id}
                    href={`/roadmaps/${rm.slug}`}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border
                      hover:border-amber-500/30 hover:bg-amber-500/5 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                      <Trophy className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{rm.title}</p>
                      <p className="flex items-center gap-1 text-[10px] text-emerald-500 font-semibold mt-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" /> 100% Complete
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* ── BENTO 4: Settings (col span 2) ────────────────────────── */}
          <div className="md:col-span-2">
            <BentoSettings
              currentName={user.name ?? ''}
              userRole={user.role}
            />
          </div>

        </div>
      </div>
    </main>
  );
}