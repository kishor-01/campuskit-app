// /src/components/admin/AffiliateLinkManager.tsx
'use client'

import { useFormState } from "react-dom";
import { useEffect, useState, useRef } from 'react';
import { AffiliateLink, AffiliatePartner } from '@prisma/client';
import { createAffiliateLink, updateAffiliateLink, deleteAffiliateLink } from '@/actions';
import { Trash2, Edit, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { SubmitButton } from "./SubmitButton";

type LinkWithPartner = AffiliateLink & { partner: AffiliatePartner };

type AffiliateLinkManagerProps = {
  links: LinkWithPartner[];
  partners: AffiliatePartner[];
};

export default function AffiliateLinkManager({ links, partners }: AffiliateLinkManagerProps) {
  const [editingLink, setEditingLink] = useState<LinkWithPartner | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // --- FIX: Use useFormState for all actions ---
  const [createState, createAction] = useFormState(createAffiliateLink, { message: null, error: null });
  const [updateState, updateAction] = useFormState(updateAffiliateLink, { message: null, error: null });
  const [deleteState, deleteAction] = useFormState(deleteAffiliateLink, { message: null, error: null });

  // --- FIX: Add useEffect hooks for toast notifications ---
  useEffect(() => {
    if (createState?.message) {
      toast.success(createState.message);
      formRef.current?.reset();
      setEditingLink(null);
    }
    if (createState?.error) {
      const errorMessages = Object.values(createState.error).flat().join('\n');
      toast.error(errorMessages || "Failed to create link.");
    }
  }, [createState]);

  useEffect(() => {
    if (updateState?.message) {
      toast.success(updateState.message);
      setEditingLink(null);
    }
    if (updateState?.error) {
      const errorMessages = Object.values(updateState.error).flat().join('\n');
      toast.error(errorMessages || "Failed to update link.");
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

  const isCreating = !editingLink;

  return (
    <div className="bg-muted/50 p-6 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{isCreating ? 'Add New Link' : `Editing Link`}</h2>
        {!isCreating && (
          <button onClick={() => setEditingLink(null)} className="p-1 hover:text-destructive">
            <X size={20} />
          </button>
        )}
      </div>

      <form
        // FIX: Point form to the correct actions from useFormState
        key={editingLink?.id || 'new'}
        ref={formRef}
        action={isCreating ? createAction : updateAction}
        className="space-y-4 mb-8"
      >
        {!isCreating && <input type="hidden" name="id" value={editingLink.id} />}
        
        <select name="partnerId" required defaultValue={editingLink?.partnerId || ""} className="w-full p-2 bg-input rounded-md">
          <option value="" disabled>Select a Partner</option>
          {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        <input name="name" placeholder="Link Name (e.g., Data Science Course)" required defaultValue={editingLink?.name} className="w-full p-2 bg-input rounded-md" />
        <input name="slug" placeholder="Short Slug (e.g., coursera-data)" required defaultValue={editingLink?.slug} className="w-full p-2 bg-input rounded-md" />
        <textarea name="url" placeholder="Full Affiliate URL" rows={3} required defaultValue={editingLink?.url} className="w-full p-2 bg-input rounded-md" />
        
        {/* FIX: Use the SubmitButton component */}
        <SubmitButton text={isCreating ? 'Add New Link' : 'Update Link'} />
      </form>

      {/* Table of Existing Links */}
      <div className="overflow-x-auto">
        <h3 className="text-lg font-semibold mb-2">Existing Links</h3>
        <table className="w-full text-left text-sm">
          <thead className="bg-background">
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Partner</th>
              <th className="p-2">Slug</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {links.map((link) => (
              <tr key={link.id} className="border-b border-muted">
                <td className="p-2 font-medium">{link.name}</td>
                <td className="p-2">{link.partner.name}</td>
                <td className="p-2 font-mono bg-muted/50 rounded-sm">{link.slug}</td>
                <td className="p-2">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditingLink(link)} className="p-1 hover:text-blue-500"><Edit size={16} /></button>
                    {/* FIX: Use a form for the delete action */}
                    <form action={deleteAction}>
                      <input type="hidden" name="id" value={link.id} />
                      <button 
                        type="submit" 
                        className="p-1 hover:text-destructive" 
                        onClick={(e) => !window.confirm('Are you sure you want to delete this link?') && e.preventDefault()}
                      >
                        <Trash2 size={16} />
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
