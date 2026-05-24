// src/components/roadmap/NodeDrawer.tsx
'use client';

import * as React from 'react';
import { Drawer } from 'vaul';
import { BookOpen, Zap, ArrowUpRight, Check, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

type NodeDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  step: Step | null;
  onToggleComplete: (stepId: string) => Promise<void>;
  isMutating: boolean;
};

export default function NodeDrawer({
  isOpen,
  onClose,
  step,
  onToggleComplete,
  isMutating,
}: NodeDrawerProps) {
  if (!step) return null;

  const isCompleted = step.status === 'COMPLETED';

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <Drawer.Portal>
        {/* Glassmorphic Overlay */}
        <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300" />
        
        {/* Drawer Content */}
        <Drawer.Content 
          className="bg-background border-t border-border flex flex-col rounded-t-[24px] h-[85vh] md:h-[75vh] fixed bottom-0 left-0 right-0 z-50 focus:outline-none max-w-2xl mx-auto shadow-2xl overflow-hidden transition-transform duration-300"
        >
          {/* Drag Handle Container */}
          <div className="pt-4 pb-2 bg-muted/20 flex justify-center border-b border-border/50 relative">
            <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30 hover:bg-muted-foreground/50 transition-colors cursor-grab" />
            <button 
              onClick={onClose}
              className="absolute right-4 top-2.5 p-1 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Close drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Header / Badges */}
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 items-center">
                <Badge variant="outline" className="font-bold text-xs uppercase tracking-wider bg-primary/5 text-primary border-primary/20">
                  Step {step.order}
                </Badge>
                {step.branch && (
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border"
                    style={{
                      backgroundColor: `${step.branch.color || 'hsl(var(--primary))'}15`,
                      color: step.branch.color || 'hsl(var(--primary))',
                      borderColor: `${step.branch.color || 'hsl(var(--primary))'}30`,
                    }}
                  >
                    🔀 {step.branch.title}
                  </span>
                )}
                {isCompleted && (
                  <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold gap-1">
                    <Check className="w-3 h-3" /> Completed
                  </Badge>
                )}
                {step.status === 'ACTIVE' && (
                  <Badge variant="default" className="font-bold animate-pulse">
                    Current Focus
                  </Badge>
                )}
              </div>

              <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                {step.title}
              </h2>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Objective & Insights
              </h3>
              <p className="text-foreground/90 leading-relaxed text-sm md:text-base whitespace-pre-line bg-muted/30 p-4 rounded-xl border border-border/50">
                {step.description}
              </p>
            </div>

            {/* Deep Dive & Quick Ref buttons */}
            {(step.deepDiveUrl || step.quickRefUrl) && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Reference Guides
                </h3>
                <div className="flex flex-wrap gap-3">
                  {step.deepDiveUrl && (
                    <a
                      href={step.deepDiveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary/10 text-primary border border-primary/10
                                 rounded-xl text-sm font-semibold hover:bg-primary/20 transition-all hover:shadow-sm"
                    >
                      <BookOpen size={16} />
                      📚 Deep Dive Guide
                      <ArrowUpRight size={14} className="opacity-70" />
                    </a>
                  )}
                  {step.quickRefUrl && (
                    <a
                      href={step.quickRefUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/10
                                 rounded-xl text-sm font-semibold hover:bg-amber-500/20 transition-all hover:shadow-sm"
                    >
                      <Zap size={16} />
                      ⚡ Quick Reference
                      <ArrowUpRight size={14} className="opacity-70" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Recommended Resources */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Recommended Resources
              </h3>
              {step.resources.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {step.resources.map((resource) => (
                    <a
                      key={resource.id}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-muted/40 p-4 rounded-xl flex items-center justify-between gap-3 
                                 hover:bg-muted/70 border border-border/50 hover:border-primary/30 transition-all group"
                    >
                      <span className="text-sm font-bold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                        {resource.name}
                      </span>
                      <ArrowUpRight size={16} className="text-muted-foreground flex-shrink-0 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No linked resources for this step. Use the references above to search for topics.
                </p>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-4 bg-muted/20 border-t border-border flex items-center justify-between gap-4">
            <Button
              variant="ghost"
              onClick={onClose}
              className="px-5 rounded-xl text-muted-foreground hover:text-foreground font-semibold"
            >
              Close
            </Button>

            <Button
              disabled={isMutating}
              onClick={() => onToggleComplete(step.id)}
              className={`px-6 rounded-xl font-bold min-w-[180px] shadow-sm transition-all
                ${isCompleted 
                  ? 'bg-muted border border-border text-foreground hover:bg-destructive hover:text-white' 
                  : 'bg-primary text-primary-foreground hover:bg-primary/95'
                }`}
            >
              {isMutating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : isCompleted ? (
                'Mark Incomplete'
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Mark Complete
                </>
              )}
            </Button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
