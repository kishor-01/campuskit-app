// src/app/roadmaps/[slug]/StrategicCommandCenter.tsx
'use client';

import React, { useState, useMemo, useTransition, useEffect } from 'react';
import { ShieldAlert, Loader2, Check, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  completeStepAction,
  saveUserMissionPlanAction,
  createCustomStepAction
} from '@/actions';
import SpatialInvestigationBoard from './SpatialInvestigationBoard';
import DeepDiveOverlay from './DeepDiveOverlay';
import { ResourceWithCategory } from '@/components/ResourceCard';

type Step = {
  id: string;
  title: string;
  description: string;
  order: number;
  resources: ResourceWithCategory[];
  branch?: { title: string; color?: string | null } | null;
  deepDiveUrl?: string | null;
  quickRefUrl?: string | null;
  isCustom?: boolean;
};

interface StrategicCommandCenterProps {
  roadmap: {
    id: string;
    title: string;
    slug: string;
    description: string;
  };
  initialSteps: Step[];
  initialActiveIds: string[];
  initialCompletedIds: string[];
  initialNotes: Record<string, string>;
  initialPositions: Record<string, { x: number; y: number }>;
  initialStickyNotes: Array<{
    id: string;
    content: string;
    color: string;
    positionX: number;
    positionY: number;
  }>;
  sessionUserId: string | null;
}

export default function StrategicCommandCenter({
  roadmap,
  initialSteps,
  initialActiveIds,
  initialCompletedIds,
  initialNotes,
  initialPositions,
  initialStickyNotes,
  sessionUserId,
}: StrategicCommandCenterProps) {
  const [steps, setSteps] = useState<Step[]>(initialSteps);
  const [completedIds, setCompletedIds] = useState<string[]>(initialCompletedIds);
  const [activeIds, setActiveIds] = useState<string[]>(() => {
    const activeSet = new Set(initialActiveIds);
    const combined = [...initialActiveIds];
    initialCompletedIds.forEach(id => {
      if (!activeSet.has(id) && initialSteps.some(s => s.id === id)) {
        combined.push(id);
      }
    });
    return combined.filter(id => initialSteps.some(s => s.id === id));
  });

  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isMutating, startTransition] = useTransition();

  // Notes Engine States
  const [notesCache, setNotesCache] = useState<Record<string, string>>(initialNotes);

  // Custom Objective Dialog States
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);
  const [customStepTitle, setCustomStepTitle] = useState('');
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);

  // Quick lookup maps
  const stepsMap = useMemo(() => {
    return new Map(steps.map((s) => [s.id, s]));
  }, [steps]);

  const selectedStep = useMemo(() => {
    if (!selectedStepId) return null;
    return stepsMap.get(selectedStepId) || null;
  }, [selectedStepId, stepsMap]);

  // Persists the custom active list sequence to the db
  const saveMissionPlan = async (stepIds: string[]) => {
    if (!sessionUserId) return;
    setIsSaving(true);
    try {
      const result = await saveUserMissionPlanAction(roadmap.id, stepIds);
      if (result?.error) {
        toast.error(result.error);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to synchronize customized path.');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle active mission handler (mobile fallback & canvas controls sync)
  const handleToggleActiveMission = async (stepId: string, isActive: boolean) => {
    let nextActiveIds = [...activeIds];
    if (isActive) {
      if (!nextActiveIds.includes(stepId)) {
        nextActiveIds.push(stepId);
      }
    } else {
      nextActiveIds = nextActiveIds.filter((id) => id !== stepId);
    }
    setActiveIds(nextActiveIds);
    await saveMissionPlan(nextActiveIds);
  };

  // Completion Toggle Action
  const handleToggleComplete = (stepId: string, isCurrentlyCompleted: boolean) => {
    startTransition(async () => {
      const nextCompleted = !isCurrentlyCompleted;

      let nextCompletedIds = [...completedIds];
      if (nextCompleted) {
        nextCompletedIds.push(stepId);
      } else {
        nextCompletedIds = nextCompletedIds.filter((id) => id !== stepId);
      }

      let nextActiveIds = [...activeIds];
      if (nextCompleted) {
        if (!nextActiveIds.includes(stepId)) {
          nextActiveIds.push(stepId);
        }
      }

      setCompletedIds(nextCompletedIds);
      setActiveIds(nextActiveIds);

      try {
        const result = await completeStepAction(stepId, nextCompleted);
        if (result?.error) {
          setCompletedIds(completedIds);
          setActiveIds(activeIds);
          toast.error(result.error);
        } else {
          toast.success(
            nextCompleted
              ? 'Objective secured! Streak progression updated. 🎖️'
              : 'Objective re-commissioned.'
          );
          await saveMissionPlan(nextActiveIds);
        }
      } catch (err) {
        setCompletedIds(completedIds);
        setActiveIds(activeIds);
        toast.error('Connection failure. Failed to update status.');
      }
    });
  };

  // Create custom objective handler
  const handleCreateCustomStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customStepTitle.trim()) return;

    setIsCreatingCustom(true);
    try {
      const result = await createCustomStepAction(roadmap.id, customStepTitle.trim());
      if (result?.error) {
        toast.error(result.error);
      } else if (result?.customStep) {
        const newStepMapped = {
          id: result.customStep.id,
          title: result.customStep.title,
          description: result.customStep.theory || 'Core Theory Briefing: Draft your outline for this custom objective in "My Notes".',
          order: 999,
          branch: null,
          resources: [],
          deepDiveUrl: null,
          quickRefUrl: null,
          isCustom: true,
        };

        setSteps((prev) => [...prev, newStepMapped]);
        setActiveIds((prev) => [...prev, result.customStep.id]);
        setSelectedStepId(result.customStep.id);
        setCustomStepTitle('');
        setIsCustomDialogOpen(false);
        toast.success('Custom objective injected successfully!');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to inject custom objective.');
    } finally {
      setIsCreatingCustom(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Tactical Sub-header */}
      <div className="flex items-center justify-between border-b border-border/50 bg-card/10 backdrop-blur-md px-6 py-3.5 z-10 shrink-0 select-none">
        <div className="flex items-center gap-3">
          <Link
            href="/roadmaps"
            className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-all"
            title="Return to syllabus listings"
          >
            <ArrowLeft size={16} />
          </Link>
          <div className="h-4 w-px bg-border/60" />
          <h2 className="text-sm font-semibold text-foreground tracking-tight">
            Strategic Command Center: <span className="text-muted-foreground font-normal">{roadmap.title}</span>
          </h2>
        </div>

        {/* Action Panel in Header */}
        <div className="flex items-center gap-4">
          {sessionUserId && (
            <Button
              onClick={() => setIsCustomDialogOpen(true)}
              variant="outline"
              size="sm"
              className="h-8 px-3 rounded-lg border border-dashed border-amber-500/30 hover:bg-amber-500/10 text-[10px] font-bold flex items-center gap-1.5 text-amber-500 tracking-wider uppercase"
            >
              + Inject Custom Objective
            </Button>
          )}

          {sessionUserId && (
            <div className="flex items-center gap-2 animate-fade-in">
              {isSaving ? (
                <span className="flex items-center gap-1.5 text-xs text-amber-500 font-medium animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Syncing...
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/15">
                  <Check size={10} className="stroke-[3]" /> Approach Persisted
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Guest Mode Alert Banner */}
      {!sessionUserId && (
        <div className="flex items-center gap-2.5 p-2 bg-amber-500/5 border-b border-amber-500/15 select-none shrink-0">
          <ShieldAlert size={14} className="text-amber-500 shrink-0 ml-4" />
          <p className="text-[10px] text-foreground/80">
            Preview mode. <Link href="/login" className="text-primary hover:underline font-semibold">Sign in</Link> to design path and save custom nodes.
          </p>
        </div>
      )}

      {/* Main Board Container */}
      <div className="w-full h-[calc(100vh-5rem)] overflow-hidden relative z-0">
        <SpatialInvestigationBoard
          roadmapId={roadmap.id}
          steps={steps}
          activeIds={activeIds}
          completedIds={completedIds}
          selectedStepId={selectedStepId}
          setSelectedStepId={setSelectedStepId}
          onToggleActiveMission={handleToggleActiveMission}
          onInjectCustomObjectiveClick={() => setIsCustomDialogOpen(true)}
          initialPositions={initialPositions}
          initialStickyNotes={initialStickyNotes}
          sessionUserId={sessionUserId}
        />

        {/* Right-Hand Intelligence Briefing Sliding Panel Overlay */}
        <DeepDiveOverlay
          isOpen={!!selectedStepId}
          step={selectedStep}
          onClose={() => setSelectedStepId(null)}
          completedIds={completedIds}
          isMutating={isMutating}
          onToggleComplete={handleToggleComplete}
          sessionUserId={sessionUserId}
          notesCache={notesCache}
          setNotesCache={setNotesCache}
        />
      </div>

      {/* dialog modal for injecting custom objectives */}
      <Dialog open={isCustomDialogOpen} onOpenChange={setIsCustomDialogOpen}>
        <DialogContent className="sm:max-w-[425px] border border-border bg-background/95 backdrop-blur-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">Inject Custom Objective</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Define a personal side-quest to add to your Active Mission curriculum.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateCustomStep} className="space-y-4 pt-3">
            <input
              type="text"
              value={customStepTitle}
              onChange={(e) => setCustomStepTitle(e.target.value)}
              placeholder="e.g., Learn Zustand State Management"
              required
              disabled={isCreatingCustom}
              className="w-full p-3 bg-muted/40 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/45 placeholder:text-muted-foreground/60 text-foreground"
            />
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsCustomDialogOpen(false)}
                className="rounded-xl border border-border/50 hover:bg-muted"
                disabled={isCreatingCustom}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreatingCustom}
                className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2 font-bold"
              >
                {isCreatingCustom ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : null}
                Inject Objective
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
