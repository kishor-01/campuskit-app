// src/app/roadmaps/[slug]/NodeDrawer.tsx
// Constellation Engine — Sliding Side-Panel Drawer for V2 Skill Nodes (Phase 3)
'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  X,
  BookOpen,
  Zap,
  Trophy,
  Lock,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  GraduationCap,
  Book,
  Wrench,
  FileText,
  ExternalLink,
  Crown,
  CloudUpload,
  Cloud,
} from 'lucide-react';
import { completeNodeAction } from '@/actions/nodeProgressActions';
import SandboxEditor from '@/components/roadmap/SandboxEditor';
import type { ConstellationNode, AffiliateResourceItem } from './ConstellationCanvas';
import type { NodeStatus } from '@/lib/graphEngine';

// ─── Tabs ──────────────────────────────────────────────────────────────────────
const TABS = ['Briefing', 'Arsenal', 'Sandbox'] as const;
type Tab = (typeof TABS)[number];

// ─── Save indicator state ─────────────────────────────────────────────────────
type SaveState = 'idle' | 'saving' | 'saved' | 'error';

// ─── Type metadata ────────────────────────────────────────────────────────────
const TYPE_META = {
  concept: {
    icon: BookOpen,
    label: 'Concept',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
  },
  practice: {
    icon: Zap,
    label: 'Practice',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  milestone: {
    icon: Trophy,
    label: 'Milestone',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
} as const;

const STATUS_META: Record<NodeStatus, { icon: React.ElementType; label: string }> = {
  LOCKED:    { icon: Lock,          label: 'Locked'    },
  UNLOCKED:  { icon: Zap,           label: 'Unlocked'  },
  COMPLETED: { icon: CheckCircle2,  label: 'Completed' },
};

// ─── Affiliate resource type → icon ──────────────────────────────────────────
const RESOURCE_TYPE_ICON: Record<AffiliateResourceItem['type'], React.ElementType> = {
  COURSE:  GraduationCap,
  BOOK:    Book,
  TOOL:    Wrench,
  ARTICLE: FileText,
};

const RESOURCE_TYPE_COLOR: Record<AffiliateResourceItem['type'], string> = {
  COURSE:  'text-violet-400 bg-violet-500/10 border-violet-500/20',
  BOOK:    'text-amber-400  bg-amber-500/10  border-amber-500/20',
  TOOL:    'text-cyan-400   bg-cyan-500/10   border-cyan-500/20',
  ARTICLE: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
};

// ─── Premium Resource Card ────────────────────────────────────────────────────
function PremiumResourceCard({ resource }: { resource: AffiliateResourceItem }) {
  const TypeIcon = RESOURCE_TYPE_ICON[resource.type];
  const colorClass = RESOURCE_TYPE_COLOR[resource.type];

  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col gap-3 rounded-xl border border-slate-700/50
        bg-slate-900/50 p-4 transition-all duration-200
        hover:border-violet-500/40 hover:bg-slate-900/80 hover:shadow-lg
        hover:shadow-violet-500/5 focus:outline-none focus-visible:ring-2
        focus-visible:ring-violet-500"
    >
      {/* Premium badge */}
      {resource.isPremium && (
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5
          rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
          <Crown className="w-2.5 h-2.5" />
          <span className="text-[9px] font-bold tracking-widest uppercase">Premium</span>
        </div>
      )}

      {/* Type badge + icon */}
      <div className="flex items-center gap-2.5">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${colorClass}`}>
          <TypeIcon className="w-4 h-4" />
        </div>
        <span className={`text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border ${colorClass}`}>
          {resource.type}
        </span>
      </div>

      {/* Title */}
      <p className="text-sm font-bold text-slate-100 leading-snug group-hover:text-violet-300 transition-colors pr-10">
        {resource.title}
      </p>

      {/* Description */}
      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
        {resource.description}
      </p>

      {/* CTA */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-400 group-hover:text-violet-300 transition-colors mt-auto pt-1">
        <span>Open Resource</span>
        <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </div>
    </a>
  );
}

// ─── Arsenal Empty State ──────────────────────────────────────────────────────
function ArsenalEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center mb-4">
        <ShieldCheck className="w-6 h-6 text-slate-600" />
      </div>
      <p className="text-sm font-semibold text-slate-500 mb-1">No Arsenal Yet</p>
      <p className="text-xs text-slate-600 max-w-[200px] leading-relaxed">
        Curated resources for this node are being assembled by the team.
      </p>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface NodeDrawerProps {
  node: ConstellationNode | null;
  roadmapId: string;
  /** Pre-loaded note content from DB (empty string if none) */
  initialNote: string;
  onClose: () => void;
}

// ─── Main Drawer ──────────────────────────────────────────────────────────────
export default function NodeDrawer({ node, roadmapId, initialNote, onClose }: NodeDrawerProps) {
  const [activeTab, setActiveTab] = useState<Tab>('Briefing');
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [isCompleting, setIsCompleting] = useState(false);
  const currentNodeId = useRef<string | null>(null);

  // ── Sync note content when node changes ──────────────────────────────────
  useEffect(() => {
    if (!node) return;
    if (node.id !== currentNodeId.current) {
      currentNodeId.current = node.id;
      setSaveState('idle');
      setActiveTab('Briefing');
    }
  }, [node, initialNote]);

  // ── Escape key to close ──────────────────────────────────────────────────
  useEffect(() => {
    if (!node) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [node, onClose]);

  // ── Complete node ────────────────────────────────────────────────────────
  const handleComplete = useCallback(async () => {
    if (!node || isCompleting) return;
    setIsCompleting(true);
    try {
      await completeNodeAction(node.id, roadmapId);
      onClose();
    } catch (e) {
      console.error('[NodeDrawer] completeNodeAction failed:', e);
    } finally {
      setIsCompleting(false);
    }
  }, [node, roadmapId, isCompleting, onClose]);

  // ── Derived display data ─────────────────────────────────────────────────
  const isOpen = node !== null;
  const typeMeta = node
    ? TYPE_META[node.type as keyof typeof TYPE_META] ?? TYPE_META.concept
    : TYPE_META.concept;
  const TypeIcon = typeMeta.icon;
  const statusMeta = node ? STATUS_META[node.status] : STATUS_META.LOCKED;
  const StatusIcon = statusMeta.icon;

  return (
    <>
      {/* ── Backdrop ─────────────────────────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-500 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── Sliding Panel / Bottom Sheet ───────────────────────────────────────── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={node?.title ?? 'Node details'}
        className={`fixed bottom-0 left-0 w-full h-[90vh] rounded-t-3xl md:rounded-none md:bottom-auto md:left-auto md:right-0 md:top-0 md:h-full md:w-[45vw] lg:w-[38vw] z-50
          bg-slate-950/95 backdrop-blur-xl md:border-l md:border-slate-800/80 border-t border-slate-800/80 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] md:shadow-2xl
          flex flex-col
          transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${isOpen ? 'translate-y-0 md:translate-x-0 md:translate-y-0' : 'translate-y-full md:translate-x-full md:translate-y-0'}`}
      >
        {node && (
          <>
            {/* ── Hero Banner ──────────────────────────────────────────── */}
            <div className="relative flex-shrink-0 px-6 pt-6 pb-5 border-b border-slate-800/60
              bg-gradient-to-br from-slate-900/80 via-slate-950 to-slate-950">
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center
                  bg-slate-800/60 hover:bg-slate-700/80 text-slate-400 hover:text-slate-100
                  transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                aria-label="Close panel"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Type icon + badges row */}
              <div className="flex items-center gap-2.5 mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${typeMeta.bg} ${typeMeta.border} border`}>
                  <TypeIcon className={`w-4 h-4 ${typeMeta.color}`} />
                </div>
                <span className={`text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border ${typeMeta.bg} ${typeMeta.color} ${typeMeta.border}`}>
                  {typeMeta.label}
                </span>

                {/* Status badge */}
                <span className={`ml-auto flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border
                  ${node.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' : ''}
                  ${node.status === 'UNLOCKED'  ? 'bg-violet-500/10  text-violet-400  border-violet-500/25 animate-pulse' : ''}
                  ${node.status === 'LOCKED'    ? 'bg-slate-800/60   text-slate-500   border-slate-700/50'  : ''}
                `}>
                  <StatusIcon className="w-3 h-3" />
                  {statusMeta.label}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-xl font-extrabold text-slate-100 tracking-tight leading-snug pr-8">
                {node.title}
              </h2>
            </div>

            {/* ── Tabs ────────────────────────────────────────────────── */}
            <div className="flex-shrink-0 flex border-b border-slate-800/60 bg-slate-950/50">
              {TABS.map((tab) => {
                const showBadge = tab === 'Arsenal' && node.affiliateResources.length > 0;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 text-xs font-bold tracking-wider uppercase transition-all duration-200
                      focus:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-violet-500
                      relative
                      ${activeTab === tab
                        ? 'text-violet-400 border-b-2 border-violet-500 bg-violet-500/5'
                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30 border-b-2 border-transparent'
                      }`}
                  >
                    {tab}
                    {showBadge && (
                      <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full
                        bg-violet-500/20 text-violet-400 text-[9px] font-bold">
                        {node.affiliateResources.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* ── Tab Content ──────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto min-h-0">

              {/* — BRIEFING TAB — */}
              {activeTab === 'Briefing' && (
                <div className="p-6 space-y-5">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                      Tactical Briefing
                    </p>
                    <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-4">
                      {node.briefing ? (
                        <div className="prose prose-invert prose-sm max-w-none
                          prose-headings:text-slate-200 prose-headings:font-bold prose-headings:mb-2 prose-headings:mt-3
                          prose-p:text-slate-300 prose-p:leading-relaxed prose-p:my-1.5
                          prose-strong:text-slate-100 prose-strong:font-semibold
                          prose-code:text-violet-300 prose-code:bg-violet-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:before:content-none prose-code:after:content-none
                          prose-li:text-slate-300 prose-li:my-0.5
                          prose-ul:my-2 prose-ol:my-2">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {node.briefing}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500 italic">No briefing available for this node.</p>
                      )}
                    </div>
                  </div>

                  {node.status === 'LOCKED' && (
                    <div className="rounded-xl border border-slate-700/40 bg-slate-900/30 p-4 flex items-start gap-3">
                      <Lock className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Complete all prerequisite nodes to unlock this objective and track your progress.
                      </p>
                    </div>
                  )}

                  {node.status === 'COMPLETED' && (
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-emerald-400/80 leading-relaxed">
                        Objective secured. This node is marked complete in your progress graph.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* — ARSENAL TAB — */}
              {activeTab === 'Arsenal' && (
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Curated Reference Arsenal
                    </p>
                    {node.affiliateResources.length > 0 && (
                      <span className="text-[10px] text-slate-600">
                        {node.affiliateResources.length} resource{node.affiliateResources.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {node.affiliateResources.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {node.affiliateResources.map((resource) => (
                        <PremiumResourceCard key={resource.id} resource={resource} />
                      ))}
                    </div>
                  ) : (
                    <ArsenalEmpty />
                  )}
                </div>
              )}

              {/* — SANDBOX TAB — */}
              {activeTab === 'Sandbox' && (
                <div className="p-6 flex flex-col gap-3">
                  <div className="flex items-center justify-between flex-shrink-0">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Study Sandbox
                    </p>
                    {/* Save state indicator */}
                    <span className={`flex items-center gap-1.5 text-[9px] font-semibold transition-all duration-300 ${
                      saveState === 'saving' ? 'text-violet-400' :
                      saveState === 'saved'  ? 'text-emerald-400' :
                      saveState === 'error'  ? 'text-red-400' :
                      'text-slate-600'
                    }`}>
                      {saveState === 'saving' && <CloudUpload className="w-3 h-3 animate-pulse" />}
                      {saveState === 'saved'  && <Cloud className="w-3 h-3" />}
                      {saveState === 'error'  && <span className="w-3 h-3 text-red-400">!</span>}
                      {saveState === 'idle'   && <Cloud className="w-3 h-3 opacity-40" />}
                      {saveState === 'saving' ? 'Saving...' :
                       saveState === 'saved'  ? 'Saved to cloud' :
                       saveState === 'error'  ? 'Save failed' :
                       'Cloud sync'}
                    </span>
                  </div>

                  {/* ✔ TipTap rich-text editor */}
                  {node && (
                    <SandboxEditor
                      nodeId={node.id}
                      nodeTitle={node.title}
                      initialContent={initialNote}
                      onSaveStateChange={setSaveState}
                    />
                  )}

                  <p className="text-[10px] text-slate-600 leading-relaxed flex-shrink-0">
                    Rich text notes — Bold, Italic, Code, Headings, Lists. Synced to your account automatically.
                  </p>
                </div>
              )}
            </div>

            {/* ── Sticky Action Strip ──────────────────────────────────── */}
            {node.status === 'UNLOCKED' && (
              <div className="flex-shrink-0 p-4 border-t border-slate-800/60 bg-slate-950/80 backdrop-blur-sm">
                <button
                  onClick={handleComplete}
                  disabled={isCompleting}
                  className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl
                    font-bold text-sm text-white transition-all duration-200
                    bg-gradient-to-r from-violet-600 to-indigo-600
                    hover:from-violet-500 hover:to-indigo-500
                    hover:shadow-[0_0_28px_rgba(139,92,246,0.4)]
                    active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                >
                  {isCompleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Securing Objective...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Secure Objective (Mark Complete)
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Close-only strip for completed/locked nodes */}
            {node.status !== 'UNLOCKED' && (
              <div className="flex-shrink-0 p-4 border-t border-slate-800/60 bg-slate-950/80">
                <button
                  onClick={onClose}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl
                    font-semibold text-sm text-slate-400 hover:text-slate-200
                    border border-slate-800 hover:border-slate-700 hover:bg-slate-900/60
                    transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                >
                  Close Panel
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
