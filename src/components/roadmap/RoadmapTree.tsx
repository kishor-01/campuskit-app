// src/components/roadmap/RoadmapTree.tsx
'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import RoadmapNode from './RoadmapNode';
import NodeDrawer from './NodeDrawer';
import { completeStepAction } from '@/actions/roadmapActions';

type Resource = {
  id: string;
  name: string;
  url: string;
};

type Step = {
  id: string;
  title: string;
  description: string;
  order: number;
  status: 'COMPLETED' | 'ACTIVE' | 'INCOMPLETE';
  resources: Resource[];
  branch?: { title: string; color?: string | null } | null;
  deepDiveUrl?: string | null;
  quickRefUrl?: string | null;
};

type RoadmapTreeProps = {
  steps: Step[];
};

export default function RoadmapTree({ steps }: RoadmapTreeProps) {
  const [completedIds, setCompletedIds] = React.useState<string[]>(() =>
    steps.filter((s) => s.status === 'COMPLETED').map((s) => s.id)
  );
  const [selectedStepId, setSelectedStepId] = React.useState<string | null>(null);
  const [isMutating, setIsMutating] = React.useState(false);

  // Sync state with props when parent server component revalidates/re-renders
  React.useEffect(() => {
    setCompletedIds(steps.filter((s) => s.status === 'COMPLETED').map((s) => s.id));
  }, [steps]);

  // Compute step statuses dynamically based on local completions
  const computedSteps = React.useMemo(() => {
    let foundActive = false;
    return steps.map((step) => {
      const isCompleted = completedIds.includes(step.id);
      let status: 'COMPLETED' | 'ACTIVE' | 'INCOMPLETE' = 'INCOMPLETE';
      if (isCompleted) {
        status = 'COMPLETED';
      } else if (!foundActive) {
        status = 'ACTIVE';
        foundActive = true;
      }
      return {
        ...step,
        status,
      };
    });
  }, [steps, completedIds]);

  const handleNodeClick = (step: Step) => {
    setSelectedStepId(step.id);
  };

  const handleCloseDrawer = () => {
    setSelectedStepId(null);
  };

  const handleToggleComplete = async (stepId: string) => {
    if (isMutating) return;

    const wasCompleted = completedIds.includes(stepId);
    
    // 1. Optimistic Update
    setCompletedIds((prev) =>
      wasCompleted ? prev.filter((id) => id !== stepId) : [...prev, stepId]
    );

    setIsMutating(true);
    try {
      const result = await completeStepAction(stepId, !wasCompleted);
      if (result && 'error' in result && result.error) {
        // Rollback
        setCompletedIds((prev) =>
          wasCompleted ? [...prev, stepId] : prev.filter((id) => id !== stepId)
        );
        toast.error(result.error);
      } else {
        toast.success(wasCompleted ? 'Step marked as incomplete' : 'Step marked as complete! 🎉');
      }
    } catch (err) {
      // Rollback
      setCompletedIds((prev) =>
        wasCompleted ? [...prev, stepId] : prev.filter((id) => id !== stepId)
      );
      toast.error('Failed to update step completion status. Please try again.');
    } finally {
      setIsMutating(false);
    }
  };

  const selectedStep = React.useMemo(() => {
    if (!selectedStepId) return null;
    return computedSteps.find((s) => s.id === selectedStepId) || null;
  }, [selectedStepId, computedSteps]);

  if (steps.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground border border-dashed rounded-2xl bg-muted/10">
        No steps available for this roadmap.
      </div>
    );
  }

  return (
    <div className="relative w-full py-8 md:py-12">
      {/* The Line */}
      <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2" />

      {/* The Nodes */}
      <div className="space-y-8 md:space-y-12">
        {computedSteps.map((step, index) => {
          const isEven = index % 2 === 0;
          const isCompleted = step.status === 'COMPLETED';
          const isActive = step.status === 'ACTIVE';

          return (
            <div key={step.id} className="relative w-full min-h-[90px]">
              {/* The Marker */}
              <button
                onClick={() => handleNodeClick(step)}
                className={`absolute left-4 md:left-1/2 top-5 w-8 h-8 rounded-full border-2 flex items-center justify-center -translate-x-1/2 z-10 transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none
                  ${isCompleted
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : isActive
                      ? 'bg-background border-primary text-primary ring-4 ring-primary/20 animate-pulse font-bold'
                      : 'bg-background border-muted text-muted-foreground hover:border-primary/50'
                  }
                `}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className="text-[10px] font-bold">{step.order}</span>
                )}
              </button>

              {/* The Node Card Wrapper */}
              <div
                className={`w-full md:w-1/2
                  ${isEven
                    ? 'md:mr-auto md:pr-8 md:text-right md:flex md:justify-end'
                    : 'md:ml-auto md:pl-8 md:flex md:justify-start'
                  }
                  ml-8 md:ml-0
                `}
              >
                <div className="w-full max-w-md">
                  <RoadmapNode step={step} onClick={() => handleNodeClick(step)} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Slide drawer for step details */}
      <NodeDrawer
        isOpen={!!selectedStep}
        onClose={handleCloseDrawer}
        step={selectedStep}
        onToggleComplete={handleToggleComplete}
        isMutating={isMutating}
      />
    </div>
  );
}
