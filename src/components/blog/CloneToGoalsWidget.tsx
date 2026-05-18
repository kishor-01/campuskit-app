// src/components/blog/CloneToGoalsWidget.tsx
'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { cloneBlueprintToGoal } from '@/actions';
import { Blocks, Loader2, CheckCircle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface CloneToGoalsWidgetProps {
  articleId: string;
  articleTitle: string;
}

/**
 * High-visibility CTA badge for articles with a clonableBlueprint.
 * Clicking fires the cloneBlueprintToGoal server action,
 * which creates a new Goal with Milestones and Topics,
 * auto-saves the article, and redirects to /my-goals/[id].
 */
export default function CloneToGoalsWidget({ articleId, articleTitle }: CloneToGoalsWidgetProps) {
  const [isPending, startTransition] = useTransition();
  const [isCloned, setIsCloned] = useState(false);
  const router = useRouter();

  const handleClone = () => {
    startTransition(async () => {
      try {
        const result = await cloneBlueprintToGoal(articleId);

        if (result.error) {
          toast.error(result.error);
          return;
        }

        if (result.success && result.goalId) {
          setIsCloned(true);
          toast.success('Project cloned to your Goals!');
          // Brief delay for the success animation
          setTimeout(() => {
            router.push(`/my-goals/${result.goalId}`);
          }, 800);
        }
      } catch (err) {
        console.error('Clone error:', err);
        toast.error('Something went wrong. Please try again.');
      }
    });
  };

  return (
    <button
      onClick={handleClone}
      disabled={isPending || isCloned}
      className={`
        group relative w-full rounded-xl border-2 p-4 transition-all duration-300 text-left
        ${isCloned
          ? 'border-emerald-500 bg-emerald-500/10 cursor-default'
          : 'border-dashed border-primary/40 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 hover:border-primary hover:shadow-lg hover:shadow-primary/10 cursor-pointer'
        }
      `}
    >
      <div className="flex items-center gap-4">
        <div className={`
          flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300
          ${isCloned
            ? 'bg-emerald-500/20'
            : 'bg-primary/10 group-hover:bg-primary/20 group-hover:scale-110'
          }
        `}>
          {isCloned ? (
            <CheckCircle className="w-6 h-6 text-emerald-500" />
          ) : isPending ? (
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          ) : (
            <Blocks className="w-6 h-6 text-primary" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold ${isCloned ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
            {isCloned ? '✅ Project Added to Your Goals!' : '🏗️ Build this Project — Add to My Goals'}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
            {isCloned
              ? 'Redirecting to your goal dashboard...'
              : `Clone "${articleTitle}" milestones and topics into your personal tracker`
            }
          </p>
        </div>

        {!isCloned && !isPending && (
          <ArrowRight className="w-5 h-5 text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
        )}
      </div>
    </button>
  );
}
