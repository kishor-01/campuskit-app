// /src/app/admin/roadmaps/[id]/ManageStepsClientPage.tsx

'use client'

import { useActionState } from 'react'
import { useEffect, useRef } from 'react'
import { createRoadmapStep, deleteRoadmapStep } from '@/actions'
import StepItem from './StepItem'
import { toast } from 'react-hot-toast'
import { SubmitButton } from '@/components/admin/SubmitButton'
import type { Roadmap, RoadmapStep, Resource } from '@prisma/client'

type StepWithLinkedResources = RoadmapStep & {
  linkedResources: { resourceId: string }[];
};

type RoadmapWithSteps = Roadmap & {
  steps: StepWithLinkedResources[];
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

export default function ManageStepsClientPage({
  roadmap,
  allApprovedResources
}: {
  roadmap: RoadmapWithSteps;
  allApprovedResources: Resource[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  
  // Use useActionState with explicit generics
  const [createState, createAction] = useActionState<CreateState, FormData>(
    createRoadmapStep as (state: CreateState, formData: FormData) => Promise<CreateState>,
    { message: null, error: null }
  );
  
  const [deleteState, deleteAction] = useActionState<DeleteState, FormData>(
    deleteRoadmapStep as (state: DeleteState, formData: FormData) => Promise<DeleteState>,
    { message: null, error: null }
  );

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <p className="text-sm font-semibold text-primary mb-2">Roadmap</p>
      <h1 className="text-4xl font-extrabold text-foreground mb-8">{roadmap.title}</h1>
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
      <div className="bg-muted/50 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Existing Steps</h2>
        <div className="space-y-3">
          {roadmap.steps.map(step => (
            <StepItem
              key={step.id}
              step={step}
              allResources={allApprovedResources}
              deleteAction={deleteAction}
            />
          ))}
          {roadmap.steps.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No steps added yet.</p>}
        </div>
      </div>
    </div>
  );
}