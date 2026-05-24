// src/app/roadmaps/[slug]/TacticalCard.tsx
'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CheckCircle2, GripVertical, Milestone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TacticalCardProps {
  step: {
    id: string;
    title: string;
    description: string;
    order: number;
    branch?: { title: string; color?: string | null } | null;
    isCustom?: boolean;
  };
  isCompleted?: boolean;
  isActive?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  isOverlay?: boolean;
}

export default function TacticalCard({
  step,
  isCompleted = false,
  isActive = false,
  isSelected = false,
  onClick,
  isOverlay = false,
}: TacticalCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });

  // Custom CSS transition for calm, non-bouncy sorting transitions
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
    opacity: isDragging && !isOverlay ? 0.35 : undefined,
  };

  const cardContent = (
    <div
      onClick={(e) => {
        // Prevent click if dragging happened
        if (onClick) onClick();
      }}
      className={cn(
        "group relative flex items-start gap-3 p-4 bg-card/65 backdrop-blur-md border rounded-xl cursor-pointer select-none transition-all duration-300",
        // Selected state
        isSelected 
          ? "border-primary bg-primary/5 shadow-lg shadow-primary/5 ring-1 ring-primary/30" 
          : "border-border/60 hover:border-border-hover hover:bg-card/90",
        // Completed state (green background/border and opacity-60)
        isCompleted && "opacity-60 border-emerald-500/60 bg-emerald-500/10 shadow-sm shadow-emerald-500/5 hover:bg-emerald-500/15",
        // Active state
        isActive && !isCompleted && "border-amber-500/40 hover:border-amber-500/60 bg-amber-500/[0.01]",
        // Overlay styling
        isOverlay && "shadow-2xl border-primary bg-card/95 scale-[1.05] opacity-90 cursor-grabbing"
      )}
    >
      {/* Drag handle */}
      {!isCompleted && (
        <div
          {...attributes}
          {...listeners}
          className="shrink-0 text-muted-foreground/40 hover:text-muted-foreground/80 cursor-grab active:cursor-grabbing p-0.5 mt-0.5 rounded transition-colors"
          title="Drag to reorder"
          onClick={(e) => e.stopPropagation()} // don't select the card when dragging via handle
        >
          <GripVertical size={16} />
        </div>
      )}

      {/* Main body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          {/* Order circle */}
          <span className={cn(
            "flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold border",
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
            isSelected && "text-primary-foreground/90"
          )}>
            {step.title}
          </h4>

          {/* Custom step badge */}
          {step.isCustom && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold border leading-none shrink-0 bg-blue-500/10 text-blue-400 border-blue-500/15 uppercase tracking-wide">
              Personal
            </span>
          )}

          {/* Branch badge */}
          {step.branch && (
            <span
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium border leading-none shrink-0"
              style={{
                backgroundColor: `${step.branch.color || 'hsl(var(--primary))'}12`,
                color: step.branch.color || 'hsl(var(--primary))',
                borderColor: `${step.branch.color || 'hsl(var(--primary))'}25`,
              }}
            >
              <Milestone size={8} /> {step.branch.title}
            </span>
          )}
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {step.description}
        </p>
      </div>

      {/* Status Indicators */}
      {isCompleted && (
        <div className="shrink-0 text-emerald-500 animate-fade-in self-center">
          <CheckCircle2 size={18} className="fill-emerald-500/10" />
        </div>
      )}
    </div>
  );

  if (isOverlay) {
    return cardContent;
  }

  return (
    <div ref={setNodeRef} style={style}>
      {cardContent}
    </div>
  );
}
