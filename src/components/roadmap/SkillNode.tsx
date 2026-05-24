'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Lock, CheckCircle2, Zap, BookOpen, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NodeStatus } from '@/lib/graphEngine';

// ─── Data shape passed into the React Flow node ───────────────────────────────
export interface SkillNodeData {
  title: string;
  briefing: string;
  type: 'concept' | 'practice' | 'milestone';
  status: NodeStatus;
  nodeId: string;
}

// ─── Type icon map ────────────────────────────────────────────────────────────
const TYPE_ICONS = {
  concept:   BookOpen,
  practice:  Zap,
  milestone: Trophy,
} as const;

const TYPE_LABELS = {
  concept:   'Concept',
  practice:  'Practice',
  milestone: 'Milestone',
} as const;

// ─── Style maps per status ────────────────────────────────────────────────────
const STATUS_STYLES = {
  LOCKED: {
    wrapper:     'opacity-40 cursor-not-allowed',
    container:   'border border-slate-700/60 bg-slate-900/70 backdrop-blur-sm',
    title:       'text-slate-500',
    badge:       'bg-slate-800/70 text-slate-500 border-slate-700/50',
    icon:        'text-slate-600',
    handleColor: '!bg-slate-700 !border-slate-600',
  },
  UNLOCKED: {
    wrapper:     'cursor-pointer skill-node-unlocked',
    container:   'border border-violet-500/70 bg-slate-900/90 backdrop-blur-md skill-node-glow',
    title:       'text-slate-100',
    badge:       'bg-violet-500/15 text-violet-300 border-violet-500/30',
    icon:        'text-violet-400',
    handleColor: '!bg-violet-500 !border-violet-400',
  },
  COMPLETED: {
    wrapper:     'cursor-pointer',
    container:   'border border-emerald-500/60 bg-gradient-to-br from-emerald-950/80 via-slate-900/95 to-violet-950/60 backdrop-blur-md shadow-emerald-500/10',
    title:       'text-emerald-100',
    badge:       'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    icon:        'text-emerald-400',
    handleColor: '!bg-emerald-500 !border-emerald-400',
  },
} as const;

// ─── SkillNode Component ──────────────────────────────────────────────────────
const SkillNode = memo(({ data }: NodeProps) => {
  const nodeData = data as unknown as SkillNodeData;
  const { title, type, status } = nodeData;

  const styles = STATUS_STYLES[status];
  const TypeIcon = TYPE_ICONS[type] ?? BookOpen;
  const typeLabel = TYPE_LABELS[type] ?? 'Concept';

  return (
    <div className={cn('relative group select-none', styles.wrapper)}>

      {/* Target Handle (left) — incoming prerequisite connections */}
      <Handle
        type="target"
        position={Position.Left}
        className={cn(
          'w-2.5 h-2.5 !border-2 !border-slate-950 rounded-full transition-all',
          styles.handleColor
        )}
        style={{ left: '-5px' }}
      />

      {/* ── Node Card ── */}
      <div
        className={cn(
          'relative w-[200px] px-4 py-3 rounded-2xl shadow-lg transition-all duration-300',
          styles.container
        )}
      >
        {/* Type badge top-left */}
        <div className="flex items-center justify-between mb-2.5">
          <span
            className={cn(
              'flex items-center gap-1 text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border',
              styles.badge
            )}
          >
            <TypeIcon size={8} />
            {typeLabel}
          </span>

          {/* Status indicator icon top-right */}
          <span className={cn('flex-shrink-0', styles.icon)}>
            {status === 'LOCKED'    && <Lock size={12} />}
            {status === 'UNLOCKED'  && <Zap size={12} className="animate-pulse" />}
            {status === 'COMPLETED' && <CheckCircle2 size={12} />}
          </span>
        </div>

        {/* Title */}
        <p
          className={cn(
            'text-sm font-semibold leading-tight line-clamp-2',
            styles.title
          )}
        >
          {title}
        </p>

        {/* Completed checkmark strip at bottom */}
        {status === 'COMPLETED' && (
          <div className="mt-2.5 pt-2 border-t border-emerald-500/20 flex items-center gap-1">
            <CheckCircle2 size={10} className="text-emerald-400" />
            <span className="text-[9px] text-emerald-400 font-semibold tracking-wider uppercase">
              Completed
            </span>
          </div>
        )}
      </div>

      {/* Source Handle (right) — outgoing to dependents */}
      <Handle
        type="source"
        position={Position.Right}
        className={cn(
          'w-2.5 h-2.5 !border-2 !border-slate-950 rounded-full transition-all',
          styles.handleColor
        )}
        style={{ right: '-5px' }}
      />
    </div>
  );
});

SkillNode.displayName = 'SkillNode';

export default SkillNode;
