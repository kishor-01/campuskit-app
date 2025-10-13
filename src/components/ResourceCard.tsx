// src/components/ResourceCard.tsx
'use client'

import { motion } from 'framer-motion';
import type { Prisma } from '@prisma/client';
import BookmarkButton from './BookmarkButton';
import { useSession } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';
import Modal from '@/components/admin/Modal';
import toast from 'react-hot-toast';
import { Edit, Trash2, ArrowUpRight } from 'lucide-react';

type ResourceWithCategory = Prisma.ResourceGetPayload<{
  include: { category: true }
}>;

interface ResourceCardProps {
  resource: ResourceWithCategory;
  isInitiallySaved: boolean;
}

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.36 } },
};

export default function ResourceCard({ resource, isInitiallySaved }: ResourceCardProps) {
  const { data: session } = useSession();
  const isAdmin = !!session?.user?.isAdmin;

  // admin edit modal state (admin-only)
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [form, setForm] = useState({
    name: resource.name,
    url: resource.url,
    description: resource.description,
    categoryId: (resource as any).categoryId ?? resource.category?.id ?? '',
    status: (resource as any).status ?? 'PENDING',
  });

  // description overflow detection (for fade hint)
  const descRef = useRef<HTMLDivElement | null>(null);
  const [showTopFade, setShowTopFade] = useState(false);
  const [showBottomFade, setShowBottomFade] = useState(false);

  useEffect(() => {
    const el = descRef.current;
    if (!el) return;
    const check = () => {
      setShowTopFade(el.scrollTop > 8);
      setShowBottomFade(el.scrollHeight - el.clientHeight - el.scrollTop > 8);
    };
    check();
    el.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => {
      el.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, []);

  // admin handlers: update & delete (calls API route created previously)
  async function handleSave(e?: React.FormEvent) {
    e?.preventDefault();
    try {
      const res = await fetch(`/api/admin/resources/${resource.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json?.error ?? 'Failed to update');
        console.error('update resource failed', json);
        return;
      }
      toast.success('Resource updated');
      setIsEditOpen(false);
      // refresh to reflect server state
      setTimeout(() => location.reload(), 450);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update resource');
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this resource? This cannot be undone.')) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/resources/${resource.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json?.error ?? 'Failed to delete');
        setIsDeleting(false);
        return;
      }
      toast.success('Resource deleted');
      setTimeout(() => location.reload(), 350);
    } catch (err) {
      console.error(err);
      toast.error('Delete failed');
      setIsDeleting(false);
    }
  }

  return (
    <>
      <motion.article
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ y: -6, boxShadow: "0 10px 30px rgba(16,24,40,0.08)" }}
        whileTap={{ scale: 0.995 }}
        className="h-[340px] bg-background border border-muted rounded-lg shadow-sm transition-transform duration-200 group overflow-hidden flex flex-col"
      >
        <div className="p-5 flex-1 flex flex-col min-h-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 pr-2 min-w-0">
              <a href={resource.url} target="_blank" rel="noopener noreferrer" className="block">
                <h3 className="text-lg font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {resource.name}
                </h3>
              </a>
              <div className="mt-2">
                <span className="inline-block bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap">
                  {resource.category?.name ?? 'Uncategorized'}
                </span>
              </div>
            </div>

            {/* Admin controls (only on admin pages) */}
            {isAdmin && (
              <div className="flex-shrink-0 flex items-center gap-2 ml-2">
                <button onClick={() => setIsEditOpen(true)} title="Edit" className="p-1 hover:text-blue-600">
                  <Edit size={16} />
                </button>
                <button onClick={handleDelete} title="Delete" disabled={isDeleting} className="p-1 hover:text-destructive">
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Description area (scrollable, fills available space) */}
          <div className="mt-3 relative flex-1 min-h-0">
            {/* Top fade - constrained inside description container */}
            {showTopFade && (
              <div
                className="pointer-events-none absolute left-0 right-0 top-0 h-6"
                style={{ background: "linear-gradient(to bottom, rgba(255,255,255,1), rgba(255,255,255,0))", zIndex: 10 }}
              />
            )}

            <div
              ref={descRef}
              className="text-muted-foreground text-sm overflow-auto pr-2 leading-relaxed h-full"
            >
              <div className="pb-2">
                <p className="whitespace-pre-wrap">{resource.description}</p>
              </div>
            </div>

            {/* Bottom fade */}
            {showBottomFade && (
              <div
                className="pointer-events-none absolute left-0 right-0 bottom-0 h-8"
                style={{ background: "linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0))", zIndex: 10 }}
              />
            )}
          </div>

          {/* action row - outside scroll area so always visible */}
          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground"> {/* placeholder for meta */} </div>

            <div className="flex items-center gap-3">
              <a href={resource.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                Open <ArrowUpRight size={14} />
              </a>

              {/* Bookmark for normal users only (admin should not see save) */}
              {!isAdmin && (
                <BookmarkButton
                  resourceId={resource.id}
                  isInitiallySaved={isInitiallySaved}
                  className="ml-1"
                />
              )}
            </div>
          </div>
        </div>
      </motion.article>

      {/* Admin edit modal */}
      {isAdmin && (
        <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Resource">
          <form onSubmit={handleSave}>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Resource Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full p-2 bg-input rounded-md" />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">URL</label>
                <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className="w-full p-2 bg-input rounded-md" />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Category ID</label>
                <input value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="w-full p-2 bg-input rounded-md" />
                <p className="text-xs text-muted-foreground mt-1">Category selector will be added in a follow-up for admin UX.</p>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={6} className="w-full p-2 bg-input rounded-md" />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })} className="w-full p-2 bg-input rounded-md">
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-4 border-t">
              <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md font-semibold">Save</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
