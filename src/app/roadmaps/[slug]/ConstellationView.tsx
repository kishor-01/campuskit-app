// src/app/roadmaps/[slug]/ConstellationView.tsx
// Client wrapper that owns the selected-node state and mounts the NodeDrawer
'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import ConstellationCanvas, {
  type ConstellationNode,
  type ConstellationEdge,
} from './ConstellationCanvas';
import MobileMatrix from './MobileMatrix';
import NodeDrawer from './NodeDrawer';

interface ConstellationViewProps {
  nodes: ConstellationNode[];
  edges: ConstellationEdge[];
  roadmapTitle: string;
  roadmapId: string;
  /** nodeId → saved note content (from DB) */
  noteContentMap: Record<string, string>;
}

export default function ConstellationView({
  nodes,
  edges,
  roadmapTitle,
  roadmapId,
  noteContentMap,
}: ConstellationViewProps) {
  const [selectedNode, setSelectedNode] = useState<ConstellationNode | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const autoOpenFired = useRef(false);
  const searchParams = useSearchParams();

  // Viewport Gating (Client-side)
  useEffect(() => {
    setMounted(true);
    const mql = window.matchMedia('(max-width: 767px)');
    setIsMobile(mql.matches);

    const handleResize = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handleResize);
    return () => mql.removeEventListener('change', handleResize);
  }, []);

  // Auto-Open Hook: read ?nodeId= and slide open the drawer on mount
  useEffect(() => {
    if (!mounted || autoOpenFired.current) return;
    const nodeId = searchParams.get('nodeId');
    if (!nodeId) return;
    const target = nodes.find((n) => n.id === nodeId);
    if (target && target.status !== 'LOCKED') {
      setSelectedNode(target);
      autoOpenFired.current = true;
    }
  }, [mounted, searchParams, nodes]);

  const handleNodeSelect = useCallback((node: ConstellationNode) => {
    setSelectedNode(node);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Prevent hydration mismatch by not rendering the graph until mounted
  if (!mounted) return null;

  return (
    <>
      {isMobile ? (
        <MobileMatrix
          nodes={nodes}
          edges={edges}
          onNodeSelect={handleNodeSelect}
        />
      ) : (
        <ConstellationCanvas
          nodes={nodes}
          edges={edges}
          roadmapTitle={roadmapTitle}
          onNodeSelect={handleNodeSelect}
          onDeselect={handleClose}
        />
      )}

      {/* Sliding node detail drawer / bottom sheet */}
      <NodeDrawer
        node={selectedNode}
        roadmapId={roadmapId}
        initialNote={selectedNode ? (noteContentMap[selectedNode.id] ?? '') : ''}
        onClose={handleClose}
      />
    </>
  );
}
