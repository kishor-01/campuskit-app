// /src/components/admin/AffiliatePartnerManager.tsx
'use client'

import { useFormState } from "react-dom";
import { useEffect, useState, useRef } from 'react'
import { AffiliatePartner } from '@prisma/client'
import { createAffiliatePartner, updateAffiliatePartner, deleteAffiliatePartner } from '@/actions'
import { Trash2, Edit, X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { SubmitButton } from "./SubmitButton";

type AffiliatePartnerManagerProps = {
  partners: AffiliatePartner[]
}

export default function AffiliatePartnerManager({ partners }: AffiliatePartnerManagerProps) {
  const [editingPartner, setEditingPartner] = useState<AffiliatePartner | null>(null)
  const formRef = useRef<HTMLFormElement>(null);

  // --- FIX: Use useFormState for create and update actions ---
  const [createState, createAction] = useFormState(createAffiliatePartner, { message: null, error: null });
  const [updateState, updateAction] = useFormState(updateAffiliatePartner, { message: null, error: null });
  // We'll add a delete state listener in the main component as well
  const [deleteState, deleteAction] = useFormState(deleteAffiliatePartner, { message: null, error: null });

  // --- FIX: Add useEffect hooks to show toasts for feedback ---
  useEffect(() => {
    if (createState?.message) {
      toast.success(createState.message);
      formRef.current?.reset(); // Reset form on successful creation
    }
    if (createState?.error) {
      const errorMessages = Object.values(createState.error).flat().join('\n');
      toast.error(errorMessages || "Failed to create partner.");
    }
  }, [createState]);

  useEffect(() => {
    if (updateState?.message) {
      toast.success(updateState.message);
      setEditingPartner(null); // Exit editing mode on success
    }
    if (updateState?.error) {
      const errorMessages = Object.values(updateState.error).flat().join('\n');
      toast.error(errorMessages || "Failed to update partner.");
    }
  }, [updateState]);
  
  useEffect(() => {
    if (deleteState?.message) {
      toast.success(deleteState.message);
    }
    if (deleteState?.error) {
      toast.error(deleteState.error);
    }
  }, [deleteState]);


  const isCreating = !editingPartner;

  return (
    <div className="bg-muted/50 p-6 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{isCreating ? 'Add New Partner' : `Editing: ${editingPartner.name}`}</h2>
        {!isCreating && (
          <button onClick={() => setEditingPartner(null)} className="p-1 hover:text-destructive">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Reusable Form for both Create and Edit */}
      <form
        // FIX: Use a key and ref, and point action to the correct form action from the hook
        key={editingPartner?.id || 'new'}
        ref={formRef}
        action={isCreating ? createAction : updateAction}
        className="space-y-4 mb-8"
      >
        {!isCreating && <input type="hidden" name="id" value={editingPartner.id} />}
        
        <input
          name="name"
          placeholder="Partner Name (e.g., Coursera)"
          required
          defaultValue={editingPartner?.name}
          className="w-full p-2 bg-input rounded-md"
        />
        <input
          name="website"
          type="url"
          placeholder="https://coursera.org"
          required
          defaultValue={editingPartner?.website}
          className="w-full p-2 bg-input rounded-md"
        />
        <textarea
          name="description"
          placeholder="Brief description of the partner."
          rows={3}
          defaultValue={editingPartner?.description || ''}
          className="w-full p-2 bg-input rounded-md"
        />
        {/* FIX: Use the client-side SubmitButton component */}
        <SubmitButton text={isCreating ? 'Add New Partner' : 'Update Partner'} />
      </form>

      {/* List of Existing Partners */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Existing Partners</h3>
        <ul className="space-y-2">
          {partners.map((partner) => (
            <li
              key={partner.id}
              className="flex items-center justify-between p-2 bg-background rounded-md text-sm"
            >
              <span>{partner.name}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setEditingPartner(partner)} className="p-1 hover:text-blue-500">
                  <Edit size={16} />
                </button>
                {/* FIX: Use a separate form for the delete action */}
                <form action={deleteAction}>
                  <input type="hidden" name="id" value={partner.id} />
                  <button 
                    type="submit" 
                    className="p-1 hover:text-destructive" 
                    onClick={(e) => !window.confirm('Are you sure you want to delete this partner?') && e.preventDefault()}
                  >
                    <Trash2 size={16} />
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}