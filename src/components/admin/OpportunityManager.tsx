// /src/components/admin/OpportunityManager.tsx
"use client";

// FIX: Cleaned up imports
import {
  createOpportunity,
  deleteOpportunity,
  updateOpportunity,
  updateOpportunityStatus
} from '@/actions/opportunityActions';
import type { Opportunity, OpportunityStatus } from "@prisma/client";
import { useFormState } from "react-dom";
import { useTransition, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { Trash2, Edit, X, Check } from "lucide-react";
import { SubmitButton } from "./SubmitButton";

const opportunityTypes = [
  "INTERNSHIP", "FULL_TIME", "HACKATHON", "WORKSHOP",
  "SEMINAR", "SCHOLARSHIP", "COMPETITION", "DEAL",
];

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    PUBLISHED: 'bg-green-100 text-green-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    REJECTED: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

// FIX: Defined the StatusButton helper component here
const StatusButton = ({ action, children, className }: { action: () => void, children: React.ReactNode, className: string }) => (
  <form action={action}>
    <button type="submit" className={`p-2 text-xs font-semibold rounded-md ${className}`}>
      {children}
    </button>
  </form>
);


function OpportunityRow({
  opportunity,
  deleteAction,
  statusUpdateAction
}: {
  opportunity: Opportunity;
  deleteAction: (payload: FormData) => void;
  statusUpdateAction: (id: string, status: OpportunityStatus) => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [updateState, updateAction] = useFormState(updateOpportunity, { message: "" });
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (updateState?.message) {
      toast.success(updateState.message);
      setIsEditing(false);
    }
    if (updateState?.error) {
      const errorMessage = typeof updateState.error === 'string'
        ? updateState.error
        : Object.values(updateState.error).flat().join(' ');
      toast.error(errorMessage || "An error occurred.");
    }
  }, [updateState]);

  const formatDateForInput = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  const handleStatusUpdate = (newStatus: OpportunityStatus) => {
    startTransition(async () => {
      const result = await statusUpdateAction(opportunity.id, newStatus);
      if (result?.message) {
        toast.success(result.message);
      } else if (result?.error) {
        toast.error(result.error);
      }
    });
  };

  // FIX: Defined the actions for the buttons before the return statement
  const approveAction = statusUpdateAction.bind(null, opportunity.id, 'PUBLISHED');
  const rejectAction = statusUpdateAction.bind(null, opportunity.id, 'REJECTED');
  const moveToPendingAction = statusUpdateAction.bind(null, opportunity.id, 'PENDING');


  if (isEditing) {
    // This block is correct
    return (
      <form action={updateAction} className="bg-background p-3 rounded-lg space-y-2 border border-primary">
        <input type="hidden" name="id" value={opportunity.id} />
        <input type="text" name="title" defaultValue={opportunity.title} placeholder="Title" className="w-full p-2 bg-muted/50 border border-muted rounded-lg" />
        <input type="text" name="organization" defaultValue={opportunity.organization} placeholder="Organization" className="w-full p-2 bg-muted/50 border border-muted rounded-lg" />
        <input type="text" name="location" defaultValue={opportunity.location} placeholder="Location" className="w-full p-2 bg-muted/50 border border-muted rounded-lg" />
        <select name="type" defaultValue={opportunity.type} className="w-full p-2 bg-muted/50 border border-muted rounded-lg">
          {opportunityTypes.map(type => (
            <option key={type} value={type}>{type.charAt(0) + type.slice(1).toLowerCase().replace("_", " ")}</option>
          ))}
        </select>
        <textarea name="description" defaultValue={opportunity.description} placeholder="Description" rows={3} className="w-full p-2 bg-muted/50 border border-muted rounded-lg" />
        <input type="url" name="applyUrl" defaultValue={opportunity.applyUrl} placeholder="Apply URL" className="w-full p-2 bg-muted/50 border border-muted rounded-lg" />
        <input type="url" name="imageUrl" defaultValue={opportunity.imageUrl || ""} placeholder="Image URL (optional)" className="w-full p-2 bg-muted/50 border border-muted rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="date" name="startDate" defaultValue={formatDateForInput(opportunity.startDate)} className="w-full p-2 bg-muted/50 border border-muted rounded-lg" />
          <input type="date" name="endDate" defaultValue={formatDateForInput(opportunity.endDate)} className="w-full p-2 bg-muted/50 border border-muted rounded-lg" />
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
      <div className="flex items-center gap-3">
        <StatusBadge status={opportunity.status} />
        <div>
          <p className="font-semibold">{opportunity.title}</p>
          <p className="text-xs text-muted-foreground">{opportunity.organization} - <span className="font-medium capitalize">{opportunity.type.toLowerCase().replace("_", " ")}</span></p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {opportunity.status === 'PENDING' && (
          <>
            <button onClick={() => handleStatusUpdate('PUBLISHED')} disabled={isPending} className="p-2 text-xs font-semibold rounded-md bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50">Approve</button>
            <button onClick={() => handleStatusUpdate('REJECTED')} disabled={isPending} className="p-2 text-xs font-semibold rounded-md bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50">Reject</button>
          </>
        )}
        {opportunity.status === 'PUBLISHED' && (
          <>
            <button onClick={() => handleStatusUpdate('PENDING')} disabled={isPending} className="p-2 text-xs font-semibold rounded-md bg-yellow-100 text-yellow-700 hover:bg-yellow-200 disabled:opacity-50">To Pending</button>
            <button onClick={() => handleStatusUpdate('REJECTED')} disabled={isPending} className="p-2 text-xs font-semibold rounded-md bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50">Reject</button>
          </>
        )}
        {opportunity.status === 'REJECTED' && (
          <>
            <button onClick={() => handleStatusUpdate('PUBLISHED')} disabled={isPending} className="p-2 text-xs font-semibold rounded-md bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50">Approve</button>
            <button onClick={() => handleStatusUpdate('PENDING')} disabled={isPending} className="p-2 text-xs font-semibold rounded-md bg-yellow-100 text-yellow-700 hover:bg-yellow-200 disabled:opacity-50">To Pending</button>
          </>
        )}
        
        {/* FIX: Removed the invalid variable declarations from inside the JSX */}
        <button onClick={() => setIsEditing(true)} className="p-2 text-muted-foreground hover:bg-muted rounded-full" title="Edit/Modify"><Edit className="w-4 h-4" /></button>
        <form action={deleteAction}>
          <input type="hidden" name="id" value={opportunity.id} />
          <button type="submit" className="p-2 text-red-500 hover:bg-red-500/10 rounded-full" title="Delete"><Trash2 className="w-4 h-4" /></button>
        </form>
      </div>
    </div>
  );
}

// ... (The main OpportunityManager export function is correct)
export default function OpportunityManager({ opportunities }: { opportunities: Opportunity[] }) {
  const [createState, createAction] = useFormState(createOpportunity, { message: "" });
  const [deleteState, deleteAction] = useFormState(deleteOpportunity, { message: "" });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (createState?.message) {
      toast.success(createState.message);
      formRef.current?.reset();
    }
    if (createState?.error) {
      toast.error(createState.error || "An error occurred.");
    }
  }, [createState]);

  // FIX #1: Add this useEffect back in to listen for the delete action's result
  useEffect(() => {
    if (deleteState?.message) {
      toast.success(deleteState.message);
    }
    if (deleteState?.error) {
      toast.error(deleteState.error);
    }
  }, [deleteState]);


  return (
    <div className="bg-muted/50 p-6 rounded-lg col-span-full">
      <h2 className="text-2xl font-bold text-foreground mb-4">Manage Opportunities</h2>

      {/* This 'details' section for creating opportunities is correct */}
      <details className="mb-8 pb-8 border-b border-muted">
        <summary className="cursor-pointer font-semibold text-primary">Add New Opportunity</summary>
        <form ref={formRef} action={createAction} className="space-y-4 mt-4">
          <input type="text" name="title" placeholder="Opportunity Title" required className="w-full p-2 bg-background border border-muted rounded-lg" />
          <input type="text" name="organization" placeholder="Company / Organization" required className="w-full p-2 bg-background border border-muted rounded-lg" />
          <textarea name="description" placeholder="Short description..." required rows={3} className="w-full p-2 bg-background border border-muted rounded-lg" />
          <input type="url" name="applyUrl" placeholder="Application/Registration Link" required className="w-full p-2 bg-background border border-muted rounded-lg" />
          <input type="url" name="imageUrl" placeholder="Logo/Image URL (optional)" className="w-full p-2 bg-background border border-muted rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input type="text" name="location" placeholder="Location (e.g., Remote)" required className="w-full p-2 bg-background border border-muted rounded-lg" />
            <select name="type" required className="w-full p-2 bg-background border border-muted rounded-lg">
              <option value="">Select a Type</option>
              {opportunityTypes.map(type => <option key={type} value={type}>{type.charAt(0) + type.slice(1).toLowerCase().replace("_", " ")}</option>)}
            </select>
            <div className="flex flex-col"><label htmlFor="startDate" className="text-xs text-muted-foreground mb-1">Start Date (Optional)</label><input id="startDate" type="date" name="startDate" className="w-full p-2 bg-background border border-muted rounded-lg" /></div>
            <div className="flex flex-col"><label htmlFor="endDate" className="text-xs text-muted-foreground mb-1">End Date (Optional)</label><input id="endDate" type="date" name="endDate" className="w-full p-2 bg-background border border-muted rounded-lg" /></div>
          </div>
          <div>
            <label htmlFor="status" className="text-xs text-muted-foreground mb-1">Initial Status</label>
            <select id="status" name="status" defaultValue="PUBLISHED" required className="w-full p-2 bg-background border border-muted rounded-lg">
              <option value="PUBLISHED">Publish Immediately</option>
              <option value="PENDING">Save as Pending</option>
            </select>
          </div>
          <SubmitButton text="Create Opportunity" />
        </form>
      </details>

      <div className="space-y-2">
        <h3 className="font-bold text-lg mb-2">Existing Opportunities</h3>
        {opportunities.map((op) => (
          // FIX #2: Pass the deleteAction function down to the child component as a prop
          <OpportunityRow key={op.id} opportunity={op} deleteAction={deleteAction} statusUpdateAction={updateOpportunityStatus} />
        ))}
        {opportunities.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No opportunities in this category.</p>
        )}
      </div>
    </div>
  );
}