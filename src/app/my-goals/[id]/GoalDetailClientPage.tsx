// src/app/my-goals/[id]/GoalDetailClientPage.tsx
'use client';

// FIX: Import 'useActionState' from 'react' instead of 'react-dom'
import { useActionState, useEffect, useRef } from 'react';
import { createMilestone, deleteMilestone } from '@/actions';
import { PlusCircle } from 'lucide-react';
import MilestoneItem from './MilestoneItem';
import ProgressBar from '@/components/ProgressBar';
import { toast } from 'react-hot-toast';
import { SubmitButton } from '@/components/admin/SubmitButton';
import type { Goal, Milestone, Topic, SubTopic, Resource, GoalResource, TopicResource } from '@prisma/client';

// Define the complex nested types for props
type LinkedResourceRow = { id?: string; resourceId: string; personalNote: string | null; resource: { id?: string; name: string; url?: string }; };
type SubTopicWithLinks = SubTopic & { linkedResources: (GoalResource & { resource: { name: string, url: string } })[]; note?: string | null };
type TopicWithSubTopics = Topic & { subTopics: SubTopicWithLinks[]; linkedResources: (TopicResource & { resource: { name: string, url: string } })[] ; note?: string | null };
type MilestoneWithTopics = Milestone & { topics: TopicWithSubTopics[] };
type GoalWithMilestones = Goal & { milestones: MilestoneWithTopics[] };

export default function GoalDetailClientPage({
  goal,
  allResources,
}: {
  goal: GoalWithMilestones;
  allResources: Resource[];
}) {
  // FIX: Switched from useFormState to useActionState
  const [createState, createAction] = useActionState(createMilestone, { message: null, error: null });
  const [deleteState, deleteAction] = useActionState(deleteMilestone, { message: null, error: null });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (createState?.message) {
      toast.success(createState.message);
      formRef.current?.reset();
    }
    if (createState?.error) {
      toast.error(createState.error);
    }
  }, [createState]);

  useEffect(() => {
    if (deleteState?.message) {
      toast.success(deleteState.message);
    }
    if (deleteState?.error) {
      toast.error(deleteState.error);
    }
  }, [deleteState]);

  const { goalTotal, goalCompleted } = (() => {
    let total = 0;
    let completed = 0;
    for (const m of goal.milestones) {
      for (const t of m.topics) {
        total += t.subTopics.length;
        completed += t.subTopics.filter((s: any) => s.isCompleted).length;
      }
    }
    return { goalTotal: total, goalCompleted: completed };
  })();
  const goalPercent = goalTotal === 0 ? 0 : Math.round((goalCompleted / goalTotal) * 100);
  let formattedDate: string | null = null;
  let daysRemaining: number | null = null;
  if (goal.targetDate) {
    const target = new Date(goal.targetDate);
    formattedDate = target.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    daysRemaining = Math.ceil((target.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-foreground">{goal.title}</h1>
        <div className="mt-3 max-w-3xl">
          <ProgressBar percent={goalPercent} label={goalTotal === 0 ? 'No sub-topics yet' : `${goalCompleted}/${goalTotal} subtopics completed`} />
        </div>
        {formattedDate && (
          <p className="text-lg text-muted-foreground mt-4">
            Target Date: {formattedDate}
            {daysRemaining !== null && (
              <span className={`font-bold ml-4 ${daysRemaining > 0 ? 'text-primary' : 'text-destructive'}`}>
                {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Target date has passed'}
              </span>
            )}
          </p>
        )}
      </div>

      <div className="my-12">
        <form ref={formRef} action={createAction} className="flex items-center gap-4 mb-8">
          <input type="hidden" name="goalId" value={goal.id} />
          <input
            name="title"
            placeholder="Add a new milestone (e.g., 'Semester 5 Subjects')"
            required
            className="flex-grow p-3 bg-input rounded-md"
          />
          <SubmitButton text="Add Milestone" />
        </form>

        <div className="space-y-4">
          {goal.milestones.length > 0 ? (
            goal.milestones.map((milestone) => (
              <MilestoneItem 
                key={milestone.id} 
                milestone={milestone} 
                allResources={allResources} 
                deleteAction={deleteAction} 
              />
            ))
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
              <p className="text-muted-foreground">This goal has no milestones yet. Add one to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

