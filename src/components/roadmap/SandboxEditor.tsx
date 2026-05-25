// src/components/roadmap/SandboxEditor.tsx
// TipTap rich-text editor for the Node Sandbox — Notion-lite note-taking experience
'use client';

import React, { useEffect, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Italic,
  Code,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Minus,
  SquareCode,
} from 'lucide-react';
import { saveNodeNoteAction } from '@/actions/nodeNoteActions';

// ─── Types ────────────────────────────────────────────────────────────────────
type SaveState = 'idle' | 'saving' | 'saved' | 'error';

interface SandboxEditorProps {
  nodeId: string;
  nodeTitle: string;
  initialContent: string; // HTML string (empty string if no note yet)
  onSaveStateChange: (state: SaveState) => void;
}

// ─── Toolbar Button ────────────────────────────────────────────────────────────
function ToolbarBtn({
  onClick,
  isActive,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        // Prevent editor blur on toolbar click
        e.preventDefault();
        onClick();
      }}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={[
        'flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold transition-all duration-150 select-none',
        isActive
          ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
          : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent',
        'disabled:opacity-30 disabled:cursor-not-allowed',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
function ToolbarDivider() {
  return <div className="w-px h-4 bg-slate-800 mx-0.5 flex-shrink-0" />;
}

// ─── Main Editor ──────────────────────────────────────────────────────────────
export default function SandboxEditor({
  nodeId,
  nodeTitle,
  initialContent,
  onSaveStateChange,
}: SandboxEditorProps) {
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentNodeId = useRef(nodeId);

  // ── Debounced cloud save ───────────────────────────────────────────────────
  const triggerSave = useCallback(
    (html: string) => {
      onSaveStateChange('saving');
      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      debounceTimer.current = setTimeout(async () => {
        const result = await saveNodeNoteAction(currentNodeId.current, html);
        if (result.error) {
          onSaveStateChange('error');
        } else {
          onSaveStateChange('saved');
          setTimeout(() => onSaveStateChange('idle'), 2000);
        }
      }, 1000);
    },
    [onSaveStateChange]
  );

  // ── TipTap editor instance ─────────────────────────────────────────────────
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // CodeBlock is included via StarterKit
        codeBlock: {
          HTMLAttributes: {
            class: 'not-prose bg-slate-800/80 text-violet-300 rounded-lg px-3 py-2 text-xs font-mono my-2 overflow-x-auto',
          },
        },
        heading: { levels: [1, 2] },
        bulletList: {
          HTMLAttributes: { class: 'list-disc pl-4' },
        },
        orderedList: {
          HTMLAttributes: { class: 'list-decimal pl-4' },
        },
      }),
      Placeholder.configure({
        placeholder: `Draft your insights for "${nodeTitle}"...\n\nJot down key insights, code snippets, questions, or links. Your notes sync automatically.`,
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: initialContent || '',
    editorProps: {
      attributes: {
        class: [
          'outline-none min-h-[260px] max-h-[400px] overflow-y-auto',
          'prose prose-invert prose-sm max-w-none',
          'prose-headings:text-slate-200 prose-headings:font-bold prose-headings:mt-3 prose-headings:mb-1',
          'prose-h1:text-base prose-h2:text-sm',
          'prose-p:text-slate-300 prose-p:leading-relaxed prose-p:my-1',
          'prose-strong:text-slate-100',
          'prose-em:text-slate-300',
          'prose-code:text-violet-300 prose-code:bg-violet-500/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:before:content-none prose-code:after:content-none',
          'prose-li:text-slate-300 prose-li:my-0.5',
          'prose-ul:my-1.5 prose-ol:my-1.5',
          'prose-pre:bg-transparent prose-pre:p-0 prose-pre:my-0',
        ].join(' '),
      },
    },
    onUpdate: ({ editor }) => {
      triggerSave(editor.getHTML());
    },
    immediatelyRender: false,
  });

  // ── Sync content when node changes (new node selected) ─────────────────────
  useEffect(() => {
    if (!editor) return;
    if (nodeId !== currentNodeId.current) {
      currentNodeId.current = nodeId;
      // Replace editor content; suppress save notification by checking nodeId guard in triggerSave
      editor.commands.setContent(initialContent || '');
    }
  }, [nodeId, initialContent, editor]);

  // ── Cleanup debounce on unmount ────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  if (!editor) return null;

  return (
    <div className="flex flex-col rounded-xl border border-slate-800/60 bg-slate-900/40 overflow-hidden focus-within:ring-2 focus-within:ring-violet-500/30 focus-within:border-violet-500/30 transition-all">

      {/* ── Toolbar ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-slate-800/60 bg-slate-950/40 flex-wrap">

        {/* Text formatting */}
        <ToolbarBtn
          title="Bold (Ctrl+B)"
          isActive={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          title="Italic (Ctrl+I)"
          isActive={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          title="Inline Code"
          isActive={editor.isActive('code')}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <Code className="w-3.5 h-3.5" />
        </ToolbarBtn>

        <ToolbarDivider />

        {/* Headings */}
        <ToolbarBtn
          title="Heading 1"
          isActive={editor.isActive('heading', { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          title="Heading 2"
          isActive={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="w-3.5 h-3.5" />
        </ToolbarBtn>

        <ToolbarDivider />

        {/* Lists */}
        <ToolbarBtn
          title="Bullet List"
          isActive={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          title="Numbered List"
          isActive={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </ToolbarBtn>

        <ToolbarDivider />

        {/* Code block */}
        <ToolbarBtn
          title="Code Block"
          isActive={editor.isActive('codeBlock')}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <SquareCode className="w-3.5 h-3.5" />
        </ToolbarBtn>

        {/* Horizontal rule */}
        <ToolbarBtn
          title="Divider Line"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus className="w-3.5 h-3.5" />
        </ToolbarBtn>
      </div>

      {/* ── Editor Surface ────────────────────────────────────────────────── */}
      <EditorContent
        editor={editor}
        className="flex-1 px-4 py-3 cursor-text"
      />
    </div>
  );
}
