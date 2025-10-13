'use client'

import { useState } from 'react';
import Modal from '@/components/admin/Modal';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Map, PlusCircle } from 'lucide-react';

type RoadmapMini = { id: string; title: string; description: string; slug?: string };

export default function ImportRoadmapButton({ roadmaps }: { roadmaps: RoadmapMini[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(roadmaps?.[0]?.id ?? null);
  const [title, setTitle] = useState<string>(roadmaps?.[0]?.title ?? '');
  const [targetDate, setTargetDate] = useState<string>('');
  const [includeResources, setIncludeResources] = useState(true);
  const [includeNotes, setIncludeNotes] = useState(true);
  const [isWorking, setIsWorking] = useState(false);
  const router = useRouter();

  const openModal = () => {
    setSelected(roadmaps?.[0]?.id ?? null);
    setTitle(roadmaps?.[0]?.title ?? '');
    setTargetDate('');
    setIncludeResources(true);
    setIncludeNotes(true);
    setIsOpen(true);
  };

  const handleRoadmapChange = (id: string | null) => {
    setSelected(id);
    const found = roadmaps.find(r => r.id === id);
    if (found) setTitle(found.title);
  };

  const performImport = async (replace = false) => {
    if (!selected) {
      toast.error('Select a roadmap first');
      return;
    }
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
          roadmapId: selected,
          title: title.trim(),
          targetDate: targetDate || null,
          includeResources,
          includeNotes,
          replace
        })
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error ?? 'Import failed');
        setIsWorking(false);
        return;
      }

      if (data.duplicate) {
        // Ask user: replace or cancel
        const ok = confirm('A goal with this title already exists. Do you want to replace it? (Replace will delete the existing goal and create a new one.)');
        if (ok) {
          // Call again with replace = true
          await performImport(true);
        } else {
          toast('Import cancelled');
          setIsWorking(false);
          return;
        }
      } else if (data.success && data.newGoalId) {
        toast.success('Roadmap imported into your Goals');
        setIsOpen(false);
        // Navigate to the new goal detail
        router.push(`/my-goals/${data.newGoalId}`);
      } else {
        toast.error('Unexpected response from server');
      }
    } catch (err) {
      console.error('Import error', err);
      toast.error('Failed to import roadmap');
    } finally {
      setIsWorking(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    await performImport(false);
  };

  return (
    <>
      <button onClick={openModal} className="flex items-center gap-2 px-4 py-2 bg-secondary/10 text-foreground rounded-md hover:bg-muted/70">
        <Map size={16} /> Import Roadmap
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Import Roadmap as a Goal">
        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-sm font-semibold block mb-1">Choose a roadmap</label>
              <select value={selected ?? ''} onChange={(e) => handleRoadmapChange(e.target.value || null)} className="w-full p-2 bg-input rounded-md">
                {roadmaps.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold block mb-1">Goal title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 bg-input rounded-md" />
            </div>

            <div>
              <label className="text-sm font-semibold block mb-1">Target date (optional)</label>
              <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="w-full p-2 bg-input rounded-md" />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={includeResources} onChange={(e) => setIncludeResources(e.target.checked)} />
                <span className="text-sm">Include resources (only approved)</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={includeNotes} onChange={(e) => setIncludeNotes(e.target.checked)} />
                <span className="text-sm">Include notes/descriptions</span>
              </label>
            </div>

            <div className="text-sm text-muted-foreground">
              Note: If a resource is not approved or missing it will be skipped.
            </div>
          </div>

          <div className="flex items-center justify-end p-4 border-t gap-2">
            <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg">Cancel</button>
            <button type="submit" disabled={isWorking} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md font-semibold">
              {isWorking ? 'Importing…' : 'Import Roadmap'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
