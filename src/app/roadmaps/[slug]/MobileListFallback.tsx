// src/app/roadmaps/[slug]/MobileListFallback.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { CheckCircle2, Milestone, Plus, Minus, Info, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type Step = {
  id: string;
  title: string;
  description: string;
  order: number;
  branch?: { title: string; color?: string | null } | null;
  isCustom?: boolean;
};

interface MobileListFallbackProps {
  steps: Step[];
  activeIds: string[];
  completedIds: string[];
  selectedStepId: string | null;
  setSelectedStepId: (id: string | null) => void;
  onToggleActiveMission: (stepId: string, isActive: boolean) => void;
  onInjectCustomObjectiveClick: () => void;
  sessionUserId: string | null;
}

export default function MobileListFallback({
  steps,
  activeIds,
  completedIds,
  selectedStepId,
  setSelectedStepId,
  onToggleActiveMission,
  onInjectCustomObjectiveClick,
  sessionUserId,
}: MobileListFallbackProps) {
  const [activeTab, setActiveTab] = useState<'mission' | 'syllabus'>('mission');

  const stepsMap = useMemo(() => new Map(steps.map((s) => [s.id, s])), [steps]);

  // Derived lists
  const completedSet = new Set(completedIds);
  const activeSet = new Set(activeIds);

  const activeSteps = useMemo(() => {
    const incompleteActive = activeIds
      .map((id) => stepsMap.get(id))
      .filter((s): s is Step => !!s && !completedSet.has(s.id));

    const completedActive = steps
      .filter((s) => completedSet.has(s.id) && activeSet.has(s.id))
      .sort((a, b) => a.order - b.order);

    return [...incompleteActive, ...completedActive];
  }, [activeIds, completedIds, steps, stepsMap, activeSet, completedSet]);

  const syllabusSteps = useMemo(() => {
    return steps
      .filter((s) => !completedSet.has(s.id) && !activeSet.has(s.id))
      .sort((a, b) => a.order - b.order);
  }, [steps, activeSet, completedSet]);

  return (
    <div className="flex flex-col h-full bg-background p-4 gap-4 overflow-y-auto">
      {/* Inject Custom Objective Button - only if user is logged in & on mission tab */}
      {sessionUserId && activeTab === 'mission' && (
        <Button
          onClick={onInjectCustomObjectiveClick}
          variant="outline"
          className="w-full py-5 rounded-xl border border-dashed border-amber-500/25 hover:bg-amber-500/5 text-amber-500 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 select-none shrink-0"
        >
          <Sparkles size={14} className="animate-pulse" />
          Inject Custom Objective
        </Button>
      )}

      {/* Tabs */}
      <div className="flex bg-muted/30 border border-border/50 p-1 rounded-xl shrink-0 select-none">
        <button
          onClick={() => setActiveTab('mission')}
          className={cn(
            "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
            activeTab === 'mission'
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Active Mission ({activeSteps.length})
        </button>
        <button
          onClick={() => setActiveTab('syllabus')}
          className={cn(
            "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
            activeTab === 'syllabus'
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Syllabus Pool ({syllabusSteps.length})
        </button>
      </div>

      {/* Lists */}
      <div className="flex-1 flex flex-col gap-3 min-h-[300px]">
        {activeTab === 'mission' ? (
          activeSteps.length > 0 ? (
            activeSteps.map((step) => (
              <MobileStepCard
                key={step.id}
                step={step}
                isActive={true}
                isCompleted={completedIds.includes(step.id)}
                isSelected={selectedStepId === step.id}
                onSelect={() => setSelectedStepId(step.id)}
                onAction={() => onToggleActiveMission(step.id, false)}
                sessionUserId={sessionUserId}
              />
            ))
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-8 border border-dashed border-border/40 rounded-2xl text-muted-foreground/50 bg-muted/5">
              <p className="text-xs leading-relaxed max-w-[200px]">
                Your Active Mission is empty. Tap into "Syllabus Pool" to activate objectives.
              </p>
            </div>
          )
        ) : (
          syllabusSteps.length > 0 ? (
            syllabusSteps.map((step) => (
              <MobileStepCard
                key={step.id}
                step={step}
                isActive={false}
                isCompleted={completedIds.includes(step.id)}
                isSelected={selectedStepId === step.id}
                onSelect={() => setSelectedStepId(step.id)}
                onAction={() => onToggleActiveMission(step.id, true)}
                sessionUserId={sessionUserId}
              />
            ))
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-8 border border-dashed border-border/40 rounded-2xl text-muted-foreground/50 bg-muted/5">
              <p className="text-xs leading-relaxed max-w-[200px]">
                Syllabus exhausted. All steps are either active in your mission or already completed!
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

interface MobileStepCardProps {
  step: Step;
  isActive: boolean;
  isCompleted: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onAction: () => void;
  sessionUserId: string | null;
}

function MobileStepCard({
  step,
  isActive,
  isCompleted,
  isSelected,
  onSelect,
  onAction,
  sessionUserId,
}: MobileStepCardProps) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "group relative flex items-center justify-between p-4 bg-card/65 backdrop-blur-md border rounded-xl cursor-pointer select-none transition-all duration-300 active:scale-[0.99]",
        isSelected
          ? "border-primary bg-primary/5 ring-1 ring-primary/30"
          : "border-border/60",
        isCompleted && "opacity-60 border-emerald-500/60 bg-emerald-500/10",
        isActive && !isCompleted && "border-amber-500/40 bg-amber-500/[0.01]"
      )}
    >
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          {/* Order badge */}
          <span className={cn(
            "flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold border shrink-0",
            isCompleted
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : isActive
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                : "bg-muted border-border text-muted-foreground"
          )}>
            {step.isCustom ? "★" : step.order}
          </span>

          <h4 className={cn(
            "text-sm font-semibold truncate text-foreground",
            isCompleted && "text-emerald-500/90",
            isSelected && "text-primary"
          )}>
            {step.title}
          </h4>

          {step.isCustom && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-extrabold border leading-none bg-blue-500/10 text-blue-400 border-blue-500/15 uppercase tracking-wide">
              Personal
            </span>
          )}

          {step.branch && (
            <span
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-medium border leading-none shrink-0"
              style={{
                backgroundColor: `${step.branch.color || 'hsl(var(--primary))'}12`,
                color: step.branch.color || 'hsl(var(--primary))',
                borderColor: `${step.branch.color || 'hsl(var(--primary))'}25`,
              }}
            >
              <Milestone size={7} /> {step.branch.title}
            </span>
          )}
        </div>

        <p className="text-xs text-muted-foreground line-clamp-1">
          {step.description}
        </p>
      </div>

      {/* Interactive buttons on the right */}
      <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
        {/* Toggle Active Mission button (only for authenticated users) */}
        {sessionUserId && !isCompleted && (
          <button
            onClick={onAction}
            className={cn(
              "p-2 rounded-lg border transition-all duration-200 hover:scale-105 active:scale-95",
              isActive
                ? "border-amber-500/20 bg-amber-500/5 text-amber-500 hover:bg-amber-500/10"
                : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
            title={isActive ? "Remove from Mission" : "Add to Mission"}
          >
            {isActive ? <Minus size={14} /> : <Plus size={14} />}
          </button>
        )}

        {/* Completion status or details arrow */}
        {isCompleted ? (
          <div className="text-emerald-500 p-1">
            <CheckCircle2 size={16} className="fill-emerald-500/10" />
          </div>
        ) : (
          <button
            onClick={onSelect}
            className="p-2 text-muted-foreground/60 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
          >
            <Info size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
