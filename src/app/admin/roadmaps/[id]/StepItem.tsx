// /src/app/admin/roadmaps/[id]/StepItem.tsx

'use client'

import { useEffect, useState, useTransition } from 'react';
import { useActionState } from 'react';
import { updateRoadmapStep, assignStepToBranch } from '@/actions';
import { Trash2, Edit, Link as LinkIcon, GitBranch } from 'lucide-react';
import Modal from '@/components/admin/Modal';
import LinkResourcesForm from './LinkResourcesForm';
import { toast } from 'react-hot-toast';
import { SubmitButton } from '@/components/admin/SubmitButton';
import type { RoadmapStep, RoadmapBranch, Resource } from '@prisma/client';

type StepWithLinkedResources = RoadmapStep & {
  linkedResources: { resourceId: string }[];
  branch?: RoadmapBranch | null;
};

type StepItemProps = {
  step: StepWithLinkedResources;
  allResources: Resource[];
  branches: RoadmapBranch[];
  deleteAction: (payload: FormData) => void;
};

// Define proper state type for update
type UpdateState = {
  message?: string | null;
  error?: { [key: string]: string[] } | string | null;
};

type AssignState = {
  message?: string | null;
  error?: string | null;
};

export default function StepItem({ step, allResources, branches, deleteAction }: StepItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  
  // Use useActionState with explicit generics (same pattern that worked above)
  const [updateState, updateAction] = useActionState<UpdateState, FormData>(
    updateRoadmapStep as (state: UpdateState, formData: FormData) => Promise<UpdateState>,
    { message: null, error: null }
  );

  const [assignState, assignAction] = useActionState<AssignState, FormData>(
    assignStepToBranch as (state: AssignState, formData: FormData) => Promise<AssignState>,
    { message: null, error: null }
  );

  useEffect(() => {
    if (updateState?.message) {
      toast.success(updateState.message);
      setIsEditing(false);
    }
    if (updateState?.error) {
      // Handle both string and object error types
      const errorMessage = typeof updateState.error === 'string' 
        ? updateState.error 
        : Object.values(updateState.error).flat().join('\n');
      toast.error(errorMessage);
    }
  }, [updateState]);

  useEffect(() => {
    if (assignState?.message) toast.success(assignState.message);
    if (assignState?.error) toast.error(assignState.error);
  }, [assignState]);

  const linkedResourceIds = step.linkedResources.map(lr => lr.resourceId);

  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const formData = new FormData();
    formData.append('stepId', step.id);
    formData.append('roadmapId', step.roadmapId);
    formData.append('branchId', e.target.value);
    startTransition(() => {
      assignAction(formData);
    });
  };

  if (isEditing) {
    return (
      <form
        action={updateAction}
        className="bg-background p-4 rounded-lg space-y-2 border border-primary"
      >
        <input type="hidden" name="id" value={step.id} />
        <input type="hidden" name="roadmapId" value={step.roadmapId} />
        <div className="grid grid-cols-1 md:grid-cols-[100px_1fr] gap-4">
          <input name="order" type="number" defaultValue={step.order} required className="w-full p-2 bg-muted/50 rounded-md" />
          <input name="title" defaultValue={step.title} required className="w-full p-2 bg-muted/50 rounded-md" />
        </div>
        <textarea name="description" defaultValue={step.description} rows={3} required className="w-full p-2 bg-muted/50 rounded-md" />
        <div className="flex items-center gap-2">
          <SubmitButton text="Save Changes" />
          <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg">Cancel</button>
        </div>
      </form>
    );
  }

  return (
    <>
      <div className="bg-background p-3 rounded-lg flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="text-2xl font-bold text-primary w-8 text-center">{step.order}</div>
          <div className="flex-1">
            <p className="font-semibold">{step.title}</p>
            <p className="text-sm text-muted-foreground">{step.description}</p>
            
            {/* Branch badge */}
            {step.branch && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-1 border"
                style={{
                  backgroundColor: `${step.branch.color || '#6366f1'}15`,
                  color: step.branch.color || '#6366f1',
                  borderColor: `${step.branch.color || '#6366f1'}30`,
                }}
              >
                <GitBranch size={10} />
                {step.branch.title}
              </span>
            )}

            {linkedResourceIds.length > 0 && (
              <p className="text-xs text-green-600 mt-1">
                {linkedResourceIds.length} linked resource{linkedResourceIds.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          {/* Branch assignment dropdown */}
          {branches.length > 0 && (
            <select
              value={step.branchId || ''}
              onChange={handleBranchChange}
              disabled={isPending}
              className="text-xs bg-muted/50 border border-border rounded-md px-2 py-1.5 max-w-[140px] disabled:opacity-50"
              title="Assign to branch"
            >
              <option value="">No Branch</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  🔀 {b.title}
                </option>
              ))}
            </select>
          )}

          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1 text-sm font-semibold text-blue-600 px-3 py-1 rounded-md hover:bg-blue-500/10">
            Link Resources ({linkedResourceIds.length}) <LinkIcon size={14} />
          </button>
          <button onClick={() => setIsEditing(true)} className="p-1 hover:text-blue-500 rounded-full" title="Edit">
            <Edit size={16} />
          </button>
          <form action={deleteAction}>
            <input type="hidden" name="id" value={step.id} />
            <input type="hidden" name="roadmapId" value={step.roadmapId} />
            <button type="submit" className="p-1 text-destructive hover:bg-destructive/10 rounded-full" title="Delete" onClick={(e) => { if (!window.confirm("Are you sure you want to delete this step?")) e.preventDefault()}}>
              <Trash2 size={16} />
            </button>
          </form>
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Link Resources to: ${step.title}`}>
        <LinkResourcesForm stepId={step.id} allResources={allResources} linkedResourceIds={linkedResourceIds} onClose={() => setIsModalOpen(false)} />
      </Modal>
    </>
  );
}