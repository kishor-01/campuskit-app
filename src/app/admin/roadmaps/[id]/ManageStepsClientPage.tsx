// /src/app/admin/roadmaps/[id]/ManageStepsClientPage.tsx

'use client'

import { useActionState } from 'react'
import { useEffect, useRef, useState } from 'react'
import { createRoadmapStep, deleteRoadmapStep, createBranch, deleteBranch } from '@/actions'
import StepItem from './StepItem'
import { toast } from 'react-hot-toast'
import { SubmitButton } from '@/components/admin/SubmitButton'
import type { Roadmap, RoadmapStep, RoadmapBranch, Resource } from '@prisma/client'
import { GitBranch, Trash2, Palette } from 'lucide-react'

type StepWithLinkedResources = RoadmapStep & {
  linkedResources: { resourceId: string }[];
  branch?: RoadmapBranch | null;
};

type RoadmapWithStepsAndBranches = Roadmap & {
  steps: StepWithLinkedResources[];
  branches: RoadmapBranch[];
};

// Define proper state types
type CreateState = {
  message?: string | null;
  error?: { [key: string]: string[] } | string | null;
};

type DeleteState = {
  message?: string | null;
  error?: string | null;
};

const BRANCH_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#a855f7',
];

export default function ManageStepsClientPage({
  roadmap,
  allApprovedResources
}: {
  roadmap: RoadmapWithStepsAndBranches;
  allApprovedResources: Resource[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const branchFormRef = useRef<HTMLFormElement>(null);
  
  // Step actions
  const [createState, createAction] = useActionState<CreateState, FormData>(
    createRoadmapStep as (state: CreateState, formData: FormData) => Promise<CreateState>,
    { message: null, error: null }
  );
  
  const [deleteState, deleteAction] = useActionState<DeleteState, FormData>(
    deleteRoadmapStep as (state: DeleteState, formData: FormData) => Promise<DeleteState>,
    { message: null, error: null }
  );

  // Branch actions
  const [branchCreateState, branchCreateAction] = useActionState<CreateState, FormData>(
    createBranch as (state: CreateState, formData: FormData) => Promise<CreateState>,
    { message: null, error: null }
  );

  const [branchDeleteState, branchDeleteAction] = useActionState<DeleteState, FormData>(
    deleteBranch as (state: DeleteState, formData: FormData) => Promise<DeleteState>,
    { message: null, error: null }
  );

  const [selectedColor, setSelectedColor] = useState(BRANCH_COLORS[0]);

  useEffect(() => {
    if (createState?.message) {
      toast.success(createState.message);
      formRef.current?.reset();
    }
    if (createState?.error) {
      const errorMessage = typeof createState.error === 'string' 
        ? createState.error 
        : Object.values(createState.error).flat().join('\n');
      toast.error(errorMessage);
    }
  }, [createState]);

  useEffect(() => {
    if (deleteState?.message) toast.success(deleteState.message);
    if (deleteState?.error) toast.error(deleteState.error);
  }, [deleteState]);

  useEffect(() => {
    if (branchCreateState?.message) {
      toast.success(branchCreateState.message);
      branchFormRef.current?.reset();
      setSelectedColor(BRANCH_COLORS[Math.floor(Math.random() * BRANCH_COLORS.length)]);
    }
    if (branchCreateState?.error) {
      const errorMessage = typeof branchCreateState.error === 'string'
        ? branchCreateState.error
        : Object.values(branchCreateState.error).flat().join('\n');
      toast.error(errorMessage);
    }
  }, [branchCreateState]);

  useEffect(() => {
    if (branchDeleteState?.message) toast.success(branchDeleteState.message);
    if (branchDeleteState?.error) toast.error(branchDeleteState.error);
  }, [branchDeleteState]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <p className="text-sm font-semibold text-primary mb-2">Roadmap</p>
      <h1 className="text-4xl font-extrabold text-foreground mb-8">{roadmap.title}</h1>

      {/* Branch Management Section */}
      <div className="bg-gradient-to-br from-violet-500/5 to-indigo-500/5 border border-violet-500/20 p-6 rounded-xl mb-8">
        <div className="flex items-center gap-2 mb-4">
          <GitBranch size={20} className="text-violet-500" />
          <h2 className="text-2xl font-bold">Skill Tree Branches</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Define visual forks in the learning tree. Assign steps to branches to create the Skill Tree hierarchy.
        </p>

        {/* Create Branch Form */}
        <form ref={branchFormRef} action={branchCreateAction} className="flex flex-wrap items-end gap-3 mb-5">
          <input type="hidden" name="roadmapId" value={roadmap.id} />
          <input type="hidden" name="color" value={selectedColor} />
          
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-semibold block mb-1">Branch Name</label>
            <input
              name="title"
              placeholder="e.g., Frontend Track"
              required
              className="w-full p-2 bg-input rounded-md text-sm"
            />
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-semibold block mb-1">Description (optional)</label>
            <input
              name="description"
              placeholder="Brief description of this branch"
              className="w-full p-2 bg-input rounded-md text-sm"
            />
          </div>
          
          <div>
            <label className="text-xs font-semibold block mb-1">
              <Palette size={11} className="inline mr-1" />
              Color
            </label>
            <div className="flex items-center gap-1">
              {BRANCH_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    selectedColor === c ? 'border-foreground scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <SubmitButton text="Add Branch" />
        </form>

        {/* Existing Branches */}
        {roadmap.branches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {roadmap.branches.map((branch) => {
              const stepCount = roadmap.steps.filter((s) => s.branchId === branch.id).length;
              return (
                <div
                  key={branch.id}
                  className="flex items-center justify-between bg-background p-3 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full shrink-0"
                      style={{ backgroundColor: branch.color || '#6366f1' }}
                    />
                    <div>
                      <p className="font-semibold text-sm">{branch.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {stepCount} step{stepCount !== 1 ? 's' : ''} assigned
                      </p>
                    </div>
                  </div>
                  <form action={branchDeleteAction}>
                    <input type="hidden" name="id" value={branch.id} />
                    <input type="hidden" name="roadmapId" value={roadmap.id} />
                    <button
                      type="submit"
                      className="p-1.5 text-destructive hover:bg-destructive/10 rounded-full"
                      title="Delete branch"
                      onClick={(e) => {
                        if (!window.confirm(`Delete branch "${branch.title}"? Steps will be unassigned.`))
                          e.preventDefault();
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-3 bg-muted/30 rounded-lg">
            No branches created yet. Add branches to create visual forks in the Skill Tree.
          </p>
        )}
      </div>

      {/* Add Step Form */}
      <div className="bg-muted/50 p-6 rounded-lg mb-8">
        <h2 className="text-2xl font-bold mb-4">Add New Step</h2>
        <form ref={formRef} action={createAction} className="space-y-4">
          <input type="hidden" name="roadmapId" value={roadmap.id} />
          <div className="grid grid-cols-1 md:grid-cols-[100px_1fr] gap-4">
            <input name="order" type="number" placeholder="Order #" required className="w-full p-2 bg-input rounded-md" />
            <input name="title" placeholder="Step Title" required className="w-full p-2 bg-input rounded-md" />
          </div>
          <textarea name="description" placeholder="A brief description of this step." required rows={3} className="w-full p-2 bg-input rounded-md" />
          <SubmitButton text="Add Step" />
        </form>
      </div>

      {/* Steps List */}
      <div className="bg-muted/50 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Existing Steps</h2>
        <div className="space-y-3">
          {roadmap.steps.map(step => (
            <StepItem
              key={step.id}
              step={step}
              allResources={allApprovedResources}
              branches={roadmap.branches}
              deleteAction={deleteAction}
            />
          ))}
          {roadmap.steps.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No steps added yet.</p>}
        </div>
      </div>
    </div>
  );
}