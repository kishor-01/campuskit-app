// src/app/dashboard/page.tsx
// Student Command Center — Personal learning home base
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { getUserDashboardDataAction, getRecommendedOpportunitiesAction } from '@/actions/dashboardActions';
import OnboardingMatrix from '@/components/dashboard/OnboardingMatrix';
import OpportunityCard from '@/components/OpportunityCard';
import Link from 'next/link';
import Image from 'next/image';
import {
  Zap, CheckCircle2, BarChart3, ArrowRight, BookOpen,
  Flame, Trophy, Map, ChevronRight, Crosshair, Sparkles,
} from 'lucide-react';

export const metadata = {
  title: 'Mission Control — Seniofy',
  description: 'Your personal learning dashboard. Track progress and resume your next mission.',
};

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressBar({ pct }: { pct: number }) {
  const capped = Math.min(100, Math.max(0, pct));
  return (
    <div className="relative w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
      <div
        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-700"
        style={{ width: `${capped}%` }}
      />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/');

  // Parallel-fetch dashboard data and streak stats
  const [dashboardData, userStats, totalContributions, recommendedOpportunities] = await Promise.all([
    getUserDashboardDataAction(),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        currentStreak: true,
        longestStreak: true,
        lastActiveAt: true,
      },
    }),
    prisma.analyticsEvent.count({ where: { userId: session.user.id } }),
    getRecommendedOpportunitiesAction(),
  ]);

  if (!dashboardData) redirect('/');

  const { user, activeRoadmaps } = dashboardData;
  const firstName = user.name?.split(' ')[0] ?? 'Engineer';

  // ── Cold-Start Interceptor ───────────────────────────────────────────────
  // Brand-new users with no progress get the roadmap picker instead of a dead
  // empty dashboard. The ambient shell stays so the page feels consistent.
  if (activeRoadmaps.length === 0) {
    return (
      <main className="min-h-screen bg-[#020817] text-slate-100 font-sans">
        <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
          <div className="absolute top-0 left-1/4 w-[600px] h-[300px] rounded-full bg-violet-600/6 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[300px] rounded-full bg-indigo-600/5 blur-[100px]" />
        </div>
        <OnboardingMatrix firstName={firstName} />
      </main>
    );
  }

  // Is streak alive today?
  let isActiveToday = false;
  if (userStats?.lastActiveAt) {
    const now = new Date();
    const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const la = userStats.lastActiveAt;
    const laUTC = Date.UTC(la.getUTCFullYear(), la.getUTCMonth(), la.getUTCDate());
    isActiveToday = todayUTC === laUTC;
  }

  const streak = userStats?.currentStreak ?? 0;
  const longestStreak = userStats?.longestStreak ?? 0;

  return (
    <main className="min-h-screen bg-[#020817] text-slate-100 font-sans">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute top-0 left-1/4 w-[600px] h-[300px] rounded-full bg-violet-600/6 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[300px] rounded-full bg-indigo-600/5 blur-[100px]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-12">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-4">
            {user.image && (
              <div className="relative flex-shrink-0">
                <Image
                  src={user.image}
                  alt={user.name ?? 'User'}
                  width={56}
                  height={56}
                  className="w-14 h-14 rounded-2xl ring-2 ring-violet-500/30"
                />
                {isActiveToday && streak > 0 && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center ring-2 ring-slate-950">
                    <Flame className="w-2.5 h-2.5 text-white fill-white" />
                  </div>
                )}
              </div>
            )}
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                Mission Control
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
                Welcome back, {firstName}.
              </h1>
              <p className="text-slate-500 text-sm mt-0.5">
                {activeRoadmaps.length > 0
                  ? `${activeRoadmaps.length} active mission${activeRoadmaps.length > 1 ? 's' : ''} in progress.`
                  : 'No active missions yet. Start a roadmap to begin.'}
              </p>
            </div>
          </div>

          <Link
            href="/roadmaps"
            className="self-start sm:self-center flex items-center gap-1.5 px-4 py-2.5 rounded-xl
              text-xs font-bold text-violet-400 border border-violet-500/30 bg-violet-500/10
              hover:bg-violet-500/20 transition-all duration-200"
          >
            <Map className="w-3.5 h-3.5" />
            Browse Roadmaps
          </Link>
        </div>

        {/* ── Streak Stats ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: 'Current Streak',
              value: streak,
              icon: <Flame className={`w-5 h-5 ${streak > 0 && isActiveToday ? 'text-orange-500 fill-orange-400' : 'text-slate-600'}`} />,
              color: streak > 0 && isActiveToday ? 'text-orange-400' : 'text-slate-500',
            },
            {
              label: 'Best Streak',
              value: longestStreak,
              icon: <Trophy className="w-5 h-5 text-amber-400" />,
              color: 'text-amber-400',
            },
            {
              label: 'Contributions',
              value: totalContributions,
              icon: <BarChart3 className="w-5 h-5 text-indigo-400" />,
              color: 'text-indigo-400',
            },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="flex flex-col items-center justify-center py-5 px-4 rounded-2xl
              bg-slate-900/60 border border-slate-800/60 text-center gap-2">
              {icon}
              <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Active Missions ───────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              Active Missions
            </h2>
            <span className="text-[10px] font-bold text-slate-600 bg-slate-900/60 border border-slate-800/50 px-2 py-1 rounded-full">
              {activeRoadmaps.length} roadmap{activeRoadmaps.length !== 1 ? 's' : ''}
            </span>
          </div>

          {activeRoadmaps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 rounded-2xl
              border border-dashed border-slate-800/60 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
                <Map className="w-6 h-6 text-slate-600" />
              </div>
              <p className="text-sm font-semibold text-slate-500 mb-1">No active missions</p>
              <p className="text-xs text-slate-600 mb-5">Complete your first node on a roadmap to start tracking progress.</p>
              <Link
                href="/roadmaps"
                className="flex items-center gap-1.5 text-xs font-bold text-violet-400 px-4 py-2 rounded-xl
                  border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 transition-all"
              >
                Explore Roadmaps <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {activeRoadmaps.map((roadmap) => {
                const resumeHref = roadmap.nextActionableNodeId
                  ? `/roadmaps/${roadmap.slug}?nodeId=${roadmap.nextActionableNodeId}`
                  : `/roadmaps/${roadmap.slug}`;

                return (
                  <div
                    key={roadmap.roadmapId}
                    className="group relative flex flex-col rounded-2xl border border-slate-800/60 bg-slate-900/50
                      hover:border-violet-500/30 hover:bg-slate-900/80 transition-all duration-300
                      overflow-hidden"
                  >
                    {/* Hover glow accent */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="p-5 flex flex-col gap-4 flex-1">
                      {/* Icon + Title */}
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20
                          flex items-center justify-center flex-shrink-0 mt-0.5">
                          <BookOpen className="w-4.5 h-4.5 text-violet-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-slate-200 leading-tight truncate">
                            {roadmap.title}
                          </h3>
                          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mt-1">
                            {roadmap.description}
                          </p>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            Progress
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 tabular-nums">
                              {roadmap.completedNodes}/{roadmap.totalNodes}
                            </span>
                            <span className={`text-[10px] font-bold tabular-nums
                              ${roadmap.progressPercentage === 100 ? 'text-emerald-400' : 'text-violet-400'}`}>
                              {roadmap.progressPercentage}%
                            </span>
                          </div>
                        </div>
                        <ProgressBar pct={roadmap.progressPercentage} />
                      </div>

                      {/* Status chips */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          {roadmap.completedNodes} secured
                        </span>
                        {roadmap.nextActionableNodeId && (
                          <span className="flex items-center gap-1 text-[9px] font-bold text-violet-400 bg-violet-500/10 px-2 py-1 rounded-full border border-violet-500/20 animate-pulse">
                            <Zap className="w-2.5 h-2.5" />
                            Next action ready
                          </span>
                        )}
                        {roadmap.progressPercentage === 100 && (
                          <span className="flex items-center gap-1 text-[9px] font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full border border-amber-500/20">
                            <Trophy className="w-2.5 h-2.5" />
                            Complete!
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Resume button */}
                    <div className="px-5 pb-5">
                      <Link
                        href={resumeHref}
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl
                          font-bold text-sm text-white transition-all duration-200
                          bg-gradient-to-r from-violet-600 to-indigo-600
                          hover:from-violet-500 hover:to-indigo-500
                          hover:shadow-[0_0_20px_rgba(139,92,246,0.35)]
                          active:scale-[0.98]"
                      >
                        {roadmap.progressPercentage === 100 ? (
                          <><Trophy className="w-4 h-4" /> Review Roadmap</>
                        ) : (
                          <><Zap className="w-4 h-4" /> Resume Learning</>
                        )}
                        <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Career Bridge — Recommended Opportunities ───────────────── */}
        {recommendedOpportunities.length > 0 && (
          <div>
            {/* Section Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                {/* Glowing icon */}
                <div className="relative w-8 h-8 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-500/20 to-indigo-500/20 blur-sm" />
                  <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/10 to-indigo-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Crosshair className="w-4 h-4 text-amber-400" />
                  </div>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-200 tracking-tight">Target Coordinates Acquired</h2>
                  <p className="text-[10px] text-slate-500 mt-0.5">Opportunities matched to your active missions</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-full uppercase tracking-wider">
                  {recommendedOpportunities.length} match{recommendedOpportunities.length !== 1 ? 'es' : ''} found
                </span>
              </div>
            </div>

            {/* Gradient top accent line */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-500/30 to-indigo-500/20 mb-5" />

            {/* Opportunity cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {recommendedOpportunities.map((opp) => (
                <div key={opp.id} className="relative">
                  {/* Match Found badge */}
                  <div className="absolute -top-2 -right-1 z-10 flex items-center gap-1 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow-lg shadow-amber-500/20">
                    <Crosshair className="w-2.5 h-2.5" />
                    Match
                  </div>
                  <OpportunityCard opportunity={opp} />
                </div>
              ))}
            </div>

            <div className="mt-5 text-center">
              <Link
                href="/opportunities"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-amber-400 transition-colors"
              >
                View all opportunities <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
