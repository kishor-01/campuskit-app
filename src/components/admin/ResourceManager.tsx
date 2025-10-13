
// src/components/admin/ResourceManager.tsx

"use client";

import { useFormState } from "react-dom";
// FIX: Import the versatile updateResourceStatus action
import {
  createResource,
  updateResource,
  deleteResource,
  updateResourceStatus,
} from "@/actions";
import type { Resource, Category, ResourceStatus } from "@prisma/client";
// FIX: Import useTransition
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "react-hot-toast";
import { Trash2, Edit, X, Check } from "lucide-react";
import { SubmitButton } from "./SubmitButton";

type ResourceWithCategory = Resource & { category: Category };

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    APPROVED: "bg-green-100 text-green-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    REJECTED: "bg-red-100 text-red-800",
  };
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
      {status}
    </span>
  );
};

function ResourceRow({
  resource,
  categories,
  deleteAction,
}: {
  resource: ResourceWithCategory;
  categories: Category[];
  deleteAction: (payload: FormData) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [updateState, updateAction] = useFormState(updateResource, { message: "" });
  
  // This hook manages the loading state for status changes
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (updateState?.message) {
      toast.success(updateState.message);
      setIsEditing(false);
    }
    if (updateState?.error) {
      const errorMessages = typeof updateState.error === "string" ? [updateState.error] : Object.values(updateState.error).flat();
      toast.error(errorMessages.join("\n") || "An error occurred.");
    }
  }, [updateState]);

  // This function calls the server action and shows a toast
  const handleStatusUpdate = (newStatus: ResourceStatus) => {
    startTransition(async () => {
      const result = await updateResourceStatus(resource.id, newStatus);
      if (result?.message) {
        toast.success(result.message);
      } else if (result?.error) {
        toast.error(result.error);
      }
    });
  };

  if (isEditing) {
    // The editing form is correct and remains unchanged
    return (
        <form action={updateAction} className="bg-background p-3 rounded-lg space-y-3 border border-primary">
            <input type="hidden" name="id" value={resource.id} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                <label className="text-xs font-medium text-muted-foreground">Name</label>
                <input name="name" defaultValue={resource.name} required className="w-full p-2 bg-input rounded-md" />
                </div>
                <div>
                <label className="text-xs font-medium text-muted-foreground">Category</label>
                <select name="categoryId" defaultValue={resource.categoryId} required className="w-full p-2 bg-input rounded-md">
                    <option value="">Select a category</option>
                    {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
                </div>
            </div>
            <div>
                <label className="text-xs font-medium text-muted-foreground">URL</label>
                <input name="url" type="url" defaultValue={resource.url} required className="w-full p-2 bg-input rounded-md" />
            </div>
            <div>
                <label className="text-xs font-medium text-muted-foreground">Image URL (optional)</label>
                <input name="imageUrl" type="url" defaultValue={resource.imageUrl ?? ""} placeholder="https://example.com/image.jpg" className="w-full p-2 bg-input rounded-md" />
            </div>
            <div>
                <label className="text-xs font-medium text-muted-foreground">Short description</label>
                <textarea name="description" defaultValue={resource.description ?? ""} rows={3} required className="w-full p-2 bg-input rounded-md" />
            </div>
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground">Status</label>
                <select name="status" defaultValue={resource.status} className="p-2 bg-input rounded-md text-sm">
                    <option value="APPROVED">APPROVED</option>
                    <option value="PENDING">PENDING</option>
                    <option value="REJECTED">REJECTED</option>
                </select>
                </div>
                <div className="flex items-center gap-2">
                <SubmitButton text="Save" />
                <button type="button" onClick={() => setIsEditing(false)} className="px-3 py-2 rounded-md bg-muted/30">Cancel</button>
                </div>
            </div>
        </form>
    );
  }

  return (
    <div className="flex items-center justify-between bg-background p-3 rounded-lg">
      <div className="flex items-center gap-3">
        <StatusBadge status={resource.status} />
        <div>
          <p className="font-semibold">{resource.name}</p>
          <p className="text-xs text-muted-foreground">{resource.category.name}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* FIX: Complete button logic for all statuses */}
        {resource.status === "PENDING" && (
          <>
            <button onClick={() => handleStatusUpdate('APPROVED')} disabled={isPending} className="p-2 text-green-500 hover:bg-green-500/10 rounded-full disabled:opacity-50" title="Approve"><Check className="w-4 h-4" /></button>
            <button onClick={() => handleStatusUpdate('REJECTED')} disabled={isPending} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full disabled:opacity-50" title="Reject"><X className="w-4 h-4" /></button>
          </>
        )}
        
        {resource.status === "APPROVED" && (
            <>
                <button onClick={() => handleStatusUpdate('PENDING')} disabled={isPending} className="p-2 text-yellow-500 hover:bg-yellow-500/10 rounded-full disabled:opacity-50" title="Move to Pending"><X className="w-4 h-4 text-yellow-500" /></button>
                <button onClick={() => handleStatusUpdate('REJECTED')} disabled={isPending} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full disabled:opacity-50" title="Reject"><X className="w-4 h-4" /></button>
            </>
        )}

        {resource.status === "REJECTED" && (
          <>
            <button onClick={() => handleStatusUpdate('APPROVED')} disabled={isPending} className="p-2 text-green-500 hover:bg-green-500/10 rounded-full disabled:opacity-50" title="Approve"><Check className="w-4 h-4" /></button>
            <button onClick={() => handleStatusUpdate('PENDING')} disabled={isPending} className="p-2 text-yellow-500 hover:bg-yellow-500/10 rounded-full disabled:opacity-50" title="Move to Pending"><X className="w-4 h-4 text-yellow-500" /></button>
          </>
        )}

        <button onClick={() => setIsEditing(true)} className="p-2 text-muted-foreground hover:bg-muted rounded-full" title="Edit/Modify"><Edit className="w-4 h-4" /></button>
        
        <form action={deleteAction}>
          <input type="hidden" name="id" value={resource.id} />
          <button type="submit" className="p-2 text-red-500 hover:bg-red-500/10 rounded-full" title="Delete" onClick={(e) => { if (!window.confirm("Are you sure?")) e.preventDefault(); }}>
            <Trash2 className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

// FIX: This parent component is now correctly set up
export default function ResourceManager({
  resources,
  categories,
}: { // Accept simplified props, pagination can be added later
  resources: ResourceWithCategory[];
  categories: Category[];
}) {
  const [createState, createAction] = useFormState(createResource, { message: "" });
  const [deleteState, deleteAction] = useFormState(deleteResource, { message: "" });
  const formRef = useRef<HTMLFormElement>(null);
  
  // This handles the toast for the delete action
  useEffect(() => {
    if (deleteState?.message) toast.success(deleteState.message);
    if (deleteState?.error) toast.error(deleteState.error);
  }, [deleteState]);
  
  // This handles the toast for the create action
  useEffect(() => {
    if (createState?.message) {
      toast.success(createState.message);
      formRef.current?.reset();
    }
    if (createState?.error) {
      const errorMessages = typeof createState.error === "string" ? [createState.error] : Object.values(createState.error).flat();
      toast.error(errorMessages.join("\n") || "An error occurred.");
    }
  }, [createState]);

  return (
    <div className="bg-muted/50 p-6 rounded-lg">
      <h2 className="text-2xl font-bold text-foreground mb-4">Manage Resources</h2>

      {/* ... Create form is correct and remains the same ... */}
      <form ref={formRef} action={createAction} className="space-y-4 mb-8 pb-8 border-b border-muted">
        <input type="text" name="name" placeholder="Resource Name" required className="w-full p-2 bg-background border border-muted rounded-lg" />
        <textarea name="description" placeholder="Short description..." required rows={3} className="w-full p-2 bg-background border border-muted rounded-lg" />
        <input type="url" name="url" placeholder="Resource URL (https://...)" required className="w-full p-2 bg-background border border-muted rounded-lg" />
        <input type="url" name="imageUrl" placeholder="Image URL (optional, https://example.com/image.jpg)" className="w-full p-2 bg-background border border-muted rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select name="categoryId" required className="w-full p-2 bg-background border border-muted rounded-lg">
            <option value="">Select a Category</option>
            {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
          </select>
          <select name="status" defaultValue="APPROVED" className="w-full p-2 bg-background border border-muted rounded-lg">
            <option value="APPROVED">APPROVED</option>
            <option value="PENDING">PENDING</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>
        <SubmitButton text="Create Resource" />
      </form>

      <div className="space-y-2">
        <h3 className="font-bold text-lg mb-2">Existing Resources</h3>
        {resources.map((resource) => (
          <ResourceRow
            key={resource.id}
            resource={resource}
            categories={categories}
            deleteAction={deleteAction} // Pass the delete action to the child
          />
        ))}
        {resources.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No resources in this category.</p>
        )}
      </div>
    </div>
  );
}