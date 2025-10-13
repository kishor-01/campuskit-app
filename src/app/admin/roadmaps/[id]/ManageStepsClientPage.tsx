//src/app/admin/roadmaps/[id]/ManageStepsClientPage.tsx

'use client'

import { useFormState } from 'react-dom'
import { useEffect, useRef } from 'react'
import { createRoadmapStep, deleteRoadmapStep } from '@/actions'
import StepItem from './StepItem' 
import { toast } from 'react-hot-toast'
import { SubmitButton } from '@/components/admin/SubmitButton'
import type { Roadmap, RoadmapStep, Resource } from '@prisma/client'

// Define more specific types for the props
type StepWithLinkedResources = RoadmapStep & {
  linkedResources: { resourceId: string }[];
};
type RoadmapWithSteps = Roadmap & {
  steps: StepWithLinkedResources[];
};

export default function ManageStepsClientPage({
    roadmap,
    allApprovedResources
}: {
    roadmap: RoadmapWithSteps;
    allApprovedResources: Resource[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [createState, createAction] = useFormState(createRoadmapStep, { message: null, error: null });
  const [deleteState, deleteAction] = useFormState(deleteRoadmapStep, { message: null, error: null });

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
              deleteAction={deleteAction} // Pass the delete action down
            />
          ))}
          {roadmap.steps.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No steps added yet.</p>}
        </div>
      </div>
    </div>
  );
}
