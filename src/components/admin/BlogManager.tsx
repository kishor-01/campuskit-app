// src/components/admin/BlogManager.tsx
"use client";

import { useFormState } from "react-dom";
import { createArticle, deleteArticle, updateArticle } from "@/app/actions";
import type { Article } from "@prisma/client";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { Trash2, Edit, X, Check } from "lucide-react";
import { SubmitButton } from "./SubmitButton";

function ArticleRow({ article }: { article: Article }) {
    const [isEditing, setIsEditing] = useState(false);
    const [updateState, updateAction] = useFormState(updateArticle, { message: "" });
    
    useEffect(() => {
        if (updateState?.message) {
            toast.success(updateState.message);
            setIsEditing(false);
        }
        if (updateState?.error) {
            const errorMessages = typeof updateState.error === 'string' ? [updateState.error] : Object.values(updateState.error).flat();
            toast.error(errorMessages.join('\n') || "An error occurred.");
        }
    }, [updateState]);

    if (isEditing) {
        return (
            <form action={updateAction} className="bg-background p-3 rounded-lg space-y-2 border border-primary">
                <input type="hidden" name="id" value={article.id} />
                <input type="text" name="title" defaultValue={article.title} className="w-full p-2 bg-muted/50 border border-muted rounded-lg" required />
                <textarea name="excerpt" defaultValue={article.excerpt} rows={2} className="w-full p-2 bg-muted/50 border border-muted rounded-lg" required />
                <textarea name="content" defaultValue={article.content} rows={8} className="w-full p-2 bg-muted/50 border border-muted rounded-lg font-mono text-sm" required />
                <div className="grid grid-cols-2 gap-4">
                    <input type="url" name="imageUrl" defaultValue={article.imageUrl || ''} className="w-full p-2 bg-muted/50 border border-muted rounded-lg" placeholder="Image URL" />
                    <select name="status" defaultValue={article.status} className="w-full p-2 bg-muted/50 border border-muted rounded-lg" required>
                        <option value="DRAFT">Draft</option>
                        <option value="PUBLISHED">Published</option>
                    </select>
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
            <div>
                <p className="font-semibold">{article.title}</p>
                <p className={`text-xs font-bold uppercase ${article.status === 'PUBLISHED' ? 'text-green-500' : 'text-yellow-500'}`}>{article.status}</p>
            </div>
            <div className="flex items-center">
                <button onClick={() => setIsEditing(true)} className="p-2 text-muted-foreground hover:bg-muted rounded-full">
                    <Edit className="w-4 h-4" />
                </button>
                <form action={deleteArticle}>
                    <input type="hidden" name="articleId" value={article.id} />
                    <button type="submit" className="p-2 text-red-500 hover:bg-red-500/10 rounded-full" aria-label="Delete article">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function BlogManager({ articles }: { articles: Article[] }) {
  const [createState, createAction] = useFormState(createArticle, { message: "" });
  const formRef = useRef<HTMLFormElement>(null);

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
          : ["An error occurred"];
        toast.error(errorMessages.join('\n') || "An error occurred.");
    }
  }, [createState]);

  return (
    <div className="bg-muted/50 p-6 rounded-lg col-span-full">
      <h2 className="text-2xl font-bold text-foreground mb-4">Blog Manager</h2>
      
      {/* CREATE FORM - Fixed with proper form structure */}
      <form 
        ref={formRef} 
        action={createAction} 
        className="space-y-4 mb-8 pb-8 border-b border-muted"
      >
        <div>
          <input 
            type="text" 
            name="title" 
            placeholder="Article Title" 
            required 
            className="w-full p-2 bg-background border border-muted rounded-lg text-lg font-semibold"
          />
        </div>
        
        <div>
          <textarea 
            name="excerpt" 
            placeholder="Short excerpt for the article card..." 
            required 
            rows={2} 
            className="w-full p-2 bg-background border border-muted rounded-lg text-sm"
          />
        </div>
        
        <div>
          <textarea 
            name="content" 
            placeholder="Write your article content here..." 
            required 
            rows={10} 
            className="w-full p-2 bg-background border border-muted rounded-lg font-mono text-sm"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input 
              type="url" 
              name="imageUrl" 
              placeholder="Header Image URL (optional)" 
              className="w-full p-2 bg-background border border-muted rounded-lg"
            />
          </div>
          
          <div>
            <select 
              name="status" 
              defaultValue="DRAFT" 
              required 
              className="w-full p-2 bg-background border border-muted rounded-lg"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </div>
        </div>
        
        <div>
          <SubmitButton text="Create Article" />
        </div>
      </form>

      <div className="space-y-2">
        <h3 className="font-bold text-lg mb-2">Existing Articles</h3>
        {articles.map((article) => (
          <ArticleRow key={article.id} article={article} />
        ))}
        {articles.length === 0 && (
          <p className="text-muted-foreground text-center py-4">No articles yet. Create your first one above!</p>
        )}
      </div>
    </div>
  );
}