'use client';

import React, { useMemo, useCallback, useState } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import SkillNode, { SkillNodeData } from '@/components/roadmap/SkillNode';
import type { NodeStatus } from '@/lib/graphEngine';

// ─── Affiliate Resource shape (serialized from DB) ───────────────────────────
export interface AffiliateResourceItem {
  id: string;
  title: string;
  description: string;
  url: string;
  type: 'COURSE' | 'BOOK' | 'TOOL' | 'ARTICLE';
  isPremium: boolean;
}

// ─── Prop types ───────────────────────────────────────────────────────────────
export interface ConstellationNode {
  id: string;
  title: string;
  briefing: string;
  type: string;
  positionX: number;
  positionY: number;
  status: NodeStatus;
  affiliateResources: AffiliateResourceItem[];
}

export interface ConstellationEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceStatus: NodeStatus;
  targetStatus: NodeStatus;
}

interface ConstellationCanvasProps {
  nodes: ConstellationNode[];
  edges: ConstellationEdge[];
  roadmapTitle: string;
  /** Called whenever the user clicks a valid (non-locked) node */
  onNodeSelect?: (node: ConstellationNode) => void;
  /** Called when the canvas background / empty space is clicked */
  onDeselect?: () => void;
}

// ─── Node type registry ───────────────────────────────────────────────────────
const nodeTypes = { skillNode: SkillNode };

// ─── Build React Flow node/edge arrays from constellation data ────────────────
function buildFlowNodes(nodes: ConstellationNode[]): Node[] {
  return nodes.map((n) => ({
    id: n.id,
    type: 'skillNode',
    position: { x: n.positionX, y: n.positionY },
    data: {
      title: n.title,
      briefing: n.briefing,
      type: (n.type as SkillNodeData['type']) ?? 'concept',
      status: n.status,
      nodeId: n.id,
    } satisfies SkillNodeData,
    draggable: false,
  }));
}

function buildFlowEdges(edges: ConstellationEdge[]): Edge[] {
  return edges.map((e) => {
    // An edge is "active" (animated dashes) if the source is COMPLETED
    const isActive = e.sourceStatus === 'COMPLETED';
    const isLocked = e.targetStatus === 'LOCKED';

    return {
      id: e.id,
      source: e.sourceNodeId,
      target: e.targetNodeId,
      type: 'smoothstep',
      animated: isActive && !isLocked,
      style: {
        stroke: isActive
          ? isLocked
            ? '#4b5563'   // gray-600 — active source but target still locked
            : '#8b5cf6'   // violet-500 — flowing between completed → unlocked
          : '#374151',    // gray-700 — fully dormant edge (locked)
        strokeWidth: isActive ? 2 : 1.5,
        strokeDasharray: isActive && !isLocked ? '6 3' : undefined,
      },
    };
  });
}

// ─── Empty state component ────────────────────────────────────────────────────
function EmptyConstellation() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-7 h-7 text-violet-400/60"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        </div>
        <p className="text-slate-500 text-sm font-medium">No skill nodes seeded yet</p>
        <p className="text-slate-600 text-xs max-w-[240px]">
          Run the seed action to populate the constellation graph.
        </p>
      </div>
    </div>
  );
}

// ─── Inner canvas (needs ReactFlowProvider context) ───────────────────────────
function CanvasInner({
  nodes: rawNodes,
  edges: rawEdges,
  roadmapTitle,
  onNodeSelect,
  onDeselect,
}: ConstellationCanvasProps) {
  const initialNodes = useMemo(() => buildFlowNodes(rawNodes), [rawNodes]);
  const initialEdges = useMemo(() => buildFlowEdges(rawEdges), [rawEdges]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  // Phase 2: open sidebar drawer on node click
  const onNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      const d = node.data as unknown as SkillNodeData;
      // Don't open drawer for locked nodes — they can't be interacted with
      if (d.status === 'LOCKED') return;

      // Find the full ConstellationNode from the raw props to pass to parent
      const fullNode = rawNodes.find((n) => n.id === node.id);
      if (fullNode && onNodeSelect) {
        onNodeSelect(fullNode);
      }
    },
    [rawNodes, onNodeSelect]
  );

  // Clicking the pane (empty canvas) deselects
  const onPaneClick = useCallback(() => {
    if (onDeselect) onDeselect();
  }, [onDeselect]);

  const isEmpty = rawNodes.length === 0;

  return (
    <div className="relative w-full h-full">
      {isEmpty && <EmptyConstellation />}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.25, maxZoom: 1.2 }}
        minZoom={0.15}
        maxZoom={2.5}
        proOptions={{ hideAttribution: true }}
        // Nodes are positioned from DB — disable user dragging
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        className="constellation-canvas"
      >
        {/* Subtle dark dot-matrix grid */}
        <Background
          variant={BackgroundVariant.Dots}
          color="#1e293b"
          gap={24}
          size={1.2}
          style={{ backgroundColor: '#020817' }}
        />

        {/* Navigation controls — dark-themed */}
        <Controls
          className="!border-slate-800 !bg-slate-900/90 [&>button]:!bg-slate-900 [&>button]:!border-slate-700 [&>button]:!text-slate-400 [&>button:hover]:!bg-slate-800 [&>button:hover]:!text-slate-100"
          showInteractive={false}
        />

        {/* Minimap — muted dark palette */}
        <MiniMap
          className="!border-slate-800 !bg-slate-950/90"
          nodeColor={(n) => {
            const status = (n.data as unknown as SkillNodeData).status;
            if (status === 'COMPLETED') return '#10b981'; // emerald-500
            if (status === 'UNLOCKED')  return '#8b5cf6'; // violet-500
            return '#374151'; // gray-700
          }}
          maskColor="rgba(2, 8, 23, 0.7)"
        />
      </ReactFlow>
    </div>
  );
}

// ─── Public export: wraps inner canvas with ReactFlowProvider ─────────────────
export default function ConstellationCanvas(props: ConstellationCanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  );
}
