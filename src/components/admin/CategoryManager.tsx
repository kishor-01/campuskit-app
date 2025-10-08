// src/components/admin/CategoryManager.tsx
"use client";
import { useFormState } from "react-dom";
import { manageCategory, deleteCategory } from "@/app/actions";
import type { Category } from "@prisma/client";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { Trash2, Edit, X, Check } from "lucide-react";
import { SubmitButton } from "./SubmitButton";

export default function CategoryManager({ categories }: { categories: Category[] }) {
  const [formState, formAction] = useFormState(manageCategory, { message: "" });
  const createFormRef = useRef<HTMLFormElement>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  useEffect(() => {
    if (formState?.message) {
      toast.success(formState.message);
      if (formState.message.includes("created")) createFormRef.current?.reset();
      setEditingCategoryId(null);
    }
    if (formState?.error) toast.error(formState.error);
  }, [formState]);

  return (
    <div className="bg-muted/50 p-6 rounded-lg">
      <h2 className="text-2xl font-bold text-foreground mb-4">Manage Categories</h2>
      <form ref={createFormRef} action={formAction} className="flex gap-2 mb-6 pb-6 border-b border-muted">
        <input type="hidden" name="intent" value="create" />
        <input type="text" name="name" placeholder="New category name..." required className="w-full p-2 bg-background border border-muted rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"/>
        <SubmitButton text="Create" />
      </form>
      <div className="space-y-2">
        <h3 className="font-bold text-lg mb-2">Existing Categories</h3>
        {categories.map((category) => (
          <div key={category.id} className="flex items-center justify-between bg-background p-2 rounded-lg">
            {editingCategoryId === category.id ? (
              <form action={formAction} className="flex-grow flex items-center gap-2">
                <input type="hidden" name="intent" value="update" />
                <input type="hidden" name="categoryId" value={category.id} />
                <input type="text" name="name" defaultValue={category.name} autoFocus className="w-full p-1 bg-background border border-primary rounded-md"/>
                <button type="submit" className="p-2 text-primary hover:bg-primary/10 rounded-full"><Check className="w-4 h-4" /></button>
                <button type="button" onClick={() => setEditingCategoryId(null)} className="p-2 text-muted-foreground hover:bg-muted rounded-full"><X className="w-4 h-4" /></button>
              </form>
            ) : (
              <>
                <span className="font-medium px-1">{category.name}</span>
                <div className="flex items-center">
                  <button onClick={() => setEditingCategoryId(category.id)} className="p-2 text-muted-foreground hover:bg-muted rounded-full"><Edit className="w-4 h-4" /></button>
                  <form action={deleteCategory}><input type="hidden" name="categoryId" value={category.id} /><button type="submit" className="p-2 text-red-500 hover:bg-red-500/10 rounded-full"><Trash2 className="w-4 h-4" /></button></form>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}