// /src/app/admin/roadmaps/RoadmapsClientPage.tsx

'use client'

import { useActionState } from 'react'
import { useEffect, useRef } from 'react'
import type { Roadmap, RoadmapStep } from '@prisma/client'
import { createRoadmap, deleteRoadmap, toggleRoadmapStatus } from '@/actions'
import Link from 'next/link'
import { PlusCircle, Trash2, ArrowRight, Eye, EyeOff, GitBranch } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { SubmitButton } from '@/components/admin/SubmitButton'
import ViewRoadmapButton from './ViewRoadmapButton'

type RoadmapWithSteps = Roadmap & { steps: RoadmapStep[] };

const StatusBadge = ({ isPublished }: { isPublished: boolean }) => (
  <span className={`px-2 py-1 text-xs font-medium rounded-full ${isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
    {isPublished ? 'Published' : 'Draft'}
  </span>
);

export default function RoadmapsClientPage({ roadmaps }: { roadmaps: RoadmapWithSteps[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [createState, createAction] = useActionState<any, any>(createRoadmap as any, { message: null, error: null });
  const [deleteState, deleteAction] = useActionState<any, any>(deleteRoadmap as any, { message: null, error: null });
  const [toggleState, toggleAction] = useActionState<any, any>(toggleRoadmapStatus as any, { message: null, error: null });

  useEffect(() => {
    if (createState?.message) {
      toast.success(createState.message);
      formRef.current?.reset();
    }
    if (createState?.error) toast.error(Object.values(createState.error).flat().join('\n'));
  }, [createState]);

  useEffect(() => {
    if (deleteState?.message) toast.success(deleteState.message);
    if (deleteState?.error) toast.error(deleteState.error);
  }, [deleteState]);

  useEffect(() => {
    if (toggleState?.message) toast.success(toggleState.message);
    if (toggleState?.error) toast.error(toggleState.error);
  }, [toggleState]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-extrabold text-foreground mb-8">Roadmap Management</h1>
      <div className="bg-muted/50 p-6 rounded-lg mb-8">
        <h2 className="text-2xl font-bold mb-4">Create New Roadmap</h2>
        <form ref={formRef} action={createAction} className="space-y-4">
          <input name="title" placeholder="Roadmap Title" required className="w-full p-2 bg-input rounded-md" />
          <input name="slug" placeholder="URL Slug (e.g., web-dev-2025)" required className="w-full p-2 bg-input rounded-md" />
          <textarea name="description" placeholder="A brief description of this roadmap." required rows={3} className="w-full p-2 bg-input rounded-md" />
          <SubmitButton text="Create Roadmap" />
        </form>
      </div>
      <div className="bg-muted/50 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Existing Roadmaps</h2>
        <div className="space-y-3">
          {Array.isArray(roadmaps) && roadmaps.map(roadmap => (
            <div key={roadmap.id} className="bg-background p-4 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-4">
                <StatusBadge isPublished={roadmap.isPublished} />
                <div>
                  <p className="font-semibold">{roadmap.title}</p>
                  <p className="text-xs text-muted-foreground">{roadmap.slug}</p>
                  <p className="text-xs text-muted-foreground mt-1">{roadmap.steps.length} step(s)</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <form action={toggleAction}>
                  <input type="hidden" name="id" value={roadmap.id} />
                  <input type="hidden" name="isPublished" value={String(roadmap.isPublished)} />
                  <button type="submit" className={`flex items-center gap-1 text-sm font-semibold px-3 py-2 rounded-md ${roadmap.isPublished ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                    {roadmap.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
                    {roadmap.isPublished ? 'Unpublish' : 'Publish'}
                  </button>
                </form>
                <ViewRoadmapButton isPublished={roadmap.isPublished} slug={roadmap.slug} />
                <Link href={`/admin/forge/${roadmap.slug}`} className="flex items-center gap-1 text-sm font-semibold bg-violet-600/20 text-violet-400 border border-violet-500/30 px-3 py-2 rounded-md hover:bg-violet-600/30 transition-colors">
                  <GitBranch size={14} /> Graph Forge
                </Link>
                <Link href={`/admin/roadmaps/${roadmap.id}`} className="flex items-center gap-1 text-sm font-semibold bg-primary text-primary-foreground px-3 py-2 rounded-md hover:bg-primary/90">
                  Manage Steps <ArrowRight size={14} />
                </Link>
                <form action={deleteAction}>
                  <input type="hidden" name="id" value={roadmap.id} />
                  <button type="submit" className="p-2 text-destructive hover:bg-destructive/10 rounded-full" title="Delete" onClick={(e) => !window.confirm('Are you sure you want to delete this roadmap?') && e.preventDefault()}>
                    <Trash2 size={16} />
                  </button>
                </form>
              </div>
            </div>
          ))}
          {(!Array.isArray(roadmaps) || roadmaps.length === 0) && <p className="text-sm text-muted-foreground text-center py-4">No roadmaps created yet.</p>}
        </div>
      </div>
    </div>
  );
}