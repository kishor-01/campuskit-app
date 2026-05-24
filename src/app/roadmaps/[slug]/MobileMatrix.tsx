'use client';

import React, { useMemo } from 'react';
import { BookOpen, Zap, Trophy, Lock, CheckCircle2 } from 'lucide-react';
import type { ConstellationNode, ConstellationEdge } from './ConstellationCanvas';
import { topologicallySortNodes } from '@/lib/graphEngine';

const TYPE_META = {
  concept: { icon: BookOpen, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  practice: { icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  milestone: { icon: Trophy, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
} as const;

interface MobileMatrixProps {
  nodes: ConstellationNode[];
  edges: ConstellationEdge[];
  onNodeSelect: (node: ConstellationNode) => void;
}

export default function MobileMatrix({ nodes, edges, onNodeSelect }: MobileMatrixProps) {
  const tiers = useMemo(() => topologicallySortNodes(nodes, edges), [nodes, edges]);

  return (
    <div className="md:hidden absolute inset-0 overflow-y-auto bg-[#020817] pb-32 pt-24 px-4 scroll-smooth">
      <div className="max-w-md mx-auto flex flex-col gap-12 relative">
        
        {/* Subtle connecting line down the middle */}
        <div className="absolute top-0 bottom-0 left-1/2 w-[1px] -translate-x-1/2 bg-gradient-to-b from-slate-800 via-slate-700 to-transparent pointer-events-none -z-10" />

        {tiers.map((tierNodes, tierIndex) => (
          <div key={`tier-${tierIndex}`} className="flex flex-col gap-6 relative">
            {/* Phase Header */}
            <div className="sticky top-0 z-10 flex justify-center py-2 backdrop-blur-md -mx-4 px-4 mask-fade-edges">
              <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/50 text-[10px] font-bold uppercase tracking-widest text-slate-400 shadow-xl">
                Phase {tierIndex + 1}
              </span>
            </div>

            {/* Nodes in this Phase */}
            <div className="flex flex-col gap-4">
              {tierNodes.map((node) => {
                const typeMeta = TYPE_META[node.type as keyof typeof TYPE_META] ?? TYPE_META.concept;
                const TypeIcon = typeMeta.icon;
                const isLocked = node.status === 'LOCKED';
                const isCompleted = node.status === 'COMPLETED';
                const isUnlocked = node.status === 'UNLOCKED';

                return (
                  <div
                    key={node.id}
                    onClick={() => {
                      if (!isLocked) onNodeSelect(node);
                    }}
                    className={`relative w-full rounded-2xl border p-4 transition-all duration-300
                      ${isLocked ? 'bg-slate-900/40 border-slate-800/60 opacity-60' : ''}
                      ${isCompleted ? 'bg-emerald-500/5 border-emerald-500/20' : ''}
                      ${isUnlocked ? 'bg-slate-900/80 border-violet-500/40 shadow-[0_0_24px_rgba(139,92,246,0.15)] cursor-pointer active:scale-[0.98]' : ''}
                    `}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border
                        ${isLocked ? 'bg-slate-800/50 border-slate-700/50' : typeMeta.bg + ' ' + typeMeta.border}
                      `}>
                        <TypeIcon className={`w-5 h-5 ${isLocked ? 'text-slate-600' : typeMeta.color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-center gap-2 mb-1.5">
                          <h3 className={`text-sm font-bold truncate leading-tight ${isLocked ? 'text-slate-500' : 'text-slate-200'}`}>
                            {node.title}
                          </h3>
                        </div>

                        {/* Status indicators */}
                        <div className="flex items-center gap-2">
                          {isCompleted && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 tracking-wider uppercase">
                              <CheckCircle2 className="w-3 h-3" />
                              Secured
                            </span>
                          )}
                          {isUnlocked && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-violet-400 tracking-wider uppercase animate-pulse">
                              <Zap className="w-3 h-3" />
                              Action Required
                            </span>
                          )}
                          {isLocked && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                              <Lock className="w-3 h-3" />
                              Locked
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
