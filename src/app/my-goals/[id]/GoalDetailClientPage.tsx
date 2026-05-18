// src/app/my-goals/[id]/GoalDetailClientPage.tsx
'use client';

// FIX: Import 'useActionState' from 'react' instead of 'react-dom'
import { useActionState, useEffect, useRef, useState, useTransition } from 'react';
import { createMilestone, deleteMilestone } from '@/actions';
import { PlusCircle, Flame, Clock, Calendar, Brain, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import MilestoneItem from './MilestoneItem';
import ProgressRing from '@/components/goals/ProgressRing';
import { toast } from 'react-hot-toast';
import { SubmitButton } from '@/components/admin/SubmitButton';
import { useRouter } from 'next/navigation';
import type { Goal, Milestone, Topic, SubTopic, Resource, GoalResource, TopicResource } from '@prisma/client';
import { motion, AnimatePresence } from 'framer-motion';

// Define the complex nested types for props
type LinkedResourceRow = { id?: string; resourceId: string; personalNote: string | null; resource: { id?: string; name: string; url?: string }; };
type SubTopicWithLinks = SubTopic & { linkedResources: (GoalResource & { resource: { name: string, url: string } })[]; note?: string | null };
type TopicWithSubTopics = Topic & { subTopics: SubTopicWithLinks[]; linkedResources: (TopicResource & { resource: { name: string, url: string } })[] ; note?: string | null };
type MilestoneWithTopics = Milestone & { topics: TopicWithSubTopics[] };
type GoalWithMilestones = Goal & { milestones: MilestoneWithTopics[] };

const priorityConfig: Record<string, { label: string; color: string }> = {
  LOW: { label: 'Low', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  MEDIUM: { label: 'Medium', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  HIGH: { label: 'High', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  CRITICAL: { label: 'Critical', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
};

export default function GoalDetailClientPage({
  goal,
  allResources,
}: {
  goal: GoalWithMilestones;
  allResources: Resource[];
}) {
  // FIX: Switched from useFormState to useActionState
  const [createState, createAction] = useActionState<any, any>(createMilestone as any, { message: null, error: null });
  const [deleteState, deleteAction] = useActionState<any, any>(deleteMilestone as any, { message: null, error: null });
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [showStudyPlan, setShowStudyPlan] = useState(false);
  const [studyPlan, setStudyPlan] = useState<any>(goal.aiStudyPlan || null);

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

  const pConfig = priorityConfig[goal.priority || 'MEDIUM'] || priorityConfig.MEDIUM;
  const focusHours = Math.floor((goal.totalFocusTime || 0) / 60);
  const focusMins = (goal.totalFocusTime || 0) % 60;

  // Generate AI Study Plan
  const handleGeneratePlan = async () => {
    if (!goal.targetDate) {
      toast.error('Set a target date first to generate a study plan.');
      return;
    }
    setIsGeneratingPlan(true);
    try {
      const res = await fetch('/api/goals/generate-study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalId: goal.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error ?? 'Failed to generate study plan');
      } else {
        setStudyPlan(data);
        setShowStudyPlan(true);
        toast.success('🧠 AI Study Plan generated!');
        router.refresh();
      }
    } catch (err) {
      console.error('Study plan error', err);
      toast.error('Failed to generate study plan');
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row gap-8 mb-10">
        {/* Left: Info */}
        <div className="flex-grow">
          <div className="flex items-center gap-3 mb-3">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${pConfig.color}`}>
              {pConfig.label} Priority
            </span>

            {(goal.currentStreak || 0) > 0 && (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 streak-glow">
                <Flame size={12} />
                {goal.currentStreak}-day streak
              </span>
            )}

            {(goal.currentStreak || 0) >= 3 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                🏅 Deep Work
              </span>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">{goal.title}</h1>

          {/* Date + Focus stats */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            {formattedDate && (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar size={14} />
                {formattedDate}
                {daysRemaining !== null && (
                  <span className={`font-bold ml-1 ${daysRemaining > 0 ? 'text-primary' : 'text-destructive'}`}>
                    {daysRemaining > 0 ? `(${daysRemaining}d left)` : '(overdue)'}
                  </span>
                )}
              </span>
            )}

            {(goal.totalFocusTime || 0) > 0 && (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Clock size={14} />
                {focusHours > 0 ? `${focusHours}h ${focusMins}m` : `${focusMins}m`} focused
              </span>
            )}

            {goal.longestStreak > 0 && (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Flame size={14} />
                Longest: {goal.longestStreak}d
              </span>
            )}
          </div>
        </div>

        {/* Right: Progress Ring */}
        <div className="flex flex-col items-center justify-center">
          <ProgressRing
            percent={goalPercent}
            size={130}
            strokeWidth={10}
            label={goalTotal === 0 ? 'No tasks yet' : `${goalCompleted}/${goalTotal}`}
          />
        </div>
      </div>

      {/* AI Study Plan Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={handleGeneratePlan}
            disabled={isGeneratingPlan}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/80 to-blue-500/80
                       text-white rounded-lg text-sm font-bold hover:from-purple-500 hover:to-blue-500
                       transition-all duration-300 disabled:opacity-50 shadow-md shadow-purple-500/10"
          >
            {isGeneratingPlan ? (
              <>
                <Sparkles size={14} className="animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Brain size={14} />
                {studyPlan ? 'Regenerate AI Study Plan' : 'Generate AI Study Plan'}
              </>
            )}
          </button>

          {studyPlan && (
            <button
              onClick={() => setShowStudyPlan(!showStudyPlan)}
              className="flex items-center gap-1 px-3 py-2 bg-muted/50 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
            >
              {showStudyPlan ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {showStudyPlan ? 'Hide Plan' : 'Show Plan'}
            </button>
          )}
        </div>

        <AnimatePresence>
          {showStudyPlan && studyPlan && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-card border border-border rounded-2xl p-6 mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <Brain size={18} className="text-purple-400" />
                  <h3 className="text-lg font-bold">AI Study Plan</h3>
                </div>

                {studyPlan.summary && (
                  <p className="text-sm text-muted-foreground italic mb-4 p-3 bg-muted/30 rounded-lg">
                    &ldquo;{studyPlan.summary}&rdquo;
                  </p>
                )}

                {/* Weekly Routine */}
                {studyPlan.weeklyRoutine && Array.isArray(studyPlan.weeklyRoutine) && (
                  <div className="mb-4">
                    <h4 className="text-sm font-bold text-foreground mb-2">Weekly Routine</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {studyPlan.weeklyRoutine.map((day: any, i: number) => (
                        <div key={i} className="bg-muted/30 p-3 rounded-lg border border-border">
                          <p className="text-xs font-bold text-primary uppercase">{day.day}</p>
                          <p className="text-sm font-medium text-foreground">{day.focus}</p>
                          {day.tasks && (
                            <ul className="mt-1.5 space-y-0.5">
                              {day.tasks.map((task: string, j: number) => (
                                <li key={j} className="text-xs text-muted-foreground">• {task}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Milestones */}
                {studyPlan.milestones && Array.isArray(studyPlan.milestones) && (
                  <div className="mb-4">
                    <h4 className="text-sm font-bold text-foreground mb-2">Key Milestones</h4>
                    <div className="space-y-1.5">
                      {studyPlan.milestones.map((m: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                            {i + 1}
                          </span>
                          <span className="text-foreground font-medium">{m.title}</span>
                          <span className="text-muted-foreground text-xs">— {m.timing}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tips */}
                {studyPlan.tips && Array.isArray(studyPlan.tips) && (
                  <div>
                    <h4 className="text-sm font-bold text-foreground mb-2">💡 Tips</h4>
                    <ul className="space-y-1">
                      {studyPlan.tips.map((tip: string, i: number) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <span className="text-primary mt-0.5">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Milestones Section */}
      <div className="my-8">
        <form ref={formRef} action={createAction} className="flex items-center gap-4 mb-8">
          <input type="hidden" name="goalId" value={goal.id} />
          <input
            name="title"
            placeholder="Add a new milestone (e.g., 'Semester 5 Subjects')"
            required
            className="flex-grow p-3 bg-input rounded-lg border border-border focus:border-primary transition-colors"
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
            <div className="text-center py-12 border-2 border-dashed border-muted rounded-2xl">
              <p className="text-muted-foreground">This goal has no milestones yet. Add one to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
