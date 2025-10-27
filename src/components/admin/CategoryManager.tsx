// /src/components/admin/CategoryManager.tsx
"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createCategory, updateCategory, deleteCategory } from "@/actions";
import type { Category } from "@prisma/client";
import { toast } from "react-hot-toast";
import { Trash2, Edit, X, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFormStatus } from "react-dom";

type FormState = {
  message?: string | null;
  error?: string | Record<string, string[]> | null;
  success?: boolean;
};

function CreateCategorySubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {pending ? "Creating..." : "Create"}
    </Button>
  );
}

function UpdateCategorySubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="icon" variant="ghost" className="text-primary hover:bg-primary/10" title="Save changes" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="w-4 h-4" />}
    </Button>
  );
}

export default function CategoryManager({ categories }: { categories: Category[] }) {
  const [createState, createAction] = useActionState<FormState, FormData>(createCategory, { message: null, error: null });
  const [updateState, updateAction] = useActionState<FormState, FormData>(updateCategory, { message: null, error: null });
  const [deleteState, deleteActionHook] = useActionState<FormState, FormData>(deleteCategory, { message: null, error: null });

  const createFormRef = useRef<HTMLFormElement>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Handle create category state
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
          toast.error(errorMessages.join('\n'));
        }
      } else {
        toast.error("Failed to create category");
      }
    }
  }, [createState]);

  // Handle update category state
  useEffect(() => {
    if (updateState?.message) {
      toast.success(updateState.message);
      setEditingCategoryId(null);
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
          toast.error(errorMessages.join('\n'));
        }
      } else {
        toast.error("Failed to update category");
      }
    }
  }, [updateState]);

  // Handle delete category state
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
          toast.error(errorMessages.join('\n'));
        }
      } else {
        toast.error("Failed to delete category");
      }
    }
  }, [deleteState]);

  useEffect(() => {
    if (editingCategoryId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingCategoryId]);

  return (
    <div className="bg-muted/50 p-6 rounded-lg">
      <h2 className="text-2xl font-bold text-foreground mb-4">Manage Categories</h2>

      <form ref={createFormRef} action={createAction} className="flex gap-2 mb-6 pb-6 border-b border-muted">
        <Input
          type="text"
          name="name"
          placeholder="New category name..."
          required
          className="w-full bg-background border-muted focus-visible:ring-primary"
        />
        <CreateCategorySubmitButton />
      </form>

      <div className="space-y-2">
        <h3 className="font-bold text-lg mb-2">Existing Categories</h3>
        {categories.map((category) => (
          <div key={category.id} className="flex items-center justify-between bg-background p-2 rounded-lg group min-h-[48px]">
            {editingCategoryId === category.id ? (
              <form action={updateAction} className="flex-grow flex items-center gap-2">
                <input type="hidden" name="id" value={category.id} />
                <Input
                  ref={editInputRef}
                  type="text"
                  name="name"
                  defaultValue={category.name}
                  required
                  className="w-full h-9 px-2 bg-background border-primary rounded-md"
                />
                <UpdateCategorySubmitButton />
                <Button type="button" variant="ghost" size="icon" onClick={() => setEditingCategoryId(null)} title="Cancel edit">
                  <X className="w-4 h-4" />
                </Button>
              </form>
            ) : (
              <>
                <span className="font-medium px-1">{category.name}</span>
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" onClick={() => setEditingCategoryId(category.id)} title="Edit Category">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <form action={deleteActionHook}>
                    <input type="hidden" name="id" value={category.id} />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      title="Delete Category"
                      onClick={(e) => {
                        if (!window.confirm(`Delete category "${category.name}"? This cannot be undone.`)) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </>
            )}
          </div>
        ))}
        {categories.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No categories created yet.</p>
        )}
      </div>
    </div>
  );
}