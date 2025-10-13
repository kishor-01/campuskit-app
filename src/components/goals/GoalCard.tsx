// src/components/goals/GoalCard.tsx
'use client'

import React, { useState, useTransition, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Target, Edit, Trash2 } from 'lucide-react';
import Modal from '@/components/admin/Modal';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import ProgressBar from '@/components/ProgressBar';

type GoalCardProps = {
  goal: {
    id: string;
    title: string;
    percent: number;
    total: number;
    completed: number;
    targetDate?: string | null; // ISO or null
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

  // When opening modal, re-initialize from props (in case goal prop changed)
  const openEdit = () => {
    setTitle(goal.title ?? '');
    setTargetDate(goal.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : '');
    setIsEditOpen(true);
    // reset caret position
    caretPosRef.current = null;
  };

  // Preserve caret position on change to avoid jump/blur
  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Save caret pos BEFORE state update
    caretPosRef.current = e.target.selectionStart;
    setTitle(e.target.value);
  };

  // After render, if input exists restore focus + caret position
  useEffect(() => {
    if (isEditOpen && inputRef.current) {
      // focus
      inputRef.current.focus();
      // restore selection/caret
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

  return (
    <>
      <div className="group">
        <div className="bg-muted/50 p-6 rounded-lg h-full border-2 border-transparent group-hover:border-primary group-hover:bg-muted/70 transition-all duration-300 relative">
          <div className="absolute right-3 top-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={openEdit} title="Edit goal" className="p-1 hover:text-blue-500">
              <Edit size={16} />
            </button>
            <button onClick={handleDelete} title="Delete goal" disabled={isDeleting} className="p-1 hover:text-destructive">
              <Trash2 size={16} />
            </button>
          </div>

          <Link href={`/my-goals/${goal.id}`} className="block">
            <Target size={28} className="text-primary mb-4" />
            <h3 className="text-lg font-bold text-foreground">{goal.title}</h3>

            <div className="mt-4 max-w-xs">
              <ProgressBar percent={goal.percent} label={goal.total === 0 ? 'No sub-topics yet' : `${goal.completed}/${goal.total} subtopics`} />
            </div>
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
