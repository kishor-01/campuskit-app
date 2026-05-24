// src/app/admin/forge/[slug]/ForgeInspector.tsx
// Admin Graph Forge — Right-hand Inspector Panel (Node Data + Arsenal Manager)
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Save, Trash2, Loader2, BookOpen, Zap, Trophy, SlidersHorizontal,
  Link2, Plus, Crown, GraduationCap, Book, Wrench, FileText, X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  updateLearningNodeDataAction,
  deleteLearningNodeAction,
  createAffiliateResourceAction,
  deleteAffiliateResourceAction,
} from '@/actions/forgeActions';
import type { ForgeNodeData } from './ForgeCanvas';
import type { AffiliateResourceItem } from '@/app/roadmaps/[slug]/ConstellationCanvas';

// ─── Constants ────────────────────────────────────────────────────────────────
const NODE_TYPES = [
  { value: 'concept',   label: 'Concept',   icon: BookOpen, color: 'text-violet-400' },
  { value: 'practice',  label: 'Practice',  icon: Zap,      color: 'text-amber-400'  },
  { value: 'milestone', label: 'Milestone', icon: Trophy,   color: 'text-emerald-400'},
] as const;

const RESOURCE_TYPES = ['COURSE', 'BOOK', 'TOOL', 'ARTICLE'] as const;
type ResourceType = typeof RESOURCE_TYPES[number];

const RESOURCE_TYPE_META: Record<ResourceType, { icon: React.ElementType; color: string }> = {
  COURSE:  { icon: GraduationCap, color: 'text-violet-400' },
  BOOK:    { icon: Book,          color: 'text-amber-400'  },
  TOOL:    { icon: Wrench,        color: 'text-cyan-400'   },
  ARTICLE: { icon: FileText,      color: 'text-emerald-400'},
};

type InspectorTab = 'node' | 'arsenal';

interface ForgeInspectorProps {
  node: ForgeNodeData | null;
  slug: string;
  /** Resources pre-fetched for the selected node */
  resources: AffiliateResourceItem[];
  onNodeUpdate: (updated: ForgeNodeData) => void;
  onNodeDelete: (nodeId: string) => void;
  /** Called after resource add/delete so parent can refresh resources list */
  onResourcesChange: (nodeId: string) => void;
}

// ─── Resource List Item ───────────────────────────────────────────────────────
function ResourceListItem({
  resource,
  slug,
  onDelete,
}: {
  resource: AffiliateResourceItem;
  slug: string;
  onDelete: (id: string) => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const meta = RESOURCE_TYPE_META[resource.type];
  const Icon = meta.icon;

  const handleDelete = async () => {
    if (!confirm(`Delete "${resource.title}"?`)) return;
    setIsDeleting(true);
    const result = await deleteAffiliateResourceAction(resource.id, slug);
    if (result.success) {
      onDelete(resource.id);
      toast.success('Resource removed');
    } else {
      toast.error('Failed to delete');
    }
    setIsDeleting(false);
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-800/60 bg-slate-900/40 group">
      <div className={`w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5`}>
        <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className={`text-[9px] font-bold uppercase tracking-widest ${meta.color}`}>
            {resource.type}
          </span>
          {resource.isPremium && (
            <span className="flex items-center gap-0.5 text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/20">
              <Crown className="w-2.5 h-2.5" /> Premium
            </span>
          )}
        </div>
        <p className="text-xs font-semibold text-slate-300 leading-tight truncate">{resource.title}</p>
        <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-1 mt-0.5">{resource.description}</p>
      </div>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center
          text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200
          opacity-0 group-hover:opacity-100 disabled:opacity-40"
        aria-label="Delete resource"
      >
        {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
      </button>
    </div>
  );
}

// ─── Main Inspector ───────────────────────────────────────────────────────────
export default function ForgeInspector({
  node,
  slug,
  resources,
  onNodeUpdate,
  onNodeDelete,
  onResourcesChange,
}: ForgeInspectorProps) {
  // ── Node editing state ─────────────────────────────────────────────────
  const [tab, setTab] = useState<InspectorTab>('node');
  const [title, setTitle] = useState('');
  const [type, setType] = useState('concept');
  const [briefing, setBriefing] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // ── Arsenal form state ─────────────────────────────────────────────────
  const [showAddForm, setShowAddForm] = useState(false);
  const [resTitle, setResTitle] = useState('');
  const [resDesc, setResDesc] = useState('');
  const [resUrl, setResUrl] = useState('');
  const [resType, setResType] = useState<ResourceType>('COURSE');
  const [resPremium, setResPremium] = useState(false);
  const [isAddingResource, setIsAddingResource] = useState(false);
  const [localResources, setLocalResources] = useState<AffiliateResourceItem[]>([]);

  // Sync node fields
  useEffect(() => {
    if (!node) return;
    setTitle(node.title);
    setType(node.type);
    setBriefing(node.briefing);
    setIsDirty(false);
    setTab('node');
    setShowAddForm(false);
  }, [node?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync resources from parent
  useEffect(() => {
    setLocalResources(resources);
  }, [resources]);

  const markDirty = useCallback(() => setIsDirty(true), []);

  // ── Save node data ─────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!node || isSaving) return;
    setIsSaving(true);
    try {
      const result = await updateLearningNodeDataAction(node.id, slug, {
        title: title.trim() || 'Untitled',
        type,
        briefing,
      });
      if (!result.success) throw new Error();
      onNodeUpdate({ ...node, title: title.trim() || 'Untitled', type, briefing });
      setIsDirty(false);
      toast.success('Node updated');
    } catch {
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  }, [node, isSaving, title, type, briefing, slug, onNodeUpdate]);

  // ── Delete node ────────────────────────────────────────────────────────
  const handleDelete = useCallback(async () => {
    if (!node || isDeleting) return;
    if (!confirm(`Delete "${node.title}"? All connected edges will also be removed.`)) return;
    setIsDeleting(true);
    try {
      const result = await deleteLearningNodeAction(node.id, slug);
      if (!result.success) throw new Error();
      onNodeDelete(node.id);
      toast.success('Node deleted');
    } catch {
      toast.error('Failed to delete node');
    } finally {
      setIsDeleting(false);
    }
  }, [node, isDeleting, slug, onNodeDelete]);

  // ── Add affiliate resource ─────────────────────────────────────────────
  const handleAddResource = useCallback(async () => {
    if (!node || isAddingResource) return;
    if (!resTitle.trim() || !resUrl.trim()) {
      toast.error('Title and URL are required');
      return;
    }
    setIsAddingResource(true);
    try {
      const result = await createAffiliateResourceAction({
        nodeId: node.id,
        slug,
        title: resTitle.trim(),
        description: resDesc.trim(),
        url: resUrl.trim(),
        type: resType,
        isPremium: resPremium,
      });
      if (!result.success || !result.resource) throw new Error();

      const newResource: AffiliateResourceItem = {
        id: result.resource.id,
        title: result.resource.title,
        description: result.resource.description,
        url: result.resource.url,
        type: result.resource.type as ResourceType,
        isPremium: result.resource.isPremium,
      };
      setLocalResources((prev) => [...prev, newResource]);
      onResourcesChange(node.id);

      // Reset form
      setResTitle(''); setResDesc(''); setResUrl('');
      setResType('COURSE'); setResPremium(false);
      setShowAddForm(false);
      toast.success('Resource added to Arsenal');
    } catch {
      toast.error('Failed to add resource');
    } finally {
      setIsAddingResource(false);
    }
  }, [node, isAddingResource, resTitle, resDesc, resUrl, resType, resPremium, slug, onResourcesChange]);

  // ── Delete resource (local update) ────────────────────────────────────
  const handleDeleteResource = useCallback((resourceId: string) => {
    setLocalResources((prev) => prev.filter((r) => r.id !== resourceId));
    if (node) onResourcesChange(node.id);
  }, [node, onResourcesChange]);

  const isOpen = node !== null;

  return (
    <div
      className={`absolute right-0 top-0 h-full w-full sm:w-[360px] z-20
        bg-slate-950 border-l border-slate-800/80 shadow-2xl flex flex-col
        transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      {node ? (
        <>
          {/* ── Header ──────────────────────────────────────────────── */}
          <div className="flex-shrink-0 px-5 py-4 border-b border-slate-800/60 bg-slate-900/40">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center">
                <SlidersHorizontal className="w-3.5 h-3.5 text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Inspector</p>
                <p className="text-xs font-semibold text-slate-300 truncate">{node.title || 'Untitled Node'}</p>
              </div>
              {isDirty && (
                <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full animate-pulse">
                  UNSAVED
                </span>
              )}
            </div>

            {/* Tab strip */}
            <div className="flex gap-1 bg-slate-900/60 p-1 rounded-lg">
              {([['node', 'Node Data'], ['arsenal', `Arsenal (${localResources.length})`]] as const).map(([t, label]) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all duration-200
                    ${tab === t
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-300'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Tab Content ─────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto min-h-0">

            {/* NODE DATA TAB */}
            {tab === 'node' && (
              <div className="p-5 space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5">
                    Node ID
                  </label>
                  <p className="text-[10px] font-mono text-slate-600 bg-slate-900/50 rounded-lg px-3 py-2 border border-slate-800/60 select-all truncate">
                    {node.id}
                  </p>
                </div>

                <div>
                  <label htmlFor="forge-node-title" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Title
                  </label>
                  <input
                    id="forge-node-title"
                    type="text"
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); markDirty(); }}
                    placeholder="e.g. React Fiber Internals"
                    className="w-full rounded-xl border border-slate-800/60 bg-slate-900/50 px-3 py-2.5
                      text-sm text-slate-200 placeholder-slate-600
                      focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Node Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {NODE_TYPES.map(({ value, label, icon: Icon, color }) => (
                      <button
                        key={value}
                        onClick={() => { setType(value); markDirty(); }}
                        className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border text-center transition-all duration-200
                          ${type === value
                            ? `${color} border-current bg-current/10`
                            : 'text-slate-500 border-slate-800/60 bg-slate-900/40 hover:border-slate-700 hover:text-slate-400'
                          }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wide">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="forge-node-briefing" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Tactical Briefing
                  </label>
                  <textarea
                    id="forge-node-briefing"
                    value={briefing}
                    onChange={(e) => { setBriefing(e.target.value); markDirty(); }}
                    rows={7}
                    placeholder="Describe what this node covers..."
                    className="w-full resize-none rounded-xl border border-slate-800/60 bg-slate-900/50
                      px-3 py-2.5 text-sm text-slate-300 placeholder-slate-600 leading-relaxed
                      focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40
                      transition-all font-mono text-[13px]"
                    spellCheck={false}
                  />
                  <p className="text-[10px] text-slate-600 mt-1.5">{briefing.length} chars</p>
                </div>
              </div>
            )}

            {/* ARSENAL TAB */}
            {tab === 'arsenal' && (
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Affiliate Resources
                  </p>
                  <button
                    onClick={() => setShowAddForm((v) => !v)}
                    className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all duration-200
                      ${showAddForm
                        ? 'bg-slate-800 text-slate-400'
                        : 'bg-violet-600/20 text-violet-400 border border-violet-500/30 hover:bg-violet-600/30'
                      }`}
                  >
                    <Plus className="w-3 h-3" />
                    {showAddForm ? 'Cancel' : 'Add'}
                  </button>
                </div>

                {/* Add Resource Form */}
                {showAddForm && (
                  <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 space-y-3">
                    <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest mb-1">New Resource</p>

                    <input
                      type="text"
                      value={resTitle}
                      onChange={(e) => setResTitle(e.target.value)}
                      placeholder="Resource Title *"
                      className="w-full rounded-lg border border-slate-800/60 bg-slate-900/60 px-3 py-2
                        text-xs text-slate-200 placeholder-slate-600
                        focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all"
                    />
                    <textarea
                      value={resDesc}
                      onChange={(e) => setResDesc(e.target.value)}
                      placeholder="Brief description..."
                      rows={2}
                      className="w-full resize-none rounded-lg border border-slate-800/60 bg-slate-900/60 px-3 py-2
                        text-xs text-slate-300 placeholder-slate-600 leading-relaxed
                        focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all"
                    />
                    <div className="flex items-center gap-2">
                      <Link2 className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <input
                        type="url"
                        value={resUrl}
                        onChange={(e) => setResUrl(e.target.value)}
                        placeholder="https://... *"
                        className="flex-1 rounded-lg border border-slate-800/60 bg-slate-900/60 px-3 py-2
                          text-xs text-slate-200 placeholder-slate-600
                          focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all"
                      />
                    </div>

                    {/* Type + Premium */}
                    <div className="flex items-center gap-2">
                      <select
                        value={resType}
                        onChange={(e) => setResType(e.target.value as ResourceType)}
                        className="flex-1 rounded-lg border border-slate-800/60 bg-slate-900/60 px-2 py-2
                          text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                      >
                        {RESOURCE_TYPES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <label className="flex items-center gap-1.5 cursor-pointer select-none">
                        <div
                          onClick={() => setResPremium((v) => !v)}
                          className={`w-9 h-5 rounded-full relative transition-colors duration-200 ${resPremium ? 'bg-amber-500' : 'bg-slate-700'}`}
                        >
                          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${resPremium ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Premium</span>
                      </label>
                    </div>

                    <button
                      onClick={handleAddResource}
                      disabled={isAddingResource}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                        font-bold text-xs text-white bg-violet-600 hover:bg-violet-500
                        transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAddingResource ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Adding...</>
                      ) : (
                        <><Plus className="w-3.5 h-3.5" /> Add to Arsenal</>
                      )}
                    </button>
                  </div>
                )}

                {/* Existing resources */}
                {localResources.length > 0 ? (
                  <div className="space-y-2">
                    {localResources.map((r) => (
                      <ResourceListItem
                        key={r.id}
                        resource={r}
                        slug={slug}
                        onDelete={handleDeleteResource}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-3">
                      <Link2 className="w-4 h-4 text-slate-600" />
                    </div>
                    <p className="text-xs font-semibold text-slate-500">No resources yet</p>
                    <p className="text-[10px] text-slate-600 mt-1">Click "Add" to attach affiliate links to this node.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Action Strip (node tab only) ─────────────────────────── */}
          {tab === 'node' && (
            <div className="flex-shrink-0 p-4 border-t border-slate-800/60 bg-slate-950/60 space-y-2.5">
              <button
                onClick={handleSave}
                disabled={isSaving || !isDirty}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl
                  font-bold text-sm text-white transition-all duration-200
                  bg-gradient-to-r from-violet-600 to-indigo-600
                  hover:from-violet-500 hover:to-indigo-500
                  hover:shadow-[0_0_20px_rgba(139,92,246,0.35)]
                  active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="w-4 h-4" /> Save Changes</>
                )}
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl
                  font-semibold text-sm text-red-400 transition-all duration-200
                  border border-red-500/20 bg-red-500/5
                  hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-300
                  active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</>
                ) : (
                  <><Trash2 className="w-4 h-4" /> Delete Node</>
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center h-full text-center px-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
            <SlidersHorizontal className="w-5 h-5 text-slate-600" />
          </div>
          <p className="text-sm font-semibold text-slate-500">No Node Selected</p>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed max-w-[200px]">
            Click any node on the canvas to inspect and edit its properties.
          </p>
        </div>
      )}
    </div>
  );
}
