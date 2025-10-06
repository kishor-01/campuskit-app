// src/components/admin/OpportunityManager.tsx

"use client";

import { useFormState } from "react-dom";
import { createOpportunity, deleteOpportunity, updateOpportunity } from "@/app/actions";
import type { Opportunity } from "@prisma/client";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { Trash2, Edit, X, Check } from "lucide-react";
import { SubmitButton } from "./SubmitButton";

const opportunityTypes = [
  "INTERNSHIP", "FULL_TIME", "HACKATHON", "WORKSHOP", 
  "SEMINAR", "SCHOLARSHIP", "COMPETITION", "DEAL",
];

// Sub-component to handle displaying and editing a single row
function OpportunityRow({ opportunity }: { opportunity: Opportunity }) {
  const [isEditing, setIsEditing] = useState(false);
  const [updateState, updateAction] = useFormState(updateOpportunity, { message: "" });

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

  // Helper to format date for input field
  const formatDateForInput = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  if (isEditing) {
    return (
      <form action={updateAction} className="bg-background p-3 rounded-lg space-y-2 border border-primary">
        <input type="hidden" name="id" value={opportunity.id} />
        <input type="text" name="title" defaultValue={opportunity.title} placeholder="Title" className="w-full p-2 bg-muted/50 border border-muted rounded-lg"/>
        <input type="text" name="organization" defaultValue={opportunity.organization} placeholder="Organization" className="w-full p-2 bg-muted/50 border border-muted rounded-lg"/>
        <input type="text" name="location" defaultValue={opportunity.location} placeholder="Location" className="w-full p-2 bg-muted/50 border border-muted rounded-lg"/>
        <select name="type" defaultValue={opportunity.type} className="w-full p-2 bg-muted/50 border border-muted rounded-lg">
          {opportunityTypes.map(type => (
            <option key={type} value={type}>{type.charAt(0) + type.slice(1).toLowerCase().replace("_", " ")}</option>
          ))}
        </select>
        <textarea name="description" defaultValue={opportunity.description} placeholder="Description" rows={3} className="w-full p-2 bg-muted/50 border border-muted rounded-lg"/>
        <input type="url" name="applyUrl" defaultValue={opportunity.applyUrl} placeholder="Apply URL" className="w-full p-2 bg-muted/50 border border-muted rounded-lg"/>
        <input type="url" name="imageUrl" defaultValue={opportunity.imageUrl || ""} placeholder="Image URL (optional)" className="w-full p-2 bg-muted/50 border border-muted rounded-lg"/>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="date" name="startDate" defaultValue={formatDateForInput(opportunity.startDate)} className="w-full p-2 bg-muted/50 border border-muted rounded-lg"/>
          <input type="date" name="endDate" defaultValue={formatDateForInput(opportunity.endDate)} className="w-full p-2 bg-muted/50 border border-muted rounded-lg"/>
        </div>
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
        <p className="font-semibold">{opportunity.title}</p>
        <p className="text-xs text-muted-foreground">{opportunity.organization} - <span className="font-medium capitalize">{opportunity.type.toLowerCase().replace("_", " ")}</span></p>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => setIsEditing(true)} className="p-2 text-muted-foreground hover:bg-muted rounded-full">
          <Edit className="w-4 h-4" />
        </button>
        <form action={deleteOpportunity}>
          <input type="hidden" name="opportunityId" value={opportunity.id} />
          <button type="submit" className="p-2 text-red-500 hover:bg-red-500/10 rounded-full">
            <Trash2 className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

// Main component
export default function OpportunityManager({ opportunities }: { opportunities: Opportunity[] }) {
  const [createState, createAction] = useFormState(createOpportunity, { message: "" });
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
    <div className="bg-muted/50 p-6 rounded-lg col-span-full">
      <h2 className="text-2xl font-bold text-foreground mb-4">Manage Opportunities</h2>
      
      {/* CREATE FORM */}
      <form ref={formRef} action={createAction} className="space-y-4 mb-8 pb-8 border-b border-muted">
        <input type="text" name="title" placeholder="Opportunity Title" required className="w-full p-2 bg-background border border-muted rounded-lg"/>
        <input type="text" name="organization" placeholder="Company / Organization" required className="w-full p-2 bg-background border border-muted rounded-lg"/>
        <textarea name="description" placeholder="Short description..." required rows={3} className="w-full p-2 bg-background border border-muted rounded-lg"/>
        <input type="url" name="applyUrl" placeholder="Application/Registration Link" required className="w-full p-2 bg-background border border-muted rounded-lg"/>
        <input type="url" name="imageUrl" placeholder="Logo/Image URL (optional)" className="w-full p-2 bg-background border border-muted rounded-lg"/>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input type="text" name="location" placeholder="Location (e.g., Remote)" required className="w-full p-2 bg-background border border-muted rounded-lg"/>
          <select name="type" required className="w-full p-2 bg-background border border-muted rounded-lg">
            <option value="">Select a Type</option>
            {opportunityTypes.map(type => <option key={type} value={type}>{type.charAt(0) + type.slice(1).toLowerCase().replace("_", " ")}</option>)}
          </select>
          <div className="flex flex-col"><label htmlFor="startDate" className="text-xs text-muted-foreground mb-1">Start Date (Optional)</label><input id="startDate" type="date" name="startDate" className="w-full p-2 bg-background border border-muted rounded-lg"/></div>
          <div className="flex flex-col"><label htmlFor="endDate" className="text-xs text-muted-foreground mb-1">End Date (Optional)</label><input id="endDate" type="date" name="endDate" className="w-full p-2 bg-background border border-muted rounded-lg"/></div>
        </div>
        <SubmitButton text="Create Opportunity" />
      </form>

      {/* EXISTING OPPORTUNITIES */}
      <div className="space-y-2">
        <h3 className="font-bold text-lg mb-2">Existing Opportunities</h3>
        {opportunities.map((op) => (
          <OpportunityRow key={op.id} opportunity={op} />
        ))}
      </div>
    </div>
  );
}