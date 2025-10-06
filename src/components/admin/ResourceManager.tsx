// src/components/admin/ResourceManager.tsx

"use client";

import { useFormState } from "react-dom";
import { createResource, updateResource, deleteResource } from "@/app/actions";
import type { Resource, Category } from "@prisma/client";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { Trash2, Edit, X, Check } from "lucide-react";
import { SubmitButton } from "./SubmitButton";

type ResourceWithCategory = Resource & { category: Category };

interface ResourceManagerProps {
  resources: ResourceWithCategory[];
  categories: Category[];
}

// Sub-component for each resource row with editing functionality
function ResourceRow({ resource, categories }: { resource: ResourceWithCategory; categories: Category[] }) {
  const [isEditing, setIsEditing] = useState(false);
  const [updateState, updateAction] = useFormState(updateResource, { message: "" });

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

  if (isEditing) {
    return (
      <form action={updateAction} className="bg-background p-3 rounded-lg space-y-2 border border-primary">
        <input type="hidden" name="id" value={resource.id} />
        <input type="text" name="name" defaultValue={resource.name} className="w-full p-2 bg-muted/50 border border-muted rounded-lg" />
        <textarea name="description" defaultValue={resource.description} rows={2} className="w-full p-2 bg-muted/50 border border-muted rounded-lg" />
        <input type="url" name="url" defaultValue={resource.url} className="w-full p-2 bg-muted/50 border border-muted rounded-lg" />
        <input type="url" name="imageUrl" defaultValue={resource.imageUrl || ""} className="w-full p-2 bg-muted/50 border border-muted rounded-lg" />
        <select name="categoryId" defaultValue={resource.categoryId} className="w-full p-2 bg-muted/50 border border-muted rounded-lg">
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <SubmitButton text="Save" />
          <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg">
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-center justify-between bg-background p-3 rounded-lg">
      <div>
        <p className="font-semibold">{resource.name}</p>
        <p className="text-xs text-muted-foreground">{resource.category.name}</p>
      </div>
      <div className="flex items-center">
        <button onClick={() => setIsEditing(true)} className="p-2 text-muted-foreground hover:bg-muted rounded-full">
          <Edit className="w-4 h-4" />
        </button>
        <form action={deleteResource}>
          <input type="hidden" name="resourceId" value={resource.id} />
          <button type="submit" className="p-2 text-red-500 hover:bg-red-500/10 rounded-full">
            <Trash2 className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}


export default function ResourceManager({ resources, categories }: ResourceManagerProps) {
  const [createState, createAction] = useFormState(createResource, { message: "" });
  const formRef = useRef<HTMLFormElement>(null);

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

      <form ref={formRef} action={createAction} className="space-y-4 mb-8 pb-8 border-b border-muted">
        <input type="text" name="name" placeholder="Resource Name" required className="w-full p-2 bg-background border border-muted rounded-lg" />
        <textarea name="description" placeholder="Short description..." required rows={3} className="w-full p-2 bg-background border border-muted rounded-lg" />
        <input type="url" name="url" placeholder="Resource URL (https://...)" required className="w-full p-2 bg-background border border-muted rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="url" name="imageUrl" placeholder="Image URL (optional)" className="w-full p-2 bg-background border border-muted rounded-lg" />
          <select name="categoryId" required className="w-full p-2 bg-background border border-muted rounded-lg">
            <option value="">Select a Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <SubmitButton text="Create Resource" />
      </form>

      <div className="space-y-2">
        <h3 className="font-bold text-lg mb-2">Existing Resources</h3>
        {resources.map((resource) => (
          <ResourceRow key={resource.id} resource={resource} categories={categories} />
        ))}
      </div>
    </div>
  );
}