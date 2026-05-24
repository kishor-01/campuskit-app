// src/app/roadmaps/[slug]/DeepDiveOverlay.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, RotateCcw, Loader2, Compass, BookOpen, Terminal, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import ResourceCard, { ResourceWithCategory } from '@/components/ResourceCard';
import { saveStepNoteAction } from '@/actions';

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

interface DeepDiveOverlayProps {
  isOpen: boolean;
  step: Step | null;
  onClose: () => void;
  completedIds: string[];
  isMutating: boolean;
  onToggleComplete: (stepId: string, isCompleted: boolean) => void;
  sessionUserId: string | null;
  notesCache: Record<string, string>;
  setNotesCache: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export default function DeepDiveOverlay({
  isOpen,
  step,
  onClose,
  completedIds,
  isMutating,
  onToggleComplete,
  sessionUserId,
  notesCache,
  setNotesCache,
}: DeepDiveOverlayProps) {
  const [activeTab, setActiveTab] = useState<'briefing' | 'arsenal' | 'sandbox'>('briefing');
  const [noteText, setNoteText] = useState('');
  const noteTextRef = useRef('');
  const isPendingSaveRef = useRef(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync notes cache when step changes
  useEffect(() => {
    if (step) {
      const initialText = notesCache[step.id] || '';
      setNoteText(initialText);
      noteTextRef.current = initialText;
      isPendingSaveRef.current = false;
      setActiveTab('briefing'); // Reset tab to briefing on step change
    }
  }, [step, notesCache]);

  // Window Esc key listener with cleanup to prevent memory leaks
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Save notes to database
  const saveNoteImmediately = useCallback(async () => {
    if (!step || !isPendingSaveRef.current) return;

    const textToSave = noteTextRef.current;
    isPendingSaveRef.current = false;
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }

    try {
      await saveStepNoteAction(step.id, !!step.isCustom, textToSave);
      setNotesCache((prev) => ({ ...prev, [step.id]: textToSave }));
    } catch (err) {
      console.error('Failed to auto-save notes:', err);
    }
  }, [step, setNotesCache]);

  const handleNoteChange = (text: string) => {
    if (!step) return;
    setNoteText(text);
    noteTextRef.current = text;
    isPendingSaveRef.current = true;

    // Instantly update parent state cache
    setNotesCache((prev) => ({ ...prev, [step.id]: text }));

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(async () => {
      await saveNoteImmediately();
    }, 1000);
  };

  // Secure objective trigger: checks and flushes pending note saves immediately before toggling completion state
  const handleSecureObjective = async () => {
    if (!step) return;

    if (isPendingSaveRef.current) {
      await saveNoteImmediately();
    }

    onToggleComplete(step.id, completedIds.includes(step.id));
    onClose();
  };

  // Flush notes on unmount or step changes
  useEffect(() => {
    return () => {
      if (isPendingSaveRef.current) {
        saveNoteImmediately();
      }
    };
  }, [step, saveNoteImmediately]);

  if (!step) return null;

  const isCompleted = completedIds.includes(step.id);

  return (
    <div
      className={cn(
        "fixed right-0 top-0 h-screen w-full md:w-[50vw] xl:w-[40vw] z-50 bg-background/95 backdrop-blur-2xl border-l border-border shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] transform flex flex-col overflow-hidden",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      {/* Top Header bar */}
      <div className="p-4 border-b border-border/50 bg-card/25 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
            Deep Dive Academy
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-all"
          title="Dismiss panel (Esc)"
        >
          <X size={16} />
        </button>
      </div>

      {/* Tabs list navigation */}
      <div className="flex border-b border-border bg-card/10 px-6 shrink-0 select-none">
        <button
          onClick={() => setActiveTab('briefing')}
          className={cn(
            "px-5 py-4 text-xs uppercase tracking-wider font-extrabold border-b-2 transition-all flex items-center gap-1.5",
            activeTab === 'briefing'
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Briefing
        </button>
        <button
          onClick={() => setActiveTab('arsenal')}
          className={cn(
            "px-5 py-4 text-xs uppercase tracking-wider font-extrabold border-b-2 transition-all flex items-center gap-1.5",
            activeTab === 'arsenal'
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Arsenal
          {step.resources && step.resources.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-primary/10 border border-primary/20 text-primary">
              {step.resources.length}
            </span>
          )}
        </button>
        {sessionUserId && (
          <button
            onClick={() => setActiveTab('sandbox')}
            className={cn(
              "px-5 py-4 text-xs uppercase tracking-wider font-extrabold border-b-2 transition-all flex items-center gap-1.5",
              activeTab === 'sandbox'
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Sandbox
            {noteText.trim() && (
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            )}
          </button>
        )}
      </div>

      {/* Main Tab content container */}
      <div className="flex-1 overflow-y-auto p-6 pb-24 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <AnimatePresence mode="wait">
          {activeTab === 'briefing' && (
            <motion.div
              key="briefing"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-6"
            >
              {/* Hero Banner card */}
              <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-r from-primary/10 via-muted/30 to-background p-6 md:p-8 shadow-sm">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <Compass className="w-24 h-24" />
                </div>

                <div className="relative z-10 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded leading-none">
                      {step.isCustom ? 'Personal Quest' : `Objective ${step.order}`}
                    </span>
                    {step.branch && (
                      <span
                        className="px-2.5 py-1 rounded text-[10px] font-extrabold border uppercase tracking-wider leading-none"
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
                  <h3 className="text-xl md:text-2xl font-extrabold text-foreground tracking-tight leading-tight">
                    {step.title}
                  </h3>
                </div>
              </div>

              {/* Prose markdown block */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold tracking-widest text-muted-foreground/80 uppercase flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  Core Theory Briefing
                </h4>
                <div className="prose prose-slate dark:prose-invert max-w-none text-xs text-foreground/85 leading-relaxed bg-muted/20 border border-border/40 p-5 rounded-xl whitespace-pre-wrap break-words w-full">
                  {step.description}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'arsenal' && (
            <motion.div
              key="arsenal"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              <h4 className="text-[10px] font-bold tracking-widest text-muted-foreground/80 uppercase flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Premium Resources Grid
              </h4>

              {step.resources && step.resources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {step.resources.map((resource) => (
                    <div key={resource.id} className="w-full">
                      <ResourceCard
                        resource={resource}
                        viewMode="grid"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border/40 rounded-2xl text-muted-foreground/50 bg-muted/5">
                  <p className="text-xs">No learning resources linked to this step.</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'sandbox' && (
            <motion.div
              key="sandbox"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full gap-3 min-h-[350px]"
            >
              <div className="flex-1 flex flex-col bg-muted/20 border border-border/40 rounded-xl p-4 min-h-[300px]">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground/60 mb-2 select-none">
                  Active Recall Scratchpad
                </span>
                <textarea
                  value={noteText}
                  onChange={(e) => handleNoteChange(e.target.value)}
                  placeholder="Draft your architecture notes here (Markdown supported)..."
                  className="flex-1 w-full bg-transparent border-0 outline-none ring-0 focus:ring-0 focus:outline-none resize-none text-xs text-foreground/90 leading-relaxed placeholder:text-muted-foreground/45 break-words"
                />
              </div>
              <div className="text-[9px] text-muted-foreground/65 flex items-center justify-between px-1 shrink-0 select-none font-medium">
                <span>Auto-saving as you type...</span>
                <span>Markdown supported</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sticky Bottom docked completion button */}
      <div className="sticky bottom-0 bg-background/90 backdrop-blur-md p-4 border-t border-border/40 shrink-0 z-20">
        <Button
          onClick={handleSecureObjective}
          disabled={isMutating}
          className={cn(
            "w-full py-5 rounded-xl font-bold transition-all duration-300 shadow-md flex items-center justify-center gap-2 text-xs select-none",
            isCompleted
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : "bg-primary hover:bg-primary/95 text-primary-foreground"
          )}
        >
          {isMutating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isCompleted ? (
            <>
              <RotateCcw size={14} />
              Re-commission Objective
            </>
          ) : (
            <>
              <CheckCircle2 size={14} />
              Secure Objective (Mark Complete)
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
