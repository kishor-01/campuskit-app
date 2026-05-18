
//src/components/goals/CreateGoalButton.tsx

'use client'

import { useState, useTransition, useRef } from 'react';
import Modal from '@/components/admin/Modal';
import { createGoal } from '@/actions'; // Import from the central hub
import { PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation'; // Import the router

export default function CreateGoalButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter(); // Initialize the router
  const formRef = useRef<HTMLFormElement>(null);

  const formAction = (formData: FormData) => {
    startTransition(async () => {
      try {
        await createGoal({}, formData);
        toast.success('Goal created successfully.');
        setIsOpen(false);
        formRef.current?.reset();
        // This is the crucial step to refresh the page data
        router.refresh(); 
      } catch (err: any) {
        console.error('createGoal failed', err);
        toast.error(err.message || 'Could not create goal.');
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-semibold hover:bg-primary/90"
      >
        <PlusCircle size={16} />
        Create New Goal
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Create a New Goal">
        <form ref={formRef} action={formAction}>
          <div className="p-4 space-y-4">
            <input
              name="title"
              placeholder="Goal Title (e.g., GATE CSE 2026)"
              required
              className="w-full p-2 bg-input rounded-md"
            />
            <div>
              <label htmlFor="targetDate" className="text-sm text-muted-foreground mb-1 block">Target Date (Optional)</label>
              <input
                name="targetDate"
                id="targetDate"
                type="date"
                className="w-full p-2 bg-input rounded-md"
              />
            </div>
          </div>
          <div className="flex items-center justify-end p-4 border-t gap-2">
            <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg">Cancel</button>
            <button type="submit" disabled={isPending} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md font-semibold disabled:opacity-50">
              {isPending ? 'Creating...' : 'Create Goal'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
