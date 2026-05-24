// src/components/roadmap/RoadmapNode.tsx
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Check, Play } from 'lucide-react';

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
};

type RoadmapNodeProps = {
  step: Step;
  onClick: () => void;
};

export default function RoadmapNode({ step, onClick }: RoadmapNodeProps) {
  const isCompleted = step.status === 'COMPLETED';
  const isActive = step.status === 'ACTIVE';

  return (
    <Card
      onClick={onClick}
      className={`group w-full max-w-md cursor-pointer text-left border border-border/80 bg-card/65 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/40
        ${isActive ? 'ring-2 ring-primary/40 border-primary/50 bg-primary/[0.02]' : ''}
        ${isCompleted ? 'border-emerald-500/30 dark:border-emerald-500/20 bg-emerald-500/[0.01]' : ''}
      `}
    >
      <CardHeader className="p-4 pb-2 space-y-2">
        <div className="flex items-center justify-between gap-2">
          {/* Step Order Badge */}
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border
            ${isCompleted ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : ''}
            ${isActive ? 'bg-primary/10 text-primary border-primary/20' : ''}
            ${!isCompleted && !isActive ? 'bg-muted text-muted-foreground border-border' : ''}
          `}>
            Step {step.order}
          </span>

          {/* Branch indicator */}
          {step.branch && (
            <span
              className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border"
              style={{
                backgroundColor: `${step.branch.color || 'hsl(var(--primary))'}12`,
                color: step.branch.color || 'hsl(var(--primary))',
                borderColor: `${step.branch.color || 'hsl(var(--primary))'}25`,
              }}
            >
              🔀 {step.branch.title}
            </span>
          )}
        </div>

        {/* Title */}
        <CardTitle className="text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors flex items-center gap-1.5">
          {isCompleted && <Check className="w-4 h-4 text-emerald-500 shrink-0" />}
          {isActive && <Play className="w-3.5 h-3.5 text-primary fill-primary shrink-0 animate-pulse" />}
          {step.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 pt-0 space-y-3">
        {/* Excerpt */}
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {step.description}
        </p>

        {/* Resources indicator */}
        {step.resources.length > 0 && (
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground/80">
            <BookOpen className="w-3 h-3 text-primary/70" />
            <span>{step.resources.length} recommended {step.resources.length === 1 ? 'resource' : 'resources'}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
