// src/components/admin/DealManager.tsx

"use client";

import { useFormState } from "react-dom";
import { createDeal, deleteDeal, updateDeal } from "@/app/actions";
import type { Deal } from "@prisma/client";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { Trash2, Edit, X, Check } from "lucide-react";
import { SubmitButton } from "./SubmitButton";

interface DealManagerProps {
  deals: Deal[];
}

// A smaller, dedicated component for each deal row
function DealRow({ deal }: { deal: Deal }) {
  const [isEditing, setIsEditing] = useState(false);
  const [updateState, updateAction] = useFormState(updateDeal, { message: "" });

  useEffect(() => {
    if (updateState?.message) {
      toast.success(updateState.message);
      setIsEditing(false);
    }
    if (updateState?.error) {
      const errorMessages = typeof updateState.error === 'string' ? [updateState.error] : Object.values(updateState.error).flat();
      toast.error(errorMessages.join('\n') || "An error occurred.");
    }
  }, [updateState]);

  if (isEditing) {
    return (
      <form action={updateAction} className="bg-background p-3 rounded-lg space-y-2 border border-primary">
        <input type="hidden" name="id" value={deal.id} />
        <input type="text" name="title" defaultValue={deal.title} className="w-full p-2 bg-muted/50 border border-muted rounded-lg"/>
        <input type="text" name="company" defaultValue={deal.company} className="w-full p-2 bg-muted/50 border border-muted rounded-lg"/>
        <textarea name="description" defaultValue={deal.description} rows={2} className="w-full p-2 bg-muted/50 border border-muted rounded-lg"/>
        <input type="url" name="affiliateUrl" defaultValue={deal.affiliateUrl} className="w-full p-2 bg-muted/50 border border-muted rounded-lg"/>
        <input type="url" name="imageUrl" defaultValue={deal.imageUrl || ''} className="w-full p-2 bg-muted/50 border border-muted rounded-lg"/>
        <input type="text" name="category" defaultValue={deal.category} className="w-full p-2 bg-muted/50 border border-muted rounded-lg"/>
        <div className="flex items-center gap-2">
          <SubmitButton text="Save" />
          <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg">Cancel</button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-center justify-between bg-background p-3 rounded-lg">
      <div>
        <p className="font-semibold">{deal.title}</p>
        <p className="text-xs text-muted-foreground">{deal.company}</p>
      </div>
      <div className="flex items-center">
        <button onClick={() => setIsEditing(true)} className="p-2 text-muted-foreground hover:bg-muted rounded-full">
          <Edit className="w-4 h-4" />
        </button>
        <form action={deleteDeal}>
          <input type="hidden" name="dealId" value={deal.id} />
          <button type="submit" className="p-2 text-red-500 hover:bg-red-500/10 rounded-full">
            <Trash2 className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}


export default function DealManager({ deals }: DealManagerProps) {
  const [createState, createAction] = useFormState(createDeal, { message: "" });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (createState?.message) {
      toast.success(createState.message);
      formRef.current?.reset();
    }
    if (createState?.error) {
      const errorMessages = typeof createState.error === 'string' ? [createState.error] : Object.values(createState.error).flat();
      toast.error(errorMessages.join('\n') || "An error occurred.");
    }
  }, [createState]);

  return (
    <div className="bg-muted/50 p-6 rounded-lg">
      <h2 className="text-2xl font-bold text-foreground mb-4">Manage Deals</h2>
      
      <form ref={formRef} action={createAction} className="space-y-4 mb-8 pb-8 border-b border-muted">
        <input type="text" name="title" placeholder="Deal Title" required className="w-full p-2 bg-background border border-muted rounded-lg"/>
        <input type="text" name="company" placeholder="Company" required className="w-full p-2 bg-background border border-muted rounded-lg"/>
        <textarea name="description" placeholder="Short description..." required rows={3} className="w-full p-2 bg-background border border-muted rounded-lg"/>
        <input type="url" name="affiliateUrl" placeholder="Affiliate Link (https://...)" required className="w-full p-2 bg-background border border-muted rounded-lg"/>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="url" name="imageUrl" placeholder="Logo Image URL (optional)" className="w-full p-2 bg-background border border-muted rounded-lg"/>
          <input type="text" name="category" placeholder="Category (e.g., Software)" required className="w-full p-2 bg-background border border-muted rounded-lg"/>
        </div>
        <SubmitButton text="Create Deal" />
      </form>

      <div className="space-y-2">
        <h3 className="font-bold text-lg mb-2">Existing Deals</h3>
        {deals.map((deal) => (
          <DealRow key={deal.id} deal={deal} />
        ))}
      </div>
    </div>
  );
}