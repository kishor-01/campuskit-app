// src/app/my-goals/[id]/page.tsx
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { notFound, redirect } from 'next/navigation';
import { createMilestone } from '@/actions/goalActions';
import { PlusCircle } from 'lucide-react';
import MilestoneItem from './MilestoneItem';
import React from 'react';
import ProgressBar from '@/components/ProgressBar';

type Params = { params: { id: string } };

// reusing the same SAMPLE fallback as before for development resilience
const SAMPLE_GOAL_FALLBACK = {
  id: 'fallback-sample-goal',
  title: 'GATE CS & DA 2026 Preparation (Sample)',
  targetDate: new Date('2026-02-06T09:00:00.000Z'),
  milestones: [
    {
      id: 'clt1z0a1b000108l0c2k3f4h5',
      title: 'Digital Logic',
      order: 1,
      topics: [
        {
          id: 'clt1z1b2c000208l0g6j7h8i9',
          title: 'Boolean Algebra',
          order: 1,
          subTopics: [
            {
              id: 'clt1z2c3d000308l0k0l1m2n3',
              title: 'Logic Gates',
              order: 1,
              isCompleted: true,
              linkedResources: []
            },
            {
              id: 'clt1z3d4e000408l0n4o5p6q7',
              title: 'Karnaugh Maps (K-Maps)',
              order: 2,
              isCompleted: false,
              linkedResources: [
                {
                  id: 'clt1z4e5f000508l0r8s9t0u1',
                  personalNote: 'Focus on 4-variable maps. Very important.',
                  resource: {
                    id: 'clrx0yztg000008l0h7f8abcd',
                    name: 'K-Maps Explained - Neso Academy',
                    url: 'https://www.youtube.com/watch?v=...'
                  }
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'clt1z7h8i000808l0d5e6f7g8',
      title: 'Data Structures & Algorithms',
      order: 2,
      topics: [
        {
          id: 'clt1z8i9j000908l0h9i0j1k2',
          title: 'Sorting Algorithms',
          order: 1,
          subTopics: [
            {
              id: 'clt1z9j0k000a08l0l3m4n5o6',
              title: 'Quicksort',
              order: 1,
              isCompleted: true,
              linkedResources: [
                {
                  id: 'clt1zakbl000b08l0p7q8r9s0',
                  personalNote: 'Review the partition logic.',
                  resource: {
                    id: 'clrx1yztg000108l0h7f8defg',
                    name: 'Quicksort Algorithm - GeeksforGeeks',
                    url: 'https://www.geeksforgeeks.org/quick-sort/'
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

export default async function GoalDetailPage({ params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  let goal: any = null;
  let allApprovedResources: any[] = [];
  let dbError: Error | null = null;

  try {
    goal = await prisma.goal.findUnique({
      where: { id: params.id, userId: session.user.id } as any,
      include: {
        milestones: {
          orderBy: { order: 'asc' },
          include: {
            topics: {
              orderBy: { order: 'asc' },
              include: {
                subTopics: {
                  orderBy: { order: 'asc' },
                  include: {
                    linkedResources: {
                      include: {
                        resource: {
                          select: { id: true, name: true, url: true }
                        }
                      }
                    }
                  }
                },
              },
            },
          },
        },
      },
    });

    allApprovedResources = await prisma.resource.findMany({
      where: { status: 'APPROVED' },
      orderBy: { name: 'asc' },
    });

  } catch (err: any) {
    console.error('Could not fetch goal from DB:', err?.message ?? err);
    dbError = err;
    goal = JSON.parse(JSON.stringify(SAMPLE_GOAL_FALLBACK));
    goal.id = params.id;
  }

  if (!goal) notFound();

  // Compute goal-level progress: across all milestones/topics/subtopics
  const { goalTotal, goalCompleted } = (() => {
    let total = 0;
    let completed = 0;
    if (Array.isArray(goal.milestones)) {
      for (const m of goal.milestones) {
        if (!Array.isArray(m.topics)) continue;
        for (const t of m.topics) {
          const subs = Array.isArray(t.subTopics) ? t.subTopics : [];
          total += subs.length;
          completed += subs.filter((s: any) => s.isCompleted).length;
        }
      }
    }
    return { goalTotal: total, goalCompleted: completed };
  })();

  const goalPercent = goalTotal === 0 ? 0 : Math.round((goalCompleted / goalTotal) * 100);

  // Format date / days remaining (serializable)
  let formattedDate: string | null = null;
  let daysRemaining: number | null = null;

  if (goal.targetDate) {
    const target = typeof goal.targetDate === 'string' ? new Date(goal.targetDate) : goal.targetDate;
    if (!Number.isNaN(target.getTime())) {
      formattedDate = target.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      daysRemaining = Math.ceil((target.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {dbError && (
        <div className="mb-6 p-4 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-800">
          <strong>Database connection issue:</strong>
          <p className="mt-1 text-sm">
            Your development database couldn't be reached ({String(dbError?.message).split('\n')[0]}).
            The page is showing fallback sample data so you can continue working locally.
          </p>
        </div>
      )}

      {/* Goal Header */}
      <div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-foreground">{goal.title}</h1>

        <div className="mt-3 max-w-3xl">
          <ProgressBar percent={goalPercent} label={goalTotal === 0 ? 'No sub-topics yet' : `${goalCompleted}/${goalTotal} subtopics completed across goal`} />
        </div>

        {formattedDate && (
          <p className="text-lg text-muted-foreground mt-4">
            Target Date: {formattedDate}
            {daysRemaining !== null && (
              <span className="font-bold text-primary ml-4">{daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Target date has passed'}</span>
            )}
          </p>
        )}
      </div>

      <div className="my-12">
        {/* Create New Milestone Form */}
        <form action={createMilestone} className="flex items-center gap-4 mb-8">
          <input type="hidden" name="goalId" value={goal.id} />
          <input 
            name="title"
            placeholder="Add a new milestone (e.g., 'Semester 5 Subjects')"
            required
            className="flex-grow p-3 bg-input rounded-md"
          />
          <button type="submit" className="flex-shrink-0 flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-md font-semibold hover:bg-primary/90">
            <PlusCircle size={16} /> Add Milestone
          </button>
        </form>

        {/* List of Milestones */}
        <div className="space-y-4">
          {Array.isArray(goal.milestones) && goal.milestones.length > 0 ? (
            goal.milestones.map((milestone: any) => (
              <MilestoneItem key={milestone.id} milestone={milestone} allResources={allApprovedResources} />
            ))
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
              <p className="text-muted-foreground">This goal has no milestones yet.</p>
              <p className="text-muted-foreground">Add one above to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
