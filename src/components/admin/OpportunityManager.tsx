// /src/components/admin/OpportunityManager.tsx

"use client";

import {
  createOpportunity,
  deleteOpportunity,
  updateOpportunity,
  updateOpportunityStatus
} from '@/actions';
import { Opportunity, OpportunityStatus } from "@prisma/client";
import { useOptimistic, useTransition, useEffect, useRef, useState, useActionState } from "react";
import { toast } from "react-hot-toast";
import { Trash2, Edit, X, Check } from "lucide-react";
import { SubmitButton } from "./SubmitButton";

type FormState = {
  message?: string | null;
  error?: string | Record<string, string[]> | null;
};

const opportunityTypes = [
  "INTERNSHIP", "FULL_TIME", "HACKATHON", "WORKSHOP",
  "SEMINAR", "SCHOLARSHIP", "COMPETITION", "DEAL",
];

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
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

const formatDateForInput = (date: Date | null | undefined): string => {
  if (!date) return "";
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  } catch (e) {
    return "";
  }
};

function OpportunityRow({
  opportunity,
  deleteAction,
  statusUpdateAction
}: {
  opportunity: Opportunity;
  deleteAction: (payload: FormData) => void;
  statusUpdateAction: (id: string, status: OpportunityStatus) => Promise<FormState>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [updateState, updateAction] = useActionState<FormState, FormData>(updateOpportunity, { message: null, error: null });
  const [isStatusPending, startStatusTransition] = useTransition();

  useEffect(() => {
    if (updateState?.message) {
      toast.success(updateState.message);
      setIsEditing(false);
    }
    if (updateState?.error) {
      const errorMessages = typeof updateState.error === 'string'
        ? [updateState.error]
        : updateState.error && typeof updateState.error === 'object'
        ? Object.values(updateState.error).flat()
        : ["An unknown error occurred during update"];
      toast.error(errorMessages.join('\n'));
    }
  }, [updateState]);

  const handleStatusUpdate = (newStatus: OpportunityStatus) => {
    startStatusTransition(async () => {
      const result = await statusUpdateAction(opportunity.id, newStatus);
      if (result?.message) {
        toast.success(result.message);
      } else if (result?.error) {
        toast.error(typeof result.error === 'string' ? result.error : "Failed to update status.");
      }
    });
  };

  if (isEditing) {
    return (
      <form action={updateAction} className="bg-background p-3 rounded-lg space-y-2 border border-primary">
        <input type="hidden" name="id" value={opportunity.id} />
        <input type="text" name="title" defaultValue={opportunity.title} placeholder="Title" className="w-full p-2 bg-muted/50 border border-muted rounded-lg" required />
        <input type="text" name="organization" defaultValue={opportunity.organization} placeholder="Organization" className="w-full p-2 bg-muted/50 border border-muted rounded-lg" required />
        <input type="text" name="location" defaultValue={opportunity.location} placeholder="Location" className="w-full p-2 bg-muted/50 border border-muted rounded-lg" required />
        <select name="type" defaultValue={opportunity.type} className="w-full p-2 bg-muted/50 border border-muted rounded-lg" required>
          {opportunityTypes.map(type => (
            <option key={type} value={type}>{type.charAt(0) + type.slice(1).toLowerCase().replace("_", " ")}</option>
          ))}
        </select>
        <textarea name="description" defaultValue={opportunity.description} placeholder="Description" rows={3} className="w-full p-2 bg-muted/50 border border-muted rounded-lg" required />
        <input type="url" name="applyUrl" defaultValue={opportunity.applyUrl} placeholder="Apply URL" className="w-full p-2 bg-muted/50 border border-muted rounded-lg" required />
        <input type="url" name="imageUrl" defaultValue={opportunity.imageUrl || ""} placeholder="Image URL (optional)" className="w-full p-2 bg-muted/50 border border-muted rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor={`startDate-${opportunity.id}`} className="text-xs text-muted-foreground mb-1 block">Start Date (Optional)</label>
            <input id={`startDate-${opportunity.id}`} type="date" name="startDate" defaultValue={formatDateForInput(opportunity.startDate)} className="w-full p-2 bg-muted/50 border border-muted rounded-lg" />
          </div>
          <div>
            <label htmlFor={`endDate-${opportunity.id}`} className="text-xs text-muted-foreground mb-1 block">End Date (Optional)</label>
            <input id={`endDate-${opportunity.id}`} type="date" name="endDate" defaultValue={formatDateForInput(opportunity.endDate)} className="w-full p-2 bg-muted/50 border border-muted rounded-lg" />
          </div>
        </div>
        <select name="status" defaultValue={opportunity.status} className="w-full p-2 bg-muted/50 border border-muted rounded-lg text-sm">
          <option value={OpportunityStatus.PUBLISHED}>Published</option>
          <option value={OpportunityStatus.PENDING}>Pending</option>
          <option value={OpportunityStatus.REJECTED}>Rejected</option>
        </select>
        <div className="flex items-center gap-2">
          <SubmitButton text="Save Changes" />
          <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg">Cancel</button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-center justify-between bg-background p-3 rounded-lg group">
      <div className="flex items-center gap-3 flex-grow min-w-0">
        <StatusBadge status={opportunity.status} />
        <div className="truncate">
          <p className="font-semibold truncate">{opportunity.title}</p>
          <p className="text-xs text-muted-foreground truncate">{opportunity.organization} - <span className="font-medium capitalize">{opportunity.type.toLowerCase().replace("_", " ")}</span></p>
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {opportunity.status === OpportunityStatus.PENDING && (
          <>
            <button onClick={() => handleStatusUpdate(OpportunityStatus.PUBLISHED)} disabled={isStatusPending} className="p-1.5 rounded-full text-green-600 hover:bg-green-100 disabled:opacity-50" title="Approve"><Check className="w-4 h-4" /></button>
            <button onClick={() => handleStatusUpdate(OpportunityStatus.REJECTED)} disabled={isStatusPending} className="p-1.5 rounded-full text-red-600 hover:bg-red-100 disabled:opacity-50" title="Reject"><X className="w-4 h-4" /></button>
          </>
        )}
        {opportunity.status === OpportunityStatus.PUBLISHED && (
          <>
            <button onClick={() => handleStatusUpdate(OpportunityStatus.PENDING)} disabled={isStatusPending} className="p-1.5 rounded-full text-yellow-600 hover:bg-yellow-100 disabled:opacity-50" title="Move to Pending"><X className="w-4 h-4" /></button>
            <button onClick={() => handleStatusUpdate(OpportunityStatus.REJECTED)} disabled={isStatusPending} className="p-1.5 rounded-full text-red-600 hover:bg-red-100 disabled:opacity-50" title="Reject"><X className="w-4 h-4" /></button>
          </>
        )}
        {opportunity.status === OpportunityStatus.REJECTED && (
          <>
            <button onClick={() => handleStatusUpdate(OpportunityStatus.PUBLISHED)} disabled={isStatusPending} className="p-1.5 rounded-full text-green-600 hover:bg-green-100 disabled:opacity-50" title="Approve"><Check className="w-4 h-4" /></button>
            <button onClick={() => handleStatusUpdate(OpportunityStatus.PENDING)} disabled={isStatusPending} className="p-1.5 rounded-full text-yellow-600 hover:bg-yellow-100 disabled:opacity-50" title="Move to Pending"><X className="w-4 h-4" /></button>
          </>
        )}
        <button onClick={() => setIsEditing(true)} className="p-1.5 rounded-full text-muted-foreground hover:text-primary hover:bg-muted" title="Edit Opportunity"><Edit className="w-4 h-4" /></button>
        <form action={deleteAction}>
          <input type="hidden" name="id" value={opportunity.id} />
          <button
            type="submit"
            className="p-1.5 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            title="Delete Opportunity"
            onClick={(e) => {
              if (!window.confirm("Are you sure you want to delete this opportunity?")) {
                e.preventDefault();
              }
            }}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default function OpportunityManager({ opportunities }: { opportunities: Opportunity[] }) {
  const [createState, createAction] = useActionState<FormState, FormData>(createOpportunity, { message: null, error: null });
  const [deleteState, deleteAction] = useActionState<FormState, FormData>(deleteOpportunity, { message: null, error: null });

  const formRef = useRef<HTMLFormElement>(null);

  const [optimisticOpportunities, removeOptimisticOpportunity] = useOptimistic<Opportunity[], string>(
    opportunities,
    (currentState, opportunityIdToRemove) => {
      return currentState.filter((op) => op.id !== opportunityIdToRemove);
    }
  );

  const handleDeleteOpportunity = async (formData: FormData) => {
    const opportunityId = formData.get("id") as string;
    if (opportunityId) {
      removeOptimisticOpportunity(opportunityId);
    }
    await deleteAction(formData);
  };

  useEffect(() => {
    if (createState?.message) {
      toast.success(createState.message);
      formRef.current?.reset();
    }
    if (createState?.error) {
      const errorMessages = typeof createState.error === 'string'
        ? [createState.error]
        : createState.error && typeof createState.error === 'object'
        ? Object.values(createState.error).flat()
        : ["An unknown error occurred during creation"];
      toast.error(errorMessages.join('\n'));
    }
  }, [createState]);

  useEffect(() => {
    if (deleteState?.message && !deleteState.error) {
      toast.success(deleteState.message);
    }
    if (deleteState?.error) {
      toast.error(typeof deleteState.error === 'string' ? deleteState.error : "Failed to delete opportunity.");
    }
  }, [deleteState]);

  return (
    <div className="bg-muted/50 p-6 rounded-lg col-span-full">
      <h2 className="text-2xl font-bold text-foreground mb-4">Manage Opportunities</h2>

      <details className="mb-8 pb-8 border-b border-muted">
        <summary className="cursor-pointer font-semibold text-primary mb-4">Add New Opportunity</summary>
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
            <select id="status" name="status" defaultValue={OpportunityStatus.PUBLISHED} required className="w-full p-2 bg-background border border-muted rounded-lg">
              <option value={OpportunityStatus.PUBLISHED}>Publish Immediately</option>
              <option value={OpportunityStatus.PENDING}>Save as Pending</option>
            </select>
          </div>
          <SubmitButton text="Create Opportunity" />
        </form>
      </details>

      <div className="space-y-2">
        <h3 className="font-bold text-lg mb-2">Existing Opportunities</h3>
        {optimisticOpportunities.map((op) => (
          <OpportunityRow
            key={op.id}
            opportunity={op}
            deleteAction={handleDeleteOpportunity}
            statusUpdateAction={updateOpportunityStatus}
          />
        ))}
        {optimisticOpportunities.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No opportunities match the current filters.</p>
        )}
      </div>
    </div>
  );
}