// src/app/admin/forge/[slug]/ForgeCanvas.tsx
// Admin Graph Forge — Interactive DAG Editor (ReactFlow)
'use client';

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  type Node,
  type Edge,
  type OnConnect,
  type NodeMouseHandler,
  type OnNodeDrag,
  type Connection,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { toast } from 'react-hot-toast';

import {
  createLearningNodeAction,
  updateNodePositionAction,
  createLearningEdgeAction,
  deleteLearningEdgeAction,
} from '@/actions/forgeActions';
import ForgeInspector from './ForgeInspector';
import ForgeNode from './ForgeNode';
import type { AffiliateResourceItem } from '@/app/roadmaps/[slug]/ConstellationCanvas';

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface ForgeNodeData {
  id: string;
  title: string;
  briefing: string;
  type: string;
  positionX: number;
  positionY: number;
}

export interface ForgeEdgeData {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
}

interface ForgeCanvasProps {
  roadmapId: string;
  slug: string;
  initialNodes: ForgeNodeData[];
  initialEdges: ForgeEdgeData[];
}

// ─── Custom node type registry ────────────────────────────────────────────────
const nodeTypes = { forgeNode: ForgeNode };

// ─── Build ReactFlow nodes from raw data ──────────────────────────────────────
function buildFlowNodes(nodes: ForgeNodeData[]): Node[] {
  return nodes.map((n) => ({
    id: n.id,
    type: 'forgeNode',
    position: { x: n.positionX, y: n.positionY },
    data: { label: n.title, type: n.type, nodeId: n.id },
    selected: false,
  }));
}

// ─── Build ReactFlow edges from raw data ──────────────────────────────────────
function buildFlowEdges(edges: ForgeEdgeData[]): Edge[] {
  return edges.map((e) => ({
    id: e.id,
    source: e.sourceNodeId,
    target: e.targetNodeId,
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' },
    style: { stroke: '#8b5cf6', strokeWidth: 1.5 },
  }));
}

// ─── Inner Canvas (needs ReactFlowProvider context) ───────────────────────────
function CanvasInner({ roadmapId, slug, initialNodes, initialEdges }: ForgeCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(buildFlowNodes(initialNodes));
  const [edges, setEdges, onEdgesChange] = useEdgesState(buildFlowEdges(initialEdges));

  // Maintain a map of id → full node data for the inspector
  const [nodeDataMap, setNodeDataMap] = useState<Record<string, ForgeNodeData>>(
    () => Object.fromEntries(initialNodes.map((n) => [n.id, n]))
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedNodeResources, setSelectedNodeResources] = useState<AffiliateResourceItem[]>([]);

  const selectedNodeData = selectedNodeId ? nodeDataMap[selectedNodeId] ?? null : null;

  // ── Fetch affiliate resources for the selected node ───────────────────────
  useEffect(() => {
    if (!selectedNodeId) { setSelectedNodeResources([]); return; }
    fetch(`/api/admin/forge/node-resources?nodeId=${selectedNodeId}`)
      .then((r) => r.json())
      .then((data) => setSelectedNodeResources(data.resources ?? []))
      .catch(() => setSelectedNodeResources([]));
  }, [selectedNodeId]);

  const handleResourcesChange = useCallback(async (nodeId: string) => {
    // Re-fetch resources for the node to keep Arsenal in sync
    try {
      const r = await fetch(`/api/admin/forge/node-resources?nodeId=${nodeId}`);
      const data = await r.json();
      setSelectedNodeResources(data.resources ?? []);
    } catch {
      // silent — inspector manages its own optimistic state
    }
  }, []);

  // ── onNodeDragStop: persist position to DB ──────────────────────────────
  const onNodeDragStop: OnNodeDrag = useCallback(
    async (_event: React.MouseEvent, node: Node) => {
      const { x, y } = node.position;
      const result = await updateNodePositionAction(node.id, slug, x, y);
      if (!result.success) toast.error('Failed to save position');
    },
    [slug]
  );

  // ── onCanvasDoubleClick: spawn a new blank node ─────────────────────────
  const onCanvasDoubleClick = useCallback(
    async (event: React.MouseEvent<HTMLDivElement>) => {
      // Only trigger on the canvas background, not on nodes
      const target = event.target as HTMLElement;
      if (target.closest('.react-flow__node')) return;

      const container = (event.currentTarget as HTMLElement).querySelector('.react-flow__pane');
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const result = await createLearningNodeAction(roadmapId, slug, x, y);
      if (!result.success || !result.node) {
        toast.error('Failed to create node');
        return;
      }

      const n = result.node;
      const newFlowNode: Node = {
        id: n.id,
        type: 'forgeNode',
        position: { x: n.positionX, y: n.positionY },
        data: { label: n.title, type: n.type, nodeId: n.id },
      };

      setNodes((nds) => [...nds, newFlowNode]);
      setNodeDataMap((prev) => ({ ...prev, [n.id]: n }));
      setSelectedNodeId(n.id);
      toast.success('Node created — edit it in the inspector →');
    },
    [roadmapId, slug, setNodes]
  );

  // ── onConnect: wire two nodes with a new edge ───────────────────────────
  const onConnect: OnConnect = useCallback(
    async (connection: Connection) => {
      if (!connection.source || !connection.target) return;

      const result = await createLearningEdgeAction(
        roadmapId,
        slug,
        connection.source,
        connection.target
      );

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (!result.success || !result.edge) return;

      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            id: result.edge!.id,
            type: 'smoothstep',
            markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' },
            style: { stroke: '#8b5cf6', strokeWidth: 1.5 },
          },
          eds
        )
      );

      toast.success('Prerequisite edge created');
    },
    [roadmapId, slug, setEdges]
  );

  // ── Edge delete (click edge then press Delete) ──────────────────────────
  const onEdgesDelete = useCallback(
    async (deletedEdges: Edge[]) => {
      for (const edge of deletedEdges) {
        await deleteLearningEdgeAction(edge.id, slug);
      }
    },
    [slug]
  );

  // ── Node click: select for inspector ───────────────────────────────────
  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    setSelectedNodeId(node.id);
  }, []);

  // ── Pane click: deselect ────────────────────────────────────────────────
  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  // ── Inspector callbacks ──────────────────────────────────────────────────
  const handleNodeUpdate = useCallback((updated: ForgeNodeData) => {
    setNodeDataMap((prev) => ({ ...prev, [updated.id]: updated }));
    setNodes((nds) =>
      nds.map((n) =>
        n.id === updated.id
          ? { ...n, data: { ...n.data, label: updated.title, type: updated.type } }
          : n
      )
    );
  }, [setNodes]);

  const handleNodeDelete = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setNodeDataMap((prev) => {
      const next = { ...prev };
      delete next[nodeId];
      return next;
    });
    setSelectedNodeId(null);
  }, [setNodes, setEdges]);

  return (
    <div className="relative w-full h-full" onDoubleClick={onCanvasDoubleClick}>
      {/* ── Help hint ─────────────────────────────────────────────────── */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-4
        px-4 py-2 rounded-full bg-slate-900/80 border border-slate-800/60 backdrop-blur-sm
        text-[10px] text-slate-500 font-mono tracking-wide pointer-events-none select-none">
        <span>Double-click canvas → create node</span>
        <span className="text-slate-700">·</span>
        <span>Drag handle → wire edge</span>
        <span className="text-slate-700">·</span>
        <span>Click node → inspect</span>
        <span className="text-slate-700">·</span>
        <span>Select edge + Del → remove</span>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onConnect={onConnect}
        onEdgesDelete={onEdgesDelete}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.1}
        maxZoom={2.5}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
        deleteKeyCode="Delete"
        className="forge-canvas"
      >
        <Background
          variant={BackgroundVariant.Dots}
          color="#1e293b"
          gap={24}
          size={1.2}
          style={{ backgroundColor: '#020817' }}
        />
        <Controls
          className="!border-slate-800 !bg-slate-900/90 [&>button]:!bg-slate-900 [&>button]:!border-slate-700 [&>button]:!text-slate-400 [&>button:hover]:!bg-slate-800"
        />
        <MiniMap
          className="!border-slate-800 !bg-slate-950/90"
          nodeColor={(n) => {
            const t = (n.data as any).type;
            if (t === 'milestone') return '#10b981';
            if (t === 'practice') return '#f59e0b';
            return '#8b5cf6';
          }}
          maskColor="rgba(2, 8, 23, 0.75)"
        />
      </ReactFlow>

      {/* ── Inspector Sidebar ───────────────────────────────────────────────── */}
      <ForgeInspector
        node={selectedNodeData}
        slug={slug}
        resources={selectedNodeResources}
        onNodeUpdate={handleNodeUpdate}
        onNodeDelete={handleNodeDelete}
        onResourcesChange={handleResourcesChange}
      />
    </div>
  );
}

// ─── Exported wrapper ─────────────────────────────────────────────────────────
export default function ForgeCanvas(props: ForgeCanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  );
}
