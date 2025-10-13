'use client'

import { useState } from 'react';
import Modal from '@/components/admin/Modal';
import { createGoal } from '@/actions/goalActions';
import { PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreateGoalButton() {
  const [isOpen, setIsOpen] = useState(false);

  const formAction = async (formData: FormData) => {
    try {
      await createGoal(formData);
      setIsOpen(false); // Close the modal on success
      toast.success('Goal created');
    } catch (err) {
      console.error('createGoal failed', err);
      toast.error('Could not create goal');
    }
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
        <form action={formAction}>
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
            <button type="submit" className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md font-semibold">Create Goal</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
