// src/components/goals/ArchitectPathButton.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/admin/Modal';
import toast from 'react-hot-toast';
import { Hammer, Calendar, AlertTriangle } from 'lucide-react';

type ArchitectPathButtonProps = {
  roadmapId: string;
  roadmapTitle: string;
  seniorInsight?: string;
};

/**
 * "Architect this Path" — One-click button that clones a full roadmap 
 * into the user's personal Goals, preserving structure, resources, and insights.
 */
export default function ArchitectPathButton({
  roadmapId,
  roadmapTitle,
  seniorInsight,
}: ArchitectPathButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState(roadmapTitle);
  const [targetDate, setTargetDate] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [isWorking, setIsWorking] = useState(false);
  const router = useRouter();

  const openModal = () => {
    setTitle(roadmapTitle);
    setTargetDate('');
    setPriority('MEDIUM');
    setIsOpen(true);
  };

  const performImport = async (replace = false) => {
    if (!title.trim()) {
      toast.error('Title cannot be empty');
      return;
    }
    setIsWorking(true);
    try {
      const res = await fetch('/api/import-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roadmapId,
          title: title.trim(),
          targetDate: targetDate || null,
          priority,
          includeResources: true,
          includeNotes: true,
          replace,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error ?? 'Import failed');
        setIsWorking(false);
        return;
      }

      if (data.duplicate) {
        const ok = confirm(
          'A goal with this title already exists. Replace it with a fresh import?'
        );
        if (ok) {
          await performImport(true);
        } else {
          toast('Import cancelled');
          setIsWorking(false);
        }
      } else if (data.success && data.newGoalId) {
        toast.success('🏗️ Path Architected! Redirecting to your goal…');
        setIsOpen(false);
        router.push(`/my-goals/${data.newGoalId}`);
      } else {
        toast.error('Unexpected response');
      }
    } catch (err) {
      console.error('Architect path error', err);
      toast.error('Failed to architect path');
    } finally {
      setIsWorking(false);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    performImport(false);
  };

  const priorityColors: Record<string, string> = {
    LOW: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    MEDIUM: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <>
      <button
        onClick={openModal}
        className="architect-path-btn flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm
                   bg-gradient-to-r from-primary/90 to-primary text-primary-foreground
                   hover:from-primary hover:to-primary/80 hover:shadow-lg hover:shadow-primary/20
                   transition-all duration-300 transform hover:scale-[1.02] active:scale-95"
      >
        <Hammer size={18} />
        🏗️ Architect this Path
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Architect this Learning Path">
        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-5">
            {/* Senior Insight callout */}
            {seniorInsight && (
              <div className="flex gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">Senior Insight</p>
                  <p className="text-sm text-foreground/80 italic">&ldquo;{seniorInsight}&rdquo;</p>
                </div>
              </div>
            )}

            {/* Goal Title */}
            <div>
              <label className="text-sm font-semibold block mb-1.5">Goal Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 bg-input rounded-lg border border-border focus:border-primary transition-colors"
                placeholder="My Learning Path"
              />
            </div>

            {/* Target Date */}
            <div>
              <label className="text-sm font-semibold block mb-1.5">
                <Calendar size={14} className="inline mr-1" />
                Target Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full p-2.5 bg-input rounded-lg border border-border focus:border-primary transition-colors"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Set a deadline to unlock AI-generated study plans.
              </p>
            </div>

            {/* Priority */}
            <div>
              <label className="text-sm font-semibold block mb-2">Priority Level</label>
              <div className="grid grid-cols-4 gap-2">
                {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all duration-200
                      ${priority === p
                        ? priorityColors[p] + ' ring-1 ring-offset-1 ring-offset-background'
                        : 'bg-muted/30 text-muted-foreground border-border hover:bg-muted/50'
                      }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end p-4 border-t gap-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isWorking}
              className="px-5 py-2.5 text-sm bg-primary text-primary-foreground rounded-lg font-bold
                         hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isWorking ? 'Forging…' : '🏗️ Architect Path'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
