// src/components/roadmap/StickyNoteNode.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StickyNoteNodeProps {
  data: {
    id: string;
    content: string;
    color: string;
    onDelete: () => void;
    onChange: (content: string, color: string) => void;
  };
}

const COLOR_PALETTE = [
  { name: 'yellow', bg: 'bg-[#fefec7]', border: 'border-[#fef08a]', handle: 'bg-[#fef08a]', dot: 'bg-yellow-300' },
  { name: 'blue', bg: 'bg-[#eff6ff]', border: 'border-[#bfdbfe]', handle: 'bg-[#bfdbfe]', dot: 'bg-blue-400' },
  { name: 'pink', bg: 'bg-[#fdf2f8]', border: 'border-[#fbcfe8]', handle: 'bg-[#fbcfe8]', dot: 'bg-pink-400' },
];

export default function StickyNoteNode({ data }: StickyNoteNodeProps) {
  const [content, setContent] = useState(data.content || '');
  const activeColor = COLOR_PALETTE.find((c) => c.name === data.color) || COLOR_PALETTE[0];

  // Sync content if changed from parent (e.g. database reload)
  useEffect(() => {
    setContent(data.content || '');
  }, [data.content]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setContent(text);
    data.onChange(text, data.color);
  };

  const handleColorChange = (colorName: string) => {
    data.onChange(content, colorName);
  };

  return (
    <div
      className={cn(
        "w-56 h-56 flex flex-col rounded-lg border shadow-lg overflow-hidden transition-all duration-300",
        activeColor.bg,
        activeColor.border
      )}
    >
      {/* Top drag handle */}
      <div
        className={cn(
          "custom-drag-handle h-6 flex items-center justify-between px-2 cursor-grab active:cursor-grabbing shrink-0 select-none",
          activeColor.handle
        )}
      >
        <span className="text-[9px] font-bold text-slate-800 tracking-wider uppercase opacity-60">
          Sticky Note
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            data.onDelete();
          }}
          className="text-slate-800 hover:text-red-600 transition-colors p-0.5 rounded"
          title="Delete Note"
        >
          <Trash2 size={11} />
        </button>
      </div>

      {/* Main text area */}
      <div className="flex-1 p-3">
        <textarea
          value={content}
          onChange={handleTextChange}
          placeholder="Jot down a quick thought here..."
          className="nodrag nowheel w-full h-full bg-transparent border-0 outline-none focus:outline-none focus:ring-0 resize-none text-xs font-medium text-slate-900 placeholder:text-slate-900/40 leading-relaxed"
        />
      </div>

      {/* Color selection dot controls */}
      <div className="h-7 border-t border-slate-900/5 px-3 flex items-center gap-1.5 shrink-0 bg-black/[0.02]">
        {COLOR_PALETTE.map((colorItem) => (
          <button
            key={colorItem.name}
            onClick={() => handleColorChange(colorItem.name)}
            className={cn(
              "w-3.5 h-3.5 rounded-full border border-black/10 transition-all hover:scale-110",
              colorItem.dot,
              data.color === colorItem.name ? "ring-1 ring-slate-800 scale-105" : "opacity-80"
            )}
            title={`Switch to ${colorItem.name}`}
          />
        ))}
      </div>
    </div>
  );
}
