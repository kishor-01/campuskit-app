// src/app/admin/forge/[slug]/ForgeSettings.tsx
// Admin Graph Forge — Roadmap Settings Modal (contextual metadata editor)
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Settings, X, Loader2, Save, Users, Clock, Target, BookOpen } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { updateRoadmapMetadataAction } from '@/actions/forgeActions';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface RoadmapMeta {
  id: string;
  slug: string;
  title: string;
  description: string;
  targetAudience: string | null;
  prerequisiteText: string | null;
  estimatedTime: string | null;
  outcomes: string | null;
}

interface ForgeSettingsProps {
  roadmap: RoadmapMeta;
}

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({
  label,
  icon: Icon,
  hint,
  children,
}: {
  label: string;
  icon: React.ElementType;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Icon className="w-3 h-3 text-slate-500" />
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {label}
        </label>
      </div>
      {children}
      {hint && <p className="text-[9px] text-slate-600">{hint}</p>}
    </div>
  );
}

const inputCls = `w-full rounded-xl border border-slate-800/60 bg-slate-900/60 px-3 py-2.5
  text-sm text-slate-200 placeholder-slate-600 leading-relaxed
  focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40
  transition-all`;

const textareaCls = `${inputCls} resize-none`;

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ForgeSettings({ roadmap }: ForgeSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState(roadmap.title);
  const [description, setDescription] = useState(roadmap.description);
  const [targetAudience, setTargetAudience] = useState(roadmap.targetAudience ?? '');
  const [prerequisiteText, setPrerequisiteText] = useState(roadmap.prerequisiteText ?? '');
  const [estimatedTime, setEstimatedTime] = useState(roadmap.estimatedTime ?? '');
  const [outcomes, setOutcomes] = useState(roadmap.outcomes ?? '');

  // Reset when dialog reopened with fresh props
  useEffect(() => {
    if (isOpen) {
      setTitle(roadmap.title);
      setDescription(roadmap.description);
      setTargetAudience(roadmap.targetAudience ?? '');
      setPrerequisiteText(roadmap.prerequisiteText ?? '');
      setEstimatedTime(roadmap.estimatedTime ?? '');
      setOutcomes(roadmap.outcomes ?? '');
    }
  }, [isOpen, roadmap]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setIsOpen(false);
  }, []);

  const handleSave = useCallback(async () => {
    if (!title.trim()) { toast.error('Title is required'); return; }
    setIsSaving(true);
    try {
      const result = await updateRoadmapMetadataAction(roadmap.id, roadmap.slug, {
        title, description, targetAudience, prerequisiteText, estimatedTime, outcomes,
      });
      if (!result.success) throw new Error((result as any).error ?? 'Save failed');
      toast.success('Roadmap settings saved');
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  }, [roadmap.id, roadmap.slug, title, description, targetAudience, prerequisiteText, estimatedTime, outcomes]);

  return (
    <>
      {/* ── Trigger Button (slots into the Forge header) ─────────────────── */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg
          bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200
          transition-all duration-200 shadow-sm"
        id="forge-settings-btn"
        title="Roadmap Settings"
      >
        <Settings className="w-4 h-4 text-slate-400 group-hover:text-slate-300" />
        Settings
      </button>

      {/* ── Modal ─────────────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
          onKeyDown={handleKeyDown}
        >
          <div className="w-full max-w-xl rounded-2xl border border-slate-800/80 bg-slate-950 shadow-2xl shadow-violet-500/10 flex flex-col overflow-hidden max-h-[90vh]">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                  <Settings className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200">Roadmap Settings</p>
                  <p className="text-[10px] text-slate-500">Context metadata for the AI Co-Pilot & learner display</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto min-h-0 p-5 space-y-5">

              {/* Section: Core Info */}
              <div className="space-y-4">
                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Core Info</p>

                <Field label="Title" icon={BookOpen}>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={inputCls}
                    placeholder="e.g. Modern Frontend Engineering"
                  />
                </Field>

                <Field label="Description" icon={BookOpen}>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className={textareaCls}
                    placeholder="A brief public description of what this roadmap covers."
                  />
                </Field>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-800/60" />

              {/* Section: AI Context */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">AI Co-Pilot Context</p>
                  <span className="text-[9px] bg-violet-500/10 text-violet-400 border border-violet-500/20 px-1.5 py-0.5 rounded-full font-bold">
                    Powers Macro Generator
                  </span>
                </div>

                <Field
                  label="Target Audience"
                  icon={Users}
                  hint="The AI uses this to calibrate node depth and vocabulary."
                >
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className={inputCls}
                    placeholder="e.g. Intermediate Frontend Developers with 1–2 years React experience"
                  />
                </Field>

                <Field
                  label="Prerequisites"
                  icon={BookOpen}
                  hint="Tells the AI what knowledge to assume. Shown to learners before starting."
                >
                  <input
                    type="text"
                    value={prerequisiteText}
                    onChange={(e) => setPrerequisiteText(e.target.value)}
                    className={inputCls}
                    placeholder="e.g. Basic React, HTML, CSS, JavaScript ES6+"
                  />
                </Field>

                <Field
                  label="Estimated Time"
                  icon={Clock}
                  hint="Displayed as a badge on the public roadmap card."
                >
                  <input
                    type="text"
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(e.target.value)}
                    className={inputCls}
                    placeholder="e.g. 4 Weeks · 8–10 hrs/week"
                  />
                </Field>

                <Field
                  label="Outcomes"
                  icon={Target}
                  hint="The AI aligns node content to achieve these outcomes."
                >
                  <textarea
                    value={outcomes}
                    onChange={(e) => setOutcomes(e.target.value)}
                    rows={3}
                    className={textareaCls}
                    placeholder="e.g. Master React Server Components, build a full-stack Next.js 15 app, understand streaming & Suspense."
                  />
                </Field>
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 px-5 pb-5 pt-3 border-t border-slate-800/60 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 border border-slate-800
                  hover:border-slate-700 hover:text-slate-200 transition-all disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !title.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white
                  bg-gradient-to-r from-violet-600 to-indigo-600
                  hover:from-violet-500 hover:to-indigo-500
                  hover:shadow-[0_0_16px_rgba(139,92,246,0.35)]
                  active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSaving
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                  : <><Save className="w-4 h-4" /> Save Settings</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
