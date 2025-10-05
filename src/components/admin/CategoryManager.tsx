// src/components/admin/CategoryManager.tsx

"use client";

import { useFormState, useFormStatus } from "react-dom";
import { manageCategory, deleteCategory } from "@/app/actions"; // Import both actions
import { Trash2, Edit, X, Check } from "lucide-react";
import type { Category } from "@prisma/client";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";

function SubmitButton({ text, variant = "primary" }: { text?: string, variant?: "primary" | "ghost" }) {
  const { pending } = useFormStatus();
  if (variant === 'ghost') {
    return <button type="submit" disabled={pending} className="p-2 text-primary hover:bg-primary/10 rounded-full">{pending ? <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" /> : text}</button>
  }
  return (
    <button type="submit" disabled={pending} className="bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-lg text-sm hover:bg-primary/90 transition-colors disabled:opacity-50">
      {pending ? "Saving..." : text}
    </button>
  );
}

export default function CategoryManager({ categories }: { categories: Category[] }) {
  const [createState, createAction] = useFormState(manageCategory, { message: "" });
  const createFormRef = useRef<HTMLFormElement>(null);
  
  // State to track which category is being edited
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  useEffect(() => {
    if (createState?.message) {
      toast.success(createState.message);
      createFormRef.current?.reset();
    }
    if (createState?.error) toast.error(createState.error);
  }, [createState]);
  
  // This effect closes the edit form on a successful update
  useEffect(() => {
    if (createState?.message?.includes("updated")) {
      setEditingCategoryId(null);
    }
  }, [createState]);


  return (
    <div className="bg-muted/50 p-6 rounded-lg">
      <h2 className="text-2xl font-bold text-foreground mb-4">Manage Categories</h2>

      <form ref={createFormRef} action={createAction} className="flex gap-2 mb-6 pb-6 border-b border-muted">
        <input type="hidden" name="intent" value="create" />
        <input type="text" name="name" placeholder="New category name..." required className="w-full p-2 bg-background border border-muted rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"/>
        <SubmitButton text="Create" />
      </form>

      <div className="space-y-2">
        {categories.map((category) => (
          <div key={category.id} className="flex items-center justify-between bg-background p-2 rounded-lg">
            {editingCategoryId === category.id ? (
              // EDITING STATE: Show form
              <form action={createAction} className="flex-grow flex items-center gap-2">
                <input type="hidden" name="intent" value="update" />
                <input type="hidden" name="categoryId" value={category.id} />
                <input type="text" name="name" defaultValue={category.name} autoFocus className="w-full p-1 bg-background border border-primary rounded-md"/>
                <SubmitButton text={<Check className="w-4 h-4" />} variant="ghost"/>
                <button type="button" onClick={() => setEditingCategoryId(null)} className="p-2 text-muted-foreground hover:bg-muted rounded-full">
                    <X className="w-4 h-4" />
                </button>
              </form>
            ) : (
              // DEFAULT STATE: Show name and buttons
              <>
                <span className="font-medium px-1">{category.name}</span>
                <div className="flex items-center">
                  <button onClick={() => setEditingCategoryId(category.id)} className="p-2 text-muted-foreground hover:bg-muted rounded-full">
                    <Edit className="w-4 h-4" />
                  </button>
                  <form action={deleteCategory}>
                    <input type="hidden" name="categoryId" value={category.id} />
                    <button type="submit" className="p-2 text-red-500 hover:bg-red-500/10 rounded-full">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}