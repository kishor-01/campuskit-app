// /src/components/admin/ResourceManager.tsx
"use client";

import React, { useActionState, useEffect, useRef, useState, useTransition, useOptimistic } from "react";
import { createResource, updateResource, deleteResource } from "@/actions";
import { Resource, Category, ResourceStatus } from "@prisma/client";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFormStatus } from "react-dom";
import { DataTable } from "@/components/ui/data-table";
import { columns, ResourceData } from "./resources/columns";
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
  success?: boolean;
};

type ResourceWithCategory = Resource & { category: Category };

function CreateSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {pending ? "Creating..." : "Create Resource"}
    </Button>
  );
}

function EditSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {pending ? "Saving..." : "Save Changes"}
    </Button>
  );
}

export default function ResourceManager({
  resources,
  categories,
}: {
  resources: ResourceWithCategory[];
  categories: Category[];
}) {
  const [createState, createAction] = useActionState<FormState, FormData>(createResource, { message: null, error: null });
  const [deleteState, deleteActionHook] = useActionState<FormState, FormData>(deleteResource, { message: null, error: null });
  const [updateState, updateAction] = useActionState<FormState, FormData>(updateResource, { message: null, error: null });

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<ResourceWithCategory | null>(null);
  const createFormRef = useRef<HTMLFormElement>(null);
  const editFormRef = useRef<HTMLFormElement>(null);

  const [optimisticResources, removeOptimisticResource] = useOptimistic<ResourceWithCategory[], string>(
    resources,
    (currentState, resourceIdToRemove) => {
      return currentState.filter((resource) => resource.id !== resourceIdToRemove);
    }
  );

  const handleDeleteResource = async (resourceId: string) => {
    removeOptimisticResource(resourceId);
    const formData = new FormData();
    formData.append("id", resourceId);
    await deleteActionHook(formData);
  };

  const handleEditClick = (resource: ResourceData) => {
    setEditingResource(resource);
    setIsEditDialogOpen(true);
    editFormRef.current?.reset();
  };

  // UPDATED: Enhanced error handling for createState
  useEffect(() => {
    if (createState?.message) {
      toast.success(createState.message);
      createFormRef.current?.reset();
    }
    if (createState?.error) {
      // Handle different error formats
      if (typeof createState.error === 'string') {
        toast.error(createState.error);
      } else if (createState.error && typeof createState.error === 'object') {
        // Handle form-level errors
        if (createState.error._form) {
          const formError = Array.isArray(createState.error._form) 
            ? createState.error._form[0] 
            : createState.error._form;
          toast.error(formError);
        } else {
          // Handle field-specific errors
          const errorMessages = Object.values(createState.error).flat();
          if (errorMessages.length > 0) {
            toast.error(errorMessages.join('\n'));
          } else {
            toast.error("Failed to create resource");
          }
        }
      } else {
        toast.error("Failed to create resource");
      }
    }
  }, [createState]);

  // UPDATED: Enhanced error handling for deleteState
  useEffect(() => {
    if (deleteState?.message && !deleteState.error) {
      toast.success(deleteState.message);
    }
    if (deleteState?.error) {
      // Handle different error formats
      if (typeof deleteState.error === 'string') {
        toast.error(deleteState.error);
      } else if (deleteState.error && typeof deleteState.error === 'object') {
        // Handle form-level errors
        if (deleteState.error._form) {
          const formError = Array.isArray(deleteState.error._form) 
            ? deleteState.error._form[0] 
            : deleteState.error._form;
          toast.error(formError);
        } else {
          // Handle field-specific errors
          const errorMessages = Object.values(deleteState.error).flat();
          if (errorMessages.length > 0) {
            toast.error(errorMessages.join('\n'));
          } else {
            toast.error("Failed to delete resource");
          }
        }
      } else {
        toast.error("Failed to delete resource");
      }
    }
  }, [deleteState]);

  // UPDATED: Enhanced error handling for updateState
  useEffect(() => {
    if (updateState?.message) {
      toast.success(updateState.message);
      setIsEditDialogOpen(false);
      setEditingResource(null);
    }
    if (updateState?.error) {
      // Handle different error formats
      if (typeof updateState.error === 'string') {
        toast.error(updateState.error);
      } else if (updateState.error && typeof updateState.error === 'object') {
        // Handle form-level errors
        if (updateState.error._form) {
          const formError = Array.isArray(updateState.error._form) 
            ? updateState.error._form[0] 
            : updateState.error._form;
          toast.error(formError);
        } else {
          // Handle field-specific errors
          const errorMessages = Object.values(updateState.error).flat();
          if (errorMessages.length > 0) {
            toast.error(errorMessages.join('\n'));
          } else {
            toast.error("Failed to update resource");
          }
        }
      } else {
        toast.error("Failed to update resource");
      }
    }
  }, [updateState]);

  const tableColumns = React.useMemo(
    () => columns(handleEditClick, handleDeleteResource),
    []
  );

  return (
    <>
      <div className="bg-muted/50 p-6 rounded-lg border border-border">
        <h2 className="text-2xl font-bold text-foreground mb-4">Manage Resources</h2>

        <details className="mb-8 pb-8 border-b border-muted">
          <summary className="cursor-pointer font-semibold text-primary mb-4">Add New Resource</summary>
          <form ref={createFormRef} action={createAction} className="space-y-4 mt-4">
            <Input type="text" name="name" placeholder="Resource Name" required className="w-full bg-background border-muted" />
            <Textarea name="description" placeholder="Short description..." required rows={3} className="w-full bg-background border-muted" />
            <Input type="url" name="url" placeholder="Resource URL (https://...)" required className="w-full bg-background border-muted" />
            <Input type="url" name="imageUrl" placeholder="Image URL (optional, https://example.com/image.jpg)" className="w-full bg-background border-muted" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* FIXED: Category Select */}
              <Select name="categoryId" required>
                <SelectTrigger className="w-full bg-background border-muted">
                  <SelectValue placeholder={categories.length === 0 ? "No categories available" : "Select a Category"} />
                </SelectTrigger>
                <SelectContent>
                  {categories.length === 0 ? (
                    <div className="py-1.5 pl-8 pr-2 text-sm text-muted-foreground">No categories available</div>
                  ) : (
                    categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              
              <Select name="status" defaultValue={ResourceStatus.APPROVED}>
                <SelectTrigger className="w-full bg-background border-muted">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ResourceStatus.APPROVED}>APPROVED</SelectItem>
                  <SelectItem value={ResourceStatus.PENDING}>PENDING</SelectItem>
                  <SelectItem value={ResourceStatus.REJECTED}>REJECTED</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <CreateSubmitButton />
            
            {/* UPDATED: Enhanced error display */}
            {createState?.error && typeof createState.error === 'string' && (
              <p className="text-sm text-destructive mt-2 text-center">{createState.error}</p>
            )}
            {createState?.error && typeof createState.error === 'object' && createState.error._form && (
              <p className="text-sm text-destructive mt-2 text-center">
                {Array.isArray(createState.error._form) ? createState.error._form[0] : createState.error._form}
              </p>
            )}
            {createState?.error && typeof createState.error === 'object' && !createState.error._form && (
              <div className="text-xs text-destructive mt-2 space-y-1">
                {Object.entries(createState.error).map(([field, errors]) => (
                  <p key={field}>{field}: {Array.isArray(errors) ? errors.join(', ') : errors}</p>
                ))}
              </div>
            )}
          </form>
        </details>

        <DataTable columns={tableColumns} data={optimisticResources} />
        {optimisticResources.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No resources match the current filters.</p>
        )}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Resource</DialogTitle>
            <DialogDescription>
              Make changes to the resource details below. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          {editingResource && (
            <form
              key={editingResource.id}
              ref={editFormRef}
              action={updateAction}
              className="space-y-4 pt-4"
            >
              <input type="hidden" name="id" value={editingResource.id} />

              <div>
                <label htmlFor="edit-name" className="text-sm font-medium">Name</label>
                <Input id="edit-name" name="name" defaultValue={editingResource.name} required />
                {updateState?.error && typeof updateState.error === 'object' && updateState.error.name && (
                  <p className="text-xs text-destructive mt-1">{Array.isArray(updateState.error.name) ? updateState.error.name[0] : updateState.error.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="edit-url" className="text-sm font-medium">URL</label>
                <Input id="edit-url" name="url" type="url" defaultValue={editingResource.url} required />
                {updateState?.error && typeof updateState.error === 'object' && updateState.error.url && (
                  <p className="text-xs text-destructive mt-1">{Array.isArray(updateState.error.url) ? updateState.error.url[0] : updateState.error.url}</p>
                )}
              </div>

              <div>
                <label htmlFor="edit-imageUrl" className="text-sm font-medium">Image URL</label>
                <Input id="edit-imageUrl" name="imageUrl" type="url" defaultValue={editingResource.imageUrl ?? ""} placeholder="Optional" />
                {updateState?.error && typeof updateState.error === 'object' && updateState.error.imageUrl && (
                  <p className="text-xs text-destructive mt-1">{Array.isArray(updateState.error.imageUrl) ? updateState.error.imageUrl[0] : updateState.error.imageUrl}</p>
                )}
              </div>

              <div>
                <label htmlFor="edit-category" className="text-sm font-medium">Category</label>
                {/* FIXED: Category Select in Edit Form */}
                <Select name="categoryId" required defaultValue={editingResource.categoryId}>
                  <SelectTrigger id="edit-category">
                    <SelectValue placeholder={categories.length === 0 ? "No categories available" : "Select Category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length === 0 ? (
                      <div className="py-1.5 pl-8 pr-2 text-sm text-muted-foreground">No categories available</div>
                    ) : (
                      categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {updateState?.error && typeof updateState.error === 'object' && updateState.error.categoryId && (
                  <p className="text-xs text-destructive mt-1">{Array.isArray(updateState.error.categoryId) ? updateState.error.categoryId[0] : updateState.error.categoryId}</p>
                )}
              </div>

              <div>
                <label htmlFor="edit-description" className="text-sm font-medium">Description</label>
                <Textarea id="edit-description" name="description" defaultValue={editingResource.description ?? ""} rows={4} required />
                {updateState?.error && typeof updateState.error === 'object' && updateState.error.description && (
                  <p className="text-xs text-destructive mt-1">{Array.isArray(updateState.error.description) ? updateState.error.description[0] : updateState.error.description}</p>
                )}
              </div>

              <div>
                <label htmlFor="edit-status" className="text-sm font-medium">Status</label>
                <Select name="status" required defaultValue={editingResource.status}>
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ResourceStatus.APPROVED}>APPROVED</SelectItem>
                    <SelectItem value={ResourceStatus.PENDING}>PENDING</SelectItem>
                    <SelectItem value={ResourceStatus.REJECTED}>REJECTED</SelectItem>
                  </SelectContent>
                </Select>
                {updateState?.error && typeof updateState.error === 'object' && updateState.error.status && (
                  <p className="text-xs text-destructive mt-1">{Array.isArray(updateState.error.status) ? updateState.error.status[0] : updateState.error.status}</p>
                )}
              </div>

              {/* UPDATED: Enhanced error display */}
              {updateState?.error && typeof updateState.error === 'string' && (
                <p className="text-sm text-destructive text-center">{updateState.error}</p>
              )}
              {updateState?.error && typeof updateState.error === 'object' && updateState.error._form && (
                <p className="text-sm text-destructive text-center">
                  {Array.isArray(updateState.error._form) ? updateState.error._form[0] : updateState.error._form}
                </p>
              )}
              {updateState?.error && typeof updateState.error === 'object' && !updateState.error._form && (
                <div className="text-xs text-destructive mt-2 space-y-1">
                  {Object.entries(updateState.error).map(([field, errors]) => (
                    <p key={field}>{field}: {Array.isArray(errors) ? errors.join(', ') : errors}</p>
                  ))}
                </div>
              )}

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <EditSubmitButton />
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}