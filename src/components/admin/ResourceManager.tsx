// src/components/admin/ResourceManager.tsx

"use client";

import { useFormState } from "react-dom";
import { createResource, deleteResource } from "@/app/actions";
import type { Category, Resource } from "@prisma/client";
import { useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { Trash2 } from "lucide-react";
import { SubmitButton } from "./SubmitButton"; // This is the import we are fixing.

type ResourceWithCategory = Resource & { category: Category };

interface ResourceManagerProps {
  resources: ResourceWithCategory[];
  categories: Category[];
}

export default function ResourceManager({ resources, categories }: ResourceManagerProps) {
  const [state, formAction] = useFormState(createResource, { message: "" });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.message) {
      toast.success(state.message);
      formRef.current?.reset();
    }
    if (state?.error && typeof state.error !== 'string') {
      const errorMessages = Object.values(state.error).flat();
      toast.error(errorMessages.join('\n') || "An error occurred.");
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <div className="bg-muted/50 p-6 rounded-lg col-span-1 lg:col-span-2">
      <h2 className="text-2xl font-bold text-foreground mb-4">Manage Resources</h2>
      
      <form ref={formRef} action={formAction} className="space-y-4 mb-8 pb-8 border-b border-muted">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" name="name" placeholder="Resource Name" required className="w-full p-2 bg-background border border-muted rounded-lg"/>
          <input type="url" name="url" placeholder="https://example.com" required className="w-full p-2 bg-background border border-muted rounded-lg"/>
        </div>
        <textarea name="description" placeholder="Short description..." required rows={3} className="w-full p-2 bg-background border border-muted rounded-lg"/>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="url" name="imageUrl" placeholder="Image URL (optional)" className="w-full p-2 bg-background border border-muted rounded-lg"/>
          <select name="categoryId" required className="w-full p-2 bg-background border border-muted rounded-lg">
            <option value="">Select a Category</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
        </div>
        <SubmitButton text="Create Resource" />
      </form>

      <div className="space-y-2">
        {resources.map((res) => (
          <div key={res.id} className="flex items-center justify-between bg-background p-3 rounded-lg">
            <div>
              <p className="font-semibold">{res.name}</p>
              <p className="text-xs text-muted-foreground">{res.category.name}</p>
            </div>
            <form action={deleteResource}>
              <input type="hidden" name="resourceId" value={res.id} />
              <button type="submit" className="p-2 text-red-500 hover:bg-red-500/10 rounded-full">
                <Trash2 className="w-4 h-4" />
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}