// src/app/my-goals/page.tsx
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import CreateGoalButton from '@/components/goals/CreateGoalButton';
import ImportRoadmapButton from '@/components/goals/ImportRoadmapButton';
import GoalCard from '@/components/goals/GoalCard';
import React from 'react';
import { Target, Flame, Clock, Trophy } from 'lucide-react';

export default async function MyGoalsPage() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      redirect('/login');
    }

    const goals = await prisma.goal.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        milestones: {
          include: {
            topics: {
              include: {
                subTopics: true,
              },
            },
          },
        },
      },
    });

    const roadmaps = await prisma.roadmap.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, description: true, slug: true },
    });

    // Compute progress and extract gamification data
    const goalsWithProgress = goals.map((g) => {
      let total = 0;
      let completed = 0;
      if (Array.isArray(g.milestones)) {
        for (const m of g.milestones) {
          if (!Array.isArray(m.topics)) continue;
          for (const t of m.topics) {
            const subs = Array.isArray(t.subTopics) ? t.subTopics : [];
            total += subs.length;
            completed += subs.filter((s) => s.isCompleted).length;
          }
        }
      }
      const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
      return {
        id: g.id,
        title: g.title,
        percent,
        total,
        completed,
        targetDate: g.targetDate ? g.targetDate.toISOString() : null,
        currentStreak: g.currentStreak,
        totalFocusTime: g.totalFocusTime,
        priority: g.priority,
      };
    });

    // Aggregate stats
    const totalGoals = goalsWithProgress.length;
    const overallCompleted = goalsWithProgress.reduce((s, g) => s + g.completed, 0);
    const overallTotal = goalsWithProgress.reduce((s, g) => s + g.total, 0);
    const overallPercent = overallTotal === 0 ? 0 : Math.round((overallCompleted / overallTotal) * 100);
    const activeStreak = Math.max(0, ...goalsWithProgress.map((g) => g.currentStreak || 0));
    const totalFocus = goalsWithProgress.reduce((s, g) => s + (g.totalFocusTime || 0), 0);
    const focusHours = Math.floor(totalFocus / 60);
    const focusMins = totalFocus % 60;

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-8 bg-primary rounded-full" />
              <h1 className="text-4xl md:text-5xl font-extrabold text-foreground">
                Goal Architect
              </h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Your gamified command center for tracking, building, and conquering goals.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <CreateGoalButton />
            <ImportRoadmapButton roadmaps={roadmaps} />
          </div>
        </div>

        {/* Stats Summary Bar */}
        {totalGoals > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Target size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalGoals}</p>
                <p className="text-xs text-muted-foreground font-medium">Active Goals</p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                <Trophy size={18} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{overallPercent}%</p>
                <p className="text-xs text-muted-foreground font-medium">Overall Progress</p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <Flame size={18} className="text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{activeStreak}d</p>
                <p className="text-xs text-muted-foreground font-medium">Best Streak</p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Clock size={18} className="text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {focusHours > 0 ? `${focusHours}h` : `${focusMins}m`}
                </p>
                <p className="text-xs text-muted-foreground font-medium">Focus Time</p>
              </div>
            </div>
          </div>
        )}

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goalsWithProgress.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>

        {goalsWithProgress.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed border-muted rounded-2xl">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <Target size={32} className="text-primary/50" />
            </div>
            <p className="text-lg font-medium text-foreground mb-1">No goals yet</p>
            <p className="text-muted-foreground">
              Click &quot;Create New Goal&quot; or &quot;Import Roadmap&quot; to start your journey!
            </p>
          </div>
        )}
      </div>
    );
  } catch (err) {
    console.error('MyGoalsPage server error:', err);
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <div className="mx-auto mb-6 w-24 h-24 rounded-full flex items-center justify-center animate-spin-slow" style={{ border: '6px solid rgba(0,0,0,0.06)', borderTopColor: 'hsl(var(--primary))' }} />
          <h2 className="text-2xl font-bold mb-2">Working on it…</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            We hit a small hiccup fetching your goals. Our dev squirrels are on it — try refreshing in a moment.
          </p>
        </div>

        <style>{`
          .animate-spin-slow { animation: spin 1.6s linear infinite; }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}
        </style>
      </div>
    );
  }
}
