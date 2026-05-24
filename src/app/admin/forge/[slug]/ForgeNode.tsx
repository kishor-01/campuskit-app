// src/app/admin/forge/[slug]/ForgeNode.tsx
// Admin Graph Forge — Custom node shape for the editable canvas
'use client';

import React from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { BookOpen, Zap, Trophy } from 'lucide-react';

const TYPE_META = {
  concept:   { icon: BookOpen, color: 'text-violet-400', ring: 'ring-violet-500/40', bg: 'bg-violet-500/10', border: 'border-violet-500/30' },
  practice:  { icon: Zap,      color: 'text-amber-400',  ring: 'ring-amber-500/40',  bg: 'bg-amber-500/10',  border: 'border-amber-500/30'  },
  milestone: { icon: Trophy,   color: 'text-emerald-400',ring: 'ring-emerald-500/40',bg: 'bg-emerald-500/10',border: 'border-emerald-500/30' },
} as const;

type ForgeNodeData = {
  label: string;
  type: string;
  nodeId: string;
};

export default function ForgeNode({ data, selected }: NodeProps) {
  const d = data as ForgeNodeData;
  const meta = TYPE_META[d.type as keyof typeof TYPE_META] ?? TYPE_META.concept;
  const Icon = meta.icon;

  return (
    <div className={`
      relative rounded-xl border px-4 py-3 min-w-[180px] max-w-[260px]
      bg-slate-900/90 backdrop-blur-sm cursor-pointer select-none
      transition-all duration-200 shadow-lg
      ${meta.border}
      ${selected ? `ring-2 ${meta.ring} shadow-[0_0_20px_rgba(139,92,246,0.3)]` : 'hover:brightness-110'}
    `}>
      {/* Target handle — left center */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-slate-700 !border-2 !border-slate-500 hover:!border-violet-400 hover:!bg-violet-500/30 transition-colors"
      />

      <div className="flex items-center gap-2.5">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
          <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-[9px] font-bold uppercase tracking-widest ${meta.color} mb-0.5`}>
            {d.type}
          </p>
          <p className="text-xs font-semibold text-slate-200 leading-tight truncate">
            {d.label || 'Untitled Node'}
          </p>
        </div>
      </div>

      {/* Source handle — right center */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-slate-700 !border-2 !border-slate-500 hover:!border-violet-400 hover:!bg-violet-500/30 transition-colors"
      />
    </div>
  );
}
