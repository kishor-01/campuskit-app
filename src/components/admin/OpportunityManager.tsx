// /src/components/admin/OpportunityManager.tsx

"use client";

import {
  createOpportunity,
  deleteOpportunity,
  updateOpportunity,
  updateOpportunityStatus
} from '@/actions';
import { Opportunity, OpportunityStatus, OpportunityTier } from "@prisma/client";
import { useOptimistic, useTransition, useEffect, useRef, useState, useActionState } from "react";
import { toast } from "react-hot-toast";
import { Trash2, Edit, X, Check, Trophy, Award, Medal } from "lucide-react";
import { SubmitButton } from "./SubmitButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

type FormState = {
  message?: string | null;
  error?: string | Record<string, string[]> | null;
};

const opportunityTypes = [
  "INTERNSHIP", "FULL_TIME", "HACKATHON", "WORKSHOP",
  "SEMINAR", "SCHOLARSHIP", "COMPETITION", "DEAL",
];

const opportunityTiers = [
  { value: "TIER_1", label: "🥇 Tier 1 — Elite Global", icon: Trophy },
  { value: "TIER_2", label: "🥈 Tier 2 — High Growth", icon: Award },
  { value: "TIER_3", label: "🥉 Tier 3 — General", icon: Medal },
];

const difficultyLevels = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "SENIOR", label: "Senior" },
];

const TierBadge = ({ tier }: { tier: string }) => {
  const styles: Record<string, string> = {
    TIER_1: 'bg-amber-100 text-amber-800 border-amber-300',
    TIER_2: 'bg-slate-100 text-slate-700 border-slate-300',
    TIER_3: 'bg-zinc-100 text-zinc-600 border-zinc-200',
  };
  const labels: Record<string, string> = {
    TIER_1: '🥇 T1',
    TIER_2: '🥈 T2',
    TIER_3: '🥉 T3',
  };

  return (
    <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded border ${styles[tier] || 'bg-gray-100 text-gray-800'}`}>
      {labels[tier] || tier}
    </span>
  );
};

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

  return (
    <>
      <div className="flex items-center justify-between bg-background p-3 rounded-lg group">
        <div className="flex items-center gap-2 flex-grow min-w-0">
          <TierBadge tier={opportunity.tier} />
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

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto px-6">
          <DialogHeader>
            <DialogTitle>Edit Opportunity</DialogTitle>
            <DialogDescription>Make changes to the opportunity below. All Phase 2 strategic fields are available.</DialogDescription>
          </DialogHeader>
          <form action={updateAction} className="space-y-4 pt-4">
            <input type="hidden" name="id" value={opportunity.id} />

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Title</label>
              <input type="text" name="title" defaultValue={opportunity.title} placeholder="Title" className="w-full p-2 bg-muted/50 border border-muted rounded-lg" required />
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Organization</label>
              <input type="text" name="organization" defaultValue={opportunity.organization} placeholder="Organization" className="w-full p-2 bg-muted/50 border border-muted rounded-lg" required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Location</label>
                <input type="text" name="location" defaultValue={opportunity.location} placeholder="Location" className="w-full p-2 bg-muted/50 border border-muted rounded-lg" required />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Type</label>
                <select name="type" defaultValue={opportunity.type} className="w-full p-2 bg-muted/50 border border-muted rounded-lg" required>
                  {opportunityTypes.map(type => (
                    <option key={type} value={type}>{type.charAt(0) + type.slice(1).toLowerCase().replace("_", " ")}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Tier</label>
                <select name="tier" defaultValue={opportunity.tier} className="w-full p-2 bg-muted/50 border border-muted rounded-lg">
                  {opportunityTiers.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Description</label>
              <textarea name="description" defaultValue={opportunity.description} placeholder="Description" rows={4} className="w-full p-2 bg-muted/50 border border-muted rounded-lg" required />
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Visualizations (Mermaid.js)</label>
              <textarea name="visualizations" defaultValue={opportunity.visualizations ? (Array.isArray(opportunity.visualizations) ? (opportunity.visualizations.find((v: any) => v.type === 'mermaid') as any)?.content || '' : '') : ""} placeholder="Visualizations (Mermaid.js code)" rows={3} className="w-full p-2 bg-muted/50 border border-muted rounded-lg font-mono text-xs" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Apply URL</label>
                <input type="url" name="applyUrl" defaultValue={opportunity.applyUrl} placeholder="Apply URL" className="w-full p-2 bg-muted/50 border border-muted rounded-lg" required />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Image URL</label>
                <input type="url" name="imageUrl" defaultValue={opportunity.imageUrl || ""} placeholder="Image URL (optional)" className="w-full p-2 bg-muted/50 border border-muted rounded-lg" />
              </div>
            </div>

            {/* Phase 2: Strategic Fields */}
            <div className="border-t border-muted pt-4 mt-4">
              <p className="text-xs font-bold text-primary uppercase tracking-wider mb-3">Strategic Metadata</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Difficulty</label>
                  <select name="difficulty" defaultValue={opportunity.difficulty} className="w-full p-2 bg-muted/50 border border-muted rounded-lg">
                    {difficultyLevels.map(d => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Stipend Range</label>
                  <input type="text" name="stipendRange" defaultValue={opportunity.stipendRange || ""} placeholder="e.g., ₹20k - ₹50k or Unpaid" className="w-full p-2 bg-muted/50 border border-muted rounded-lg" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Duration</label>
                  <input type="text" name="duration" defaultValue={opportunity.duration || ""} placeholder="e.g., 3 Months" className="w-full p-2 bg-muted/50 border border-muted rounded-lg" />
                </div>
              </div>

              <div className="mt-4">
                <label className="text-xs text-muted-foreground mb-1 block">Skills Required (comma-separated)</label>
                <input type="text" name="skillsRequired" defaultValue={opportunity.skillsRequired?.join(', ') || ""} placeholder="React, Python, Node.js, PostgreSQL" className="w-full p-2 bg-muted/50 border border-muted rounded-lg" />
              </div>

              <div className="mt-4">
                <label className="text-xs text-muted-foreground mb-1 block">Senior Insight</label>
                <textarea name="seniorInsight" defaultValue={opportunity.seniorInsight} placeholder="Strategic advice for applicants..." rows={3} className="w-full p-2 bg-muted/50 border border-muted rounded-lg" />
              </div>

              <div className="mt-4">
                <label className="text-xs text-muted-foreground mb-1 block">Prep Resources (one URL per line)</label>
                <textarea name="prepResources" defaultValue={opportunity.prepResources?.join('\n') || ""} placeholder="https://guide-link-1.com&#10;https://guide-link-2.com" rows={3} className="w-full p-2 bg-muted/50 border border-muted rounded-lg font-mono text-xs" />
              </div>

              <div className="mt-4 flex items-center gap-2">
                <input type="checkbox" name="isRemote" id={`isRemote-edit-${opportunity.id}`} defaultChecked={opportunity.isRemote} className="rounded border-muted" />
                <label htmlFor={`isRemote-edit-${opportunity.id}`} className="text-sm text-foreground">Remote Friendly</label>
              </div>
            </div>

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Publish Date</label>
                <input type="datetime-local" name="publishedAt" defaultValue={(opportunity as any).publishedAt ? new Date((opportunity as any).publishedAt).toISOString().slice(0, 16) : ''} className="w-full p-2 bg-muted/50 border border-muted rounded-lg" />
                <p className="text-xs text-muted-foreground mt-1">Leave blank to publish immediately.</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Author Override</label>
                <input type="text" name="authorOverride" defaultValue={(opportunity as any).authorOverride ?? ''} placeholder="Guest author name (optional)" className="w-full p-2 bg-muted/50 border border-muted rounded-lg" />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Status</label>
              <select name="status" defaultValue={opportunity.status} className="w-full p-2 bg-muted/50 border border-muted rounded-lg text-sm">
                <option value={OpportunityStatus.PUBLISHED}>Published</option>
                <option value={OpportunityStatus.PENDING}>Pending</option>
                <option value={OpportunityStatus.REJECTED}>Rejected</option>
              </select>
            </div>

            <DialogFooter className="mt-6">
              <DialogClose asChild>
                <button type="button" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg">Cancel</button>
              </DialogClose>
              <SubmitButton text="Save Changes" />
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
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
          <textarea name="visualizations" placeholder="Mermaid.js code for flowcharts/mindmaps (Optional)" rows={3} className="w-full p-2 bg-background border border-muted rounded-lg font-mono text-xs" />
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

          {/* Phase 2: Strategic Fields for Create */}
          <div className="border-t border-muted pt-4 mt-2">
            <p className="text-xs font-bold text-primary uppercase tracking-wider mb-3">Strategic Metadata</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Tier</label>
                <select name="tier" defaultValue="TIER_3" className="w-full p-2 bg-background border border-muted rounded-lg">
                  {opportunityTiers.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Difficulty</label>
                <select name="difficulty" defaultValue="INTERMEDIATE" className="w-full p-2 bg-background border border-muted rounded-lg">
                  {difficultyLevels.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Stipend Range</label>
                <input type="text" name="stipendRange" placeholder="e.g., ₹20k - ₹50k" className="w-full p-2 bg-background border border-muted rounded-lg" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Duration</label>
                <input type="text" name="duration" placeholder="e.g., 3 Months" className="w-full p-2 bg-background border border-muted rounded-lg" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Skills Required (comma-separated)</label>
                <input type="text" name="skillsRequired" placeholder="React, Python, Node.js" className="w-full p-2 bg-background border border-muted rounded-lg" />
              </div>
            </div>
            <div className="mt-4">
              <label className="text-xs text-muted-foreground mb-1 block">Senior Insight</label>
              <textarea name="seniorInsight" placeholder="Strategic advice for applicants..." rows={2} className="w-full p-2 bg-background border border-muted rounded-lg" />
            </div>
            <div className="mt-4">
              <label className="text-xs text-muted-foreground mb-1 block">Prep Resources (one URL per line)</label>
              <textarea name="prepResources" placeholder="https://guide-link.com" rows={2} className="w-full p-2 bg-background border border-muted rounded-lg font-mono text-xs" />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <input type="checkbox" name="isRemote" id="isRemote-create" className="rounded border-muted" />
              <label htmlFor="isRemote-create" className="text-sm text-foreground">Remote Friendly</label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Publish Date</label>
              <input type="datetime-local" name="publishedAt" className="w-full p-2 bg-background border border-muted rounded-lg" />
              <p className="text-xs text-muted-foreground mt-1">Leave blank to publish immediately.</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Author Override</label>
              <input type="text" name="authorOverride" placeholder="Guest author name (optional)" className="w-full p-2 bg-background border border-muted rounded-lg" />
            </div>
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
            statusUpdateAction={updateOpportunityStatus as any}
          />
        ))}
        {optimisticOpportunities.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No opportunities match the current filters.</p>
        )}
      </div>
    </div>
  );
}