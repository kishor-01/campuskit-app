// src/components/goals/GoalCard.tsx
'use client'

import React, { useState, useTransition, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Target, Edit, Trash2, Flame, Clock } from 'lucide-react';
import Modal from '@/components/admin/Modal';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import ProgressRing from '@/components/goals/ProgressRing';

const priorityConfig: Record<string, { label: string; dot: string; bg: string }> = {
  LOW: { label: 'Low', dot: 'bg-blue-400', bg: 'bg-blue-500/10 text-blue-400' },
  MEDIUM: { label: 'Medium', dot: 'bg-amber-400', bg: 'bg-amber-500/10 text-amber-400' },
  HIGH: { label: 'High', dot: 'bg-orange-400', bg: 'bg-orange-500/10 text-orange-400' },
  CRITICAL: { label: 'Critical', dot: 'bg-red-400', bg: 'bg-red-500/10 text-red-400' },
};

type GoalCardProps = {
  goal: {
    id: string;
    title: string;
    percent: number;
    total: number;
    completed: number;
    targetDate?: string | null;
    currentStreak?: number;
    totalFocusTime?: number;
    priority?: string;
  };
};

export default function GoalCard({ goal }: GoalCardProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Local editable state
  const [title, setTitle] = useState(goal.title);
  const [targetDate, setTargetDate] = useState<string>(
    goal.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : ''
  );

  // focus + caret preservation
  const inputRef = useRef<HTMLInputElement | null>(null);
  const caretPosRef = useRef<number | null>(null);

  // useTransition for non-blocking refresh
  const [, startTransition] = useTransition();

  const pConfig = priorityConfig[goal.priority || 'MEDIUM'] || priorityConfig.MEDIUM;

  // When opening modal, re-initialize from props (in case goal prop changed)
  const openEdit = () => {
    setTitle(goal.title ?? '');
    setTargetDate(goal.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : '');
    setIsEditOpen(true);
    caretPosRef.current = null;
  };

  // Preserve caret position on change to avoid jump/blur
  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    caretPosRef.current = e.target.selectionStart;
    setTitle(e.target.value);
  };

  // After render, if input exists restore focus + caret position
  useEffect(() => {
    if (isEditOpen && inputRef.current) {
      inputRef.current.focus();
      const pos = caretPosRef.current;
      if (typeof pos === 'number') {
        try {
          inputRef.current.setSelectionRange(pos, pos);
        } catch {
          /* ignore if it fails (e.g., invalid pos) */
        }
      }
    }
  }, [title, isEditOpen]);

  // Update handler (calls server API)
  const handleUpdate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!title.trim()) {
      toast.error('Title cannot be empty');
      return;
    }

    setIsWorking(true);
    try {
      const res = await fetch('/api/goals/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: goal.id, title: title.trim(), targetDate: targetDate || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error ?? 'Failed to update goal');
      } else {
        toast.success('Goal updated');
        setIsEditOpen(false);
        startTransition(() => router.refresh());
      }
    } catch (err) {
      console.error('Update error', err);
      toast.error('Failed to update goal');
    } finally {
      setIsWorking(false);
    }
  };

  // Delete handler
  const handleDelete = async () => {
    if (!confirm('Delete this goal? This cannot be undone.')) return;
    setIsDeleting(true);
    try {
      const res = await fetch('/api/goals/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: goal.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error ?? 'Failed to delete goal');
      } else {
        toast.success('Goal deleted');
        startTransition(() => router.refresh());
      }
    } catch (err) {
      console.error('Delete error', err);
      toast.error('Failed to delete goal');
    } finally {
      setIsDeleting(false);
    }
  };

  const focusHours = goal.totalFocusTime ? Math.floor((goal.totalFocusTime || 0) / 60) : 0;
  const focusMins = (goal.totalFocusTime || 0) % 60;

  return (
    <>
      <div className="group">
        <div className="relative bg-card p-6 rounded-2xl h-full border border-border overflow-hidden
                        group-hover:border-primary/40 group-hover:shadow-lg group-hover:shadow-primary/5
                        transition-all duration-500">
          {/* Top gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent
                          opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Actions */}
          <div className="absolute right-3 top-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={openEdit} title="Edit goal" className="p-1.5 rounded-md hover:bg-muted hover:text-blue-500 transition-colors">
              <Edit size={14} />
            </button>
            <button onClick={handleDelete} title="Delete goal" disabled={isDeleting} className="p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors">
              <Trash2 size={14} />
            </button>
          </div>

          <Link href={`/my-goals/${goal.id}`} className="block">
            {/* Priority + Streak row */}
            <div className="flex items-center justify-between mb-4">
              <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold ${pConfig.bg}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${pConfig.dot}`} />
                {pConfig.label}
              </span>

              {(goal.currentStreak || 0) > 0 && (
                <span className="flex items-center gap-1 text-xs font-bold text-orange-400 streak-glow">
                  <Flame size={14} className="text-orange-500" />
                  {goal.currentStreak}d
                </span>
              )}
            </div>

            {/* Center: Progress Ring */}
            <div className="flex justify-center mb-4">
              <ProgressRing
                percent={goal.percent}
                size={90}
                strokeWidth={7}
                label={goal.total === 0 ? 'No tasks' : `${goal.completed}/${goal.total}`}
              />
            </div>

            {/* Title */}
            <h3 className="text-base font-bold text-foreground text-center mb-3 line-clamp-2 group-hover:text-primary transition-colors">
              {goal.title}
            </h3>

            {/* Focus time */}
            {(goal.totalFocusTime || 0) > 0 && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Clock size={11} />
                {focusHours > 0 ? `${focusHours}h ${focusMins}m` : `${focusMins}m`} focused
              </div>
            )}
          </Link>
        </div>
      </div>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Goal">
        <form onSubmit={handleUpdate}>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-sm font-semibold block mb-1">Goal Title</label>
              <input
                ref={inputRef}
                value={title}
                onChange={onTitleChange}
                className="w-full p-2 bg-input rounded-md"
                autoFocus
                inputMode="text"
                spellCheck={false}
              />
            </div>

            <div>
              <label className="text-sm font-semibold block mb-1">Target date (optional)</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full p-2 bg-input rounded-md"
              />
            </div>
          </div>

          <div className="flex items-center justify-end p-4 border-t gap-2">
            <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg">Cancel</button>
            <button type="submit" disabled={isWorking} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md font-semibold">
              {isWorking ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
