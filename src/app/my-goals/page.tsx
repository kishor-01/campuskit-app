// src/app/my-goals/page.tsx
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import CreateGoalButton from '@/components/goals/CreateGoalButton';
import ImportRoadmapButton from '@/components/goals/ImportRoadmapButton';
import GoalCard from '@/components/goals/GoalCard';
import Link from 'next/link';
import ProgressBar from '@/components/ProgressBar';
import React from 'react';

export default async function MyGoalsPage() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      redirect('/login'); // Protect this page
    }

    // Fetch goals with nested milestones/topics/subTopics so we can compute progress.
    // For large datasets consider replacing with lightweight counts / pagination.
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

    // Fetch published roadmaps for the Import Roadmap modal (pass minimal fields)
    const roadmaps = await prisma.roadmap.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, description: true, slug: true },
    });

    // Map to a lighter object with computed counts to pass to the client
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
      };
    });

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">
              My Goal Architect
            </h1>
            <p className="text-lg text-muted-foreground">
              Your personal space to plan, track, and achieve your goals.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <CreateGoalButton />
            {/* Import Roadmap button (new) - passes roadmaps fetched on the server */}
            <ImportRoadmapButton roadmaps={roadmaps} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {goalsWithProgress.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>

        {goalsWithProgress.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed border-muted rounded-lg">
            <p className="text-muted-foreground">You haven't created any goals yet.</p>
            <p className="text-muted-foreground">Click "Create New Goal" or "Import Roadmap" to get started!</p>
          </div>
        )}
      </div>
    );
  } catch (err) {
    // If anything goes wrong (DB down, auth failure, etc.), show a friendly fallback
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
        `}</style>
      </div>
    );
  }
}
