// /src/components/admin/BlogManager.tsx - FIXED VERSION
"use client";

import React, { useOptimistic, useEffect, useRef, useState, useActionState } from "react";
import { createArticle, deleteArticle, updateArticle } from "@/actions";
import { Article, ArticleStatus, ArticleSeries } from "@prisma/client";
import { toast } from "react-hot-toast";
import { Loader2, AlertTriangle, Info } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/ui/data-table";
import { columns, ArticleData } from "./blog/columns";
import TiptapEditor from "./TiptapEditor";
import { Alert, AlertDescription } from "@/components/ui/alert";

// NEW: Add affiliate link type
type AffiliateLink = {
  id: string;
  name: string;
  url: string;
  slug: string;
  partner: {
    name: string;
  };
};

type FormState = {
  message?: string | null;
  error?: string | Record<string, string[]> | null;
  success?: boolean;
};

type ArticleWithAuthor = Article & {
  author?: { name?: string | null, email?: string | null } | null
};

// Submit Button for Create Form
function CreateSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {pending ? "Creating..." : "Create Article"}
    </Button>
  );
}

// Submit Button for Edit Dialog Form
function EditSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {pending ? "Saving..." : "Save Changes"}
    </Button>
  );
}

// Content Statistics Component - REMOVED CHARACTER LIMIT
function ContentStats({ content }: { content: string }) {
  const charCount = content.length;
  const wordCount = content.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(word => word.length > 0).length;
  const imageCount = (content.match(/<img/g) || []).length;
  
  return (
    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
      <span className="text-green-500">
        {charCount.toLocaleString()} characters
      </span>
      <span>{wordCount.toLocaleString()} words</span>
      {imageCount > 0 && <span>{imageCount} images</span>}
    </div>
  );
}

// Main BlogManager component
export default function BlogManager({ 
  articles, 
  affiliateLinks = [],
  allSeries = [],
}: { 
  articles: ArticleWithAuthor[];
  affiliateLinks?: AffiliateLink[];
  allSeries?: { id: string; title: string; slug: string }[];
}) {
  // Action states
  const [createState, createAction] = useActionState<FormState, FormData>(createArticle, { message: null, error: null });
  const [deleteState, deleteActionHook] = useActionState<FormState, FormData>(deleteArticle, { message: null, error: null });
  const [updateState, updateAction] = useActionState<FormState, FormData>(updateArticle, { message: null, error: null });

  // Refs and local state
  const createFormRef = useRef<HTMLFormElement>(null);
  const editFormRef = useRef<HTMLFormElement>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ArticleWithAuthor | null>(null);

  // State for editor content
  const [createContent, setCreateContent] = useState<string>("");
  const [editContent, setEditContent] = useState<string>("");

  // Optimistic state for articles (delete)
  const [optimisticArticles, removeOptimisticArticle] = useOptimistic<ArticleWithAuthor[], string>(
    articles,
    (currentState, articleIdToRemove) => {
      return currentState.filter((article) => article.id !== articleIdToRemove);
    }
  );

  // Wrapper function for deleteAction
  const handleDeleteArticle = async (articleId: string) => {
    removeOptimisticArticle(articleId);
    const formData = new FormData();
    formData.append("id", articleId);
    await deleteActionHook(formData);
  };

  // Function to open edit dialog
  const handleEditClick = (article: ArticleData) => {
    setEditingArticle(article);
    setEditContent(article.content ?? "");
    setIsEditDialogOpen(true);
    editFormRef.current?.reset();
  };

  // useEffects for Toasts
  useEffect(() => {
    if (createState?.message) {
      toast.success(createState.message);
      createFormRef.current?.reset();
      setCreateContent("");
    }
    if (createState?.error) {
      const errorMessages = typeof createState.error === 'string'
        ? [createState.error]
        : createState.error && typeof createState.error === 'object'
        ? Object.values(createState.error).flat()
        : ["Failed to create article."];
      toast.error(errorMessages.join("\n"));
    }
  }, [createState]);

  useEffect(() => {
    if (deleteState?.message && !deleteState.error) {
      toast.success(deleteState.message);
    }
    if (deleteState?.error) {
      toast.error(typeof deleteState.error === 'string' ? deleteState.error : "Failed to delete article.");
    }
  }, [deleteState]);

  useEffect(() => {
    if (updateState?.message) {
      toast.success(updateState.message);
      setIsEditDialogOpen(false);
      setEditingArticle(null);
      setEditContent("");
    }
    if (updateState?.error) {
      const errorMessages = typeof updateState.error === 'string'
        ? [updateState.error]
        : updateState.error && typeof updateState.error === 'object'
        ? Object.values(updateState.error).flat()
        : ["Failed to update article."];
      toast.error(errorMessages.join('\n'));
    }
  }, [updateState]);

  // Memoize columns definition
  const tableColumns = React.useMemo(
    () => columns(handleEditClick, handleDeleteArticle),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <>
      <div className="bg-muted/50 p-6 rounded-lg border border-border col-span-full">
        <h2 className="text-2xl font-bold text-foreground mb-4">Blog Manager</h2>

        {/* CREATE FORM */}
        <details className="mb-8 pb-8 border-b border-muted">
          <summary className="cursor-pointer font-semibold text-primary mb-4">Add New Article</summary>
          
          {/* Information Alert - REMOVED CHARACTER LIMIT MENTION */}
          <Alert className="mb-4 bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Pro Tip:</strong> You can paste images directly into the editor. For best performance, 
              use external image URLs when possible. Write as much content as you need - no character limits!
            </AlertDescription>
          </Alert>

          <form
            ref={createFormRef}
            action={createAction}
            className="space-y-4 mt-4"
          >
            <Input type="text" name="title" placeholder="Article Title" required className="bg-background border-muted text-lg font-semibold" />
            <Textarea name="excerpt" placeholder="Short excerpt..." required rows={2} className="bg-background border-muted text-sm" />

            {/* Enhanced TiptapEditor with Stats */}
            <div>
              <label htmlFor="create-content" className="block text-sm font-medium text-foreground mb-1">
                Content
              </label>
              {/* Hidden input to send HTML content */}
              <input type="hidden" name="content" value={createContent} />
              <TiptapEditor
                onChange={setCreateContent}
                affiliateLinks={affiliateLinks}
              />
              {/* Content Statistics - NO CHARACTER LIMIT */}
              <ContentStats content={createContent} />
              
              {/* Display content validation error */}
              {createState?.error && typeof createState.error === 'object' && createState.error.content && (
                <Alert className="mt-2 bg-red-50 border-red-200">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {createState.error.content[0]}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input type="url" name="imageUrl" placeholder="Header Image URL (optional)" className="bg-background border-muted" />
              <Select name="status" defaultValue={ArticleStatus.DRAFT}>
                <SelectTrigger className="w-full bg-background border-muted">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ArticleStatus.DRAFT}>Draft</SelectItem>
                  <SelectItem value={ArticleStatus.PUBLISHED}>Published</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Phase 2: Metadata Fields */}
            <details className="border border-border rounded-lg p-4 bg-muted/30">
              <summary className="cursor-pointer font-semibold text-sm text-foreground mb-2">Publication Metadata (Optional)</summary>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Tags (comma-separated)</label>
                  <Input type="text" name="tags" placeholder="react, tutorial, api" className="mt-1" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Read Time (minutes)</label>
                  <Input type="number" name="readTimeMins" min={1} max={120} defaultValue={5} className="mt-1" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Series</label>
                  <Select name="seriesId">
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="No series" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=" ">No series</SelectItem>
                      {allSeries.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Series Order</label>
                  <Input type="number" name="seriesOrder" min={1} placeholder="e.g., 1" className="mt-1" />
                </div>
                <div className="flex items-center gap-2 col-span-full">
                  <input type="checkbox" name="hasInteractiveEnv" id="create-interactive" className="rounded" />
                  <label htmlFor="create-interactive" className="text-sm text-foreground">Has Interactive Code Playground</label>
                </div>
                <div className="col-span-full">
                  <label className="text-xs font-medium text-muted-foreground">Clonable Blueprint (JSON)</label>
                  <Textarea name="clonableBlueprint" rows={3} placeholder='{"title": "...", "milestones": [...]}' className="mt-1 font-mono text-xs" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Publish Date</label>
                  <Input type="datetime-local" name="publishedAt" className="mt-1" />
                  <p className="text-xs text-muted-foreground mt-1">Leave blank to publish immediately.</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Author Override</label>
                  <Input type="text" name="authorOverride" placeholder="Guest author name (optional)" className="mt-1" />
                </div>
              </div>
            </details>

            <CreateSubmitButton />

            {createState?.error && typeof createState.error === 'string' && (
              <Alert className="bg-red-50 border-red-200">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {createState.error}
                </AlertDescription>
              </Alert>
            )}

            {createState?.error && typeof createState.error === 'object' && !createState.error.content && (
              <div className="text-xs text-destructive mt-2 space-y-1">
                {Object.entries(createState.error).map(([field, errors]) => (
                  <p key={field}>{field}: {Array.isArray(errors) ? errors.join(', ') : errors}</p>
                ))}
              </div>
            )}
          </form>
        </details>

        {/* DataTable Display */}
        <h3 className="font-bold text-lg mb-4">Existing Articles</h3>
        <DataTable columns={tableColumns} data={optimisticArticles} />
        {optimisticArticles.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No articles match the current filters.</p>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] lg:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>Edit Article</DialogTitle>
            <DialogDescription>
              Make changes to the article below. Click save when done.
            </DialogDescription>
          </DialogHeader>
          {editingArticle && (
            <form
              key={editingArticle.id}
              ref={editFormRef}
              action={updateAction}
              className="space-y-4 pt-4 max-h-[75vh] overflow-y-auto pr-2"
            >
              <input type="hidden" name="id" value={editingArticle.id} />

              <div>
                <label htmlFor="edit-title" className="text-sm font-medium">Title</label>
                <Input id="edit-title" name="title" defaultValue={editingArticle.title} required />
                {updateState?.error && typeof updateState.error === 'object' && updateState.error.title && (
                  <p className="text-xs text-destructive mt-1">{updateState.error.title[0]}</p>
                )}
              </div>

              <div>
                <label htmlFor="edit-excerpt" className="text-sm font-medium">Excerpt</label>
                <Textarea id="edit-excerpt" name="excerpt" defaultValue={editingArticle.excerpt ?? ''} rows={3} required />
                {updateState?.error && typeof updateState.error === 'object' && updateState.error.excerpt && (
                  <p className="text-xs text-destructive mt-1">{updateState.error.excerpt[0]}</p>
                )}
              </div>

              {/* Enhanced TiptapEditor for Edit */}
              <div>
                <label htmlFor="edit-content" className="text-sm font-medium">Content</label>
                {/* Hidden input to send HTML content */}
                <input type="hidden" name="content" value={editContent} />
                <TiptapEditor
                  key={editingArticle.id + "-editor"}
                  initialContent={editingArticle.content ?? ""}
                  onChange={setEditContent}
                  affiliateLinks={affiliateLinks}
                />
                {/* Content Statistics - NO CHARACTER LIMIT */}
                <ContentStats content={editContent} />
                
                {updateState?.error && typeof updateState.error === 'object' && updateState.error.content && (
                  <Alert className="mt-2 bg-red-50 border-red-200">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      {updateState.error.content[0]}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div>
                <label htmlFor="edit-imageUrl" className="text-sm font-medium">Image URL</label>
                <Input id="edit-imageUrl" name="imageUrl" type="url" defaultValue={editingArticle.imageUrl ?? ""} placeholder="Optional" />
                {updateState?.error && typeof updateState.error === 'object' && updateState.error.imageUrl && (
                  <p className="text-xs text-destructive mt-1">{updateState.error.imageUrl[0]}</p>
                )}
              </div>

              <div>
                <label htmlFor="edit-status" className="text-sm font-medium">Status</label>
                <Select name="status" required defaultValue={editingArticle.status}>
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ArticleStatus.DRAFT}>Draft</SelectItem>
                    <SelectItem value={ArticleStatus.PUBLISHED}>Published</SelectItem>
                  </SelectContent>
                </Select>
                {updateState?.error && typeof updateState.error === 'object' && updateState.error.status && (
                  <p className="text-xs text-destructive mt-1">{updateState.error.status[0]}</p>
                )}
              </div>

              {/* Phase 2: Edit Metadata Fields */}
              <details className="border border-border rounded-lg p-4 bg-muted/30">
                <summary className="cursor-pointer font-semibold text-sm text-foreground mb-2">Publication Metadata</summary>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Tags (comma-separated)</label>
                    <Input type="text" name="tags" defaultValue={(editingArticle as any).tags?.join(', ') ?? ''} placeholder="react, tutorial, api" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Read Time (minutes)</label>
                    <Input type="number" name="readTimeMins" min={1} max={120} defaultValue={(editingArticle as any).readTimeMins ?? 5} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Series</label>
                    <Select name="seriesId" defaultValue={(editingArticle as any).seriesId ?? ' '}>
                      <SelectTrigger className="w-full mt-1">
                        <SelectValue placeholder="No series" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value=" ">No series</SelectItem>
                        {allSeries.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Series Order</label>
                    <Input type="number" name="seriesOrder" min={1} defaultValue={(editingArticle as any).seriesOrder ?? ''} placeholder="e.g., 1" className="mt-1" />
                  </div>
                  <div className="flex items-center gap-2 col-span-full">
                    <input type="checkbox" name="hasInteractiveEnv" id="edit-interactive" defaultChecked={(editingArticle as any).hasInteractiveEnv ?? false} className="rounded" />
                    <label htmlFor="edit-interactive" className="text-sm text-foreground">Has Interactive Code Playground</label>
                  </div>
                  <div className="col-span-full">
                    <label className="text-xs font-medium text-muted-foreground">Clonable Blueprint (JSON)</label>
                    <Textarea name="clonableBlueprint" rows={3} defaultValue={(editingArticle as any).clonableBlueprint ? JSON.stringify((editingArticle as any).clonableBlueprint, null, 2) : ''} placeholder='{"title": "...", "milestones": [...]}' className="mt-1 font-mono text-xs" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Publish Date</label>
                    <Input type="datetime-local" name="publishedAt" defaultValue={(editingArticle as any).publishedAt ? new Date((editingArticle as any).publishedAt).toISOString().slice(0, 16) : ''} className="mt-1" />
                    <p className="text-xs text-muted-foreground mt-1">Leave blank to publish immediately.</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Author Override</label>
                    <Input type="text" name="authorOverride" defaultValue={(editingArticle as any).authorOverride ?? ''} placeholder="Guest author name (optional)" className="mt-1" />
                  </div>
                </div>
              </details>

              {updateState?.error && typeof updateState.error === 'string' && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {updateState.error}
                  </AlertDescription>
                </Alert>
              )}

              {updateState?.error && typeof updateState.error === 'object' && !updateState.error.content && (
                <div className="text-xs text-destructive mt-2 space-y-1">
                  {Object.entries(updateState.error).map(([field, errors]) => (
                    <p key={field}>{field}: {Array.isArray(errors) ? errors.join(', ') : errors}</p>
                  ))}
                </div>
              )}

              <DialogFooter className="mt-6 sticky bottom-0 bg-background py-4 border-t border-border">
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