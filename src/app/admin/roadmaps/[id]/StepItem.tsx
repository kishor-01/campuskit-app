
//src/app/admin/roadmaps/[id]/StepItem.tsx

'use client'

import { useEffect, useState } from 'react';
import { useFormState } from 'react-dom';
import { updateRoadmapStep } from '@/actions';
import { Trash2, Edit, Link as LinkIcon } from 'lucide-react';
import Modal from '@/components/admin/Modal';
import LinkResourcesForm from './LinkResourcesForm';
import { toast } from 'react-hot-toast';
import { SubmitButton } from '@/components/admin/SubmitButton';
import type { RoadmapStep, Resource } from '@prisma/client';

// Define a more specific type for the step prop
type StepWithLinkedResources = RoadmapStep & {
  linkedResources: { resourceId: string }[];
};

type StepItemProps = {
  step: StepWithLinkedResources;
  allResources: Resource[];
  deleteAction: (payload: FormData) => void;
};

export default function StepItem({ step, allResources, deleteAction }: StepItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateState, updateAction] = useFormState(updateRoadmapStep, { message: null, error: null });

  // FIX: Replaced 'useState' with 'useEffect' and added the dependency array.
  // This hook now correctly listens for changes from the server action.
  useEffect(() => {
    if (updateState?.message) {
      toast.success(updateState.message);
      setIsEditing(false); // This will now correctly close the edit form on success.
    }
    if (updateState?.error) {
      toast.error(updateState.error);
    }
  }, [updateState]); // The dependency array ensures this runs when the updateState changes.

  const linkedResourceIds = step.linkedResources.map(lr => lr.resourceId);

  // This is the editing form that appears when you click the "Edit" icon
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

  // This is the default display for the step
  return (
    <>
      <div className="bg-background p-3 rounded-lg flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="text-2xl font-bold text-primary w-8 text-center">{step.order}</div>
          <div className="flex-1">
            <p className="font-semibold">{step.title}</p>
            <p className="text-sm text-muted-foreground">{step.description}</p>
            {linkedResourceIds.length > 0 && (
              <p className="text-xs text-green-600 mt-1">
                {linkedResourceIds.length} linked resource{linkedResourceIds.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
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
