// src/components/profile/GoalArchitectWidget.tsx
'use client';

import { Target, ArrowRight, PlusCircle, Calendar } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

// A simple progress bar component with enhanced animation
const ProgressBar = ({ percent }: { percent: number }) => {
  const hue = (percent / 100) * 120; // 0=red, 120=green
  return (
    <div className="w-full bg-muted rounded-full h-1.5">
      <motion.div
        className="h-1.5 rounded-full"
        style={{ background: `hsl(${hue}, 70%, 50%)` }}
        initial={{ width: 0 }}
        whileInView={{ width: `${percent}%` }}
        viewport={{ once: true, amount: 0.8 }} // Animate when 80% of it is in view
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
};

// Helper function to calculate days remaining
function calculateDaysRemaining(targetDate: string | null): number | null {
    if (!targetDate) return null;
    const target = new Date(targetDate);
    const now = new Date();
    target.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - now.getTime();
    if (diffTime < 0) return 0;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

interface GoalArchitectWidgetProps {
  goals: { id: string; title: string; percent: number; createdAt: string; targetDate: string | null }[];
}

export default function GoalArchitectWidget({ goals }: GoalArchitectWidgetProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Target size={20} className="text-primary" />
          Goal Architect
        </h3>
        <Link href="/my-goals" className="text-sm font-semibold text-primary hover:underline">
          View All
        </Link>
      </div>

      {goals.length > 0 ? (
        <div className="space-y-4 flex-grow">
          {goals.map(goal => {
              const daysRemaining = calculateDaysRemaining(goal.targetDate);
              const startDate = new Date(goal.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              return(
                <Link href={`/my-goals/${goal.id}`} key={goal.id} className="block p-3 rounded-md hover:bg-muted transition-colors">
                    <div className="flex justify-between items-center mb-1">
                        <p className="text-sm font-medium text-foreground truncate">{goal.title}</p>
                        <p className="text-xs font-mono text-muted-foreground">{goal.percent}%</p>
                    </div>
                    <ProgressBar percent={goal.percent} />
                    <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                        <span>Started: {startDate}</span>
                        {daysRemaining !== null && (
                            <span className="flex items-center gap-1">
                                <Calendar size={12}/> {daysRemaining} days left
                            </span>
                        )}
                    </div>
                </Link>
              )
          })}
        </div>
      ) : (
        <div className="text-center flex-grow flex flex-col items-center justify-center my-4">
            <p className="text-sm text-muted-foreground">No goals set yet.</p>
            <p className="text-xs text-muted-foreground">Start by creating or importing a roadmap.</p>
        </div>
      )}

      <Link href="/my-goals" className="mt-4 w-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-primary-foreground bg-primary px-4 py-2 rounded-lg hover:bg-primary/hover">
        <PlusCircle size={16} />
        Create New Goal
      </Link>
    </div>
  );
}

