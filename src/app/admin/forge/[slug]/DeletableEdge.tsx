// src/app/admin/forge/[slug]/DeletableEdge.tsx
// Admin Graph Forge — Custom React Flow edge with an inline delete button
'use client';

import React, { useCallback } from 'react';
import {
  getSmoothStepPath,
  EdgeLabelRenderer,
  BaseEdge,
  useReactFlow,
  type EdgeProps,
} from '@xyflow/react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { deleteLearningEdgeAction } from '@/actions/forgeActions';

// The slug prop is passed via the edge data object so the server action knows
// which roadmap to revalidate.
export default function DeletableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  data,
}: EdgeProps) {
  const { setEdges } = useReactFlow();

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const handleDelete = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      const slug = (data as any)?.slug ?? '';

      // Optimistic removal — instant 60fps feel
      setEdges((eds) => eds.filter((edge) => edge.id !== id));

      const result = await deleteLearningEdgeAction(id, slug);
      if (!result.success) {
        toast.error('Failed to delete edge');
        // Note: we don't re-add the edge on failure — the page can be refreshed
        // if needed. For UX simplicity this is acceptable for admin tooling.
      }
    },
    [id, data, setEdges]
  );

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />

      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <button
            onClick={handleDelete}
            className="
              w-4 h-4 rounded-full flex items-center justify-center
              bg-slate-900 border border-red-500/40
              text-red-400 hover:text-white hover:bg-red-600 hover:border-red-600
              opacity-0 group-hover:opacity-100
              transition-all duration-150 shadow-sm
              focus:outline-none focus:ring-1 focus:ring-red-500
            "
            aria-label="Delete edge"
            title="Delete this prerequisite edge"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
