// src/app/admin/forge/[slug]/ForgeCanvas.tsx
// Admin Graph Forge — Interactive DAG Editor (ReactFlow)
'use client';

import React, { useCallback, useState, useEffect, useRef } from 'react';
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
import { Sparkles, Loader2, X, Wand2 } from 'lucide-react';

import {
  createLearningNodeAction,
  updateNodePositionAction,
  createLearningEdgeAction,
  deleteLearningEdgeAction,
} from '@/actions/forgeActions';
import { generateMacroGraphAction } from '@/actions/macroGraphActions';
import ForgeInspector from './ForgeInspector';
import ForgeNode from './ForgeNode';
import DeletableEdge from './DeletableEdge';
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

// ─── Custom edge type registry ────────────────────────────────────────────────
const edgeTypes = { default: DeletableEdge };

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
function buildFlowEdges(edges: ForgeEdgeData[], slug: string): Edge[] {
  return edges.map((e) => ({
    id: e.id,
    source: e.sourceNodeId,
    target: e.targetNodeId,
    type: 'default', // uses DeletableEdge
    markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' },
    style: { stroke: '#8b5cf6', strokeWidth: 1.5 },
    data: { slug }, // passed to DeletableEdge for server action revalidation
  }));
}

// ─── Auto-Build Dialog ────────────────────────────────────────────────────────
function AutoBuildDialog({
  onClose,
  onGenerate,
}: {
  onClose: () => void;
  onGenerate: (prompt: string) => Promise<void>;
}) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit();
  };

  const handleSubmit = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    try {
      await onGenerate(prompt.trim());
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg rounded-2xl border border-slate-800/80 bg-slate-950 shadow-2xl shadow-violet-500/10 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <Wand2 className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">Macro DAG Generator</p>
              <p className="text-[10px] text-slate-500">AI Curriculum Architect</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-400 leading-relaxed">
            Describe the curriculum you want to build. The AI will generate nodes with
            prerequisite edges, auto-spaced mathematically.
          </p>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Your Prompt
            </label>
            <textarea
              ref={inputRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={4}
              placeholder={'e.g. "Build a 10-node advanced Docker & Kubernetes track from containers to production orchestration"'}
              className="w-full resize-none rounded-xl border border-slate-800/60 bg-slate-900/60
                px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 leading-relaxed
                focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
              disabled={isGenerating}
            />
            <p className="text-[10px] text-slate-600">Ctrl+Enter to generate</p>
          </div>

          {/* Examples */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Quick examples</p>
            <div className="flex flex-wrap gap-2">
              {[
                'TypeScript advanced patterns',
                'System design fundamentals',
                'Rust ownership & borrowing',
                'CI/CD with GitHub Actions',
              ].map((ex) => (
                <button
                  key={ex}
                  onClick={() => setPrompt(`Build a structured skill graph for: ${ex}`)}
                  disabled={isGenerating}
                  className="text-[10px] font-semibold text-violet-400 bg-violet-500/10 border border-violet-500/20
                    px-2.5 py-1 rounded-lg hover:bg-violet-500/20 transition-all disabled:opacity-40"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5">
          <button
            onClick={handleSubmit}
            disabled={!prompt.trim() || isGenerating}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
              font-bold text-sm text-white transition-all duration-200
              bg-gradient-to-r from-violet-600 to-indigo-600
              hover:from-violet-500 hover:to-indigo-500
              hover:shadow-[0_0_20px_rgba(139,92,246,0.35)]
              active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generating Curriculum...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Generate Graph</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Inner Canvas (needs ReactFlowProvider context) ───────────────────────────
function CanvasInner({ roadmapId, slug, initialNodes, initialEdges }: ForgeCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(buildFlowNodes(initialNodes));
  const [edges, setEdges, onEdgesChange] = useEdgesState(buildFlowEdges(initialEdges, slug));

  // Maintain a map of id → full node data for the inspector
  const [nodeDataMap, setNodeDataMap] = useState<Record<string, ForgeNodeData>>(
    () => Object.fromEntries(initialNodes.map((n) => [n.id, n]))
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedNodeResources, setSelectedNodeResources] = useState<AffiliateResourceItem[]>([]);
  const [showAutoBuild, setShowAutoBuild] = useState(false);

  const { screenToFlowPosition } = useReactFlow();

  const selectedNodeData = selectedNodeId ? nodeDataMap[selectedNodeId] ?? null : null;

  // ── Fetch affiliate resources for the selected node ────────────────────────
  useEffect(() => {
    if (!selectedNodeId) { setSelectedNodeResources([]); return; }
    fetch(`/api/admin/forge/node-resources?nodeId=${selectedNodeId}`)
      .then((r) => r.json())
      .then((data) => setSelectedNodeResources(data.resources ?? []))
      .catch(() => setSelectedNodeResources([]));
  }, [selectedNodeId]);

  const handleResourcesChange = useCallback(async (nodeId: string) => {
    try {
      const r = await fetch(`/api/admin/forge/node-resources?nodeId=${nodeId}`);
      const data = await r.json();
      setSelectedNodeResources(data.resources ?? []);
    } catch {
      // silent — inspector manages its own optimistic state
    }
  }, []);

  // ── onNodeDragStop: ONLY persist position after drag completes ─────────────
  // The nodes array is already managed by useNodesState/onNodesChange above,
  // so dragging is handled at 60fps locally. We only write to the DB on stop.
  const onNodeDragStop: OnNodeDrag = useCallback(
    async (_event: React.MouseEvent, node: Node) => {
      const { x, y } = node.position;
      const result = await updateNodePositionAction(node.id, slug, x, y);
      if (!result.success) toast.error('Failed to save position');
    },
    [slug]
  );

  // ── onCanvasDoubleClick: spawn a new blank node at cursor ──────────────────
  // Uses screenToFlowPosition for correct canvas-space coordinates regardless
  // of zoom/pan state. Adds a slight random offset so stacked clicks are
  // individually grabbable.
  const onCanvasDoubleClick = useCallback(
    async (event: React.MouseEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement;
      if (target.closest('.react-flow__node')) return;

      // screenToFlowPosition gives us the exact canvas-space point
      const jitter = () => (Math.random() - 0.5) * 40; // ±20px
      const flowPos = screenToFlowPosition({
        x: event.clientX + jitter(),
        y: event.clientY + jitter(),
      });

      const result = await createLearningNodeAction(roadmapId, slug, flowPos.x, flowPos.y);
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
      toast.success('Node created — edit in the inspector →');
    },
    [roadmapId, slug, setNodes, screenToFlowPosition]
  );

  // ── onConnect: wire two nodes with a new edge ──────────────────────────────
  const onConnect: OnConnect = useCallback(
    async (connection: Connection) => {
      if (!connection.source || !connection.target) return;

      const result = await createLearningEdgeAction(
        roadmapId, slug, connection.source, connection.target
      );

      if (result.error) { toast.error(result.error); return; }
      if (!result.success || !result.edge) return;

      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            id: result.edge!.id,
            type: 'default', // DeletableEdge
            markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' },
            style: { stroke: '#8b5cf6', strokeWidth: 1.5 },
            data: { slug },
          },
          eds
        )
      );
      toast.success('Prerequisite edge created');
    },
    [roadmapId, slug, setEdges]
  );

  // ── Edge delete (select edge + press Delete) ───────────────────────────────
  const onEdgesDelete = useCallback(
    async (deletedEdges: Edge[]) => {
      for (const edge of deletedEdges) {
        await deleteLearningEdgeAction(edge.id, slug);
      }
    },
    [slug]
  );

  // ── Node click: select for inspector ──────────────────────────────────────
  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    setSelectedNodeId(node.id);
  }, []);

  // ── Pane click: deselect ──────────────────────────────────────────────────
  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  // ── Inspector callbacks ───────────────────────────────────────────────────
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

  // ── Macro DAG generation ──────────────────────────────────────────────────
  const handleMacroGenerate = useCallback(async (prompt: string) => {
    const toastId = toast.loading('Generating curriculum graph…');
    try {
      const result = await generateMacroGraphAction(prompt, roadmapId, slug);
      if (!result.success) {
        toast.error(result.error ?? 'Generation failed', { id: toastId });
        return;
      }
      toast.success(
        `Graph generated — ${result.nodeCount} nodes, ${result.edgeCount} edges. Refreshing canvas…`,
        { id: toastId, duration: 4000 }
      );
      setShowAutoBuild(false);
      // Refresh page after a short delay so server revalidation propagates
      setTimeout(() => window.location.reload(), 1200);
    } catch (err: any) {
      toast.error(err.message ?? 'Unexpected error', { id: toastId });
    }
  }, [roadmapId, slug]);

  const isCanvasEmpty = nodes.length === 0;

  return (
    <>
      {/* ── Macro DAG Dialog ──────────────────────────────────────────────── */}
      {showAutoBuild && (
        <AutoBuildDialog
          onClose={() => setShowAutoBuild(false)}
          onGenerate={handleMacroGenerate}
        />
      )}

      <div className="relative w-full h-full" onDoubleClick={onCanvasDoubleClick}>

        {/* ── Auto-Build button (only on empty canvas) ────────────────────── */}
        {isCanvasEmpty && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10
            flex flex-col items-center gap-4 pointer-events-none select-none text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center">
              <Wand2 className="w-7 h-7 text-slate-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 mb-1">Canvas is empty</p>
              <p className="text-xs text-slate-600">Double-click anywhere to spawn a node, or</p>
            </div>
            <button
              onClick={() => setShowAutoBuild(true)}
              className="pointer-events-auto flex items-center gap-2 px-5 py-2.5 rounded-xl
                font-bold text-sm text-white
                bg-gradient-to-r from-violet-600 to-indigo-600
                hover:from-violet-500 hover:to-indigo-500
                hover:shadow-[0_0_24px_rgba(139,92,246,0.4)]
                active:scale-[0.98] transition-all duration-200"
            >
              <Sparkles className="w-4 h-4" />
              Auto-Build Graph
            </button>
          </div>
        )}

        {/* ── Auto-Build button overlay (non-empty canvas) ────────────────── */}
        {!isCanvasEmpty && (
          <button
            onClick={() => setShowAutoBuild(true)}
            className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-2 rounded-xl
              text-[10px] font-bold uppercase tracking-wider text-violet-400
              bg-slate-950/90 border border-violet-500/30 hover:bg-violet-500/10
              hover:border-violet-500/50 backdrop-blur-sm transition-all shadow-lg"
          >
            <Sparkles className="w-3 h-3" />
            Auto-Build Graph
          </button>
        )}

        {/* ── Help hint ─────────────────────────────────────────────────────── */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-4
          px-4 py-2 rounded-full bg-slate-900/80 border border-slate-800/60 backdrop-blur-sm
          text-[10px] text-slate-500 font-mono tracking-wide pointer-events-none select-none">
          <span>Dbl-click canvas → node</span>
          <span className="text-slate-700">·</span>
          <span>Drag handle → edge</span>
          <span className="text-slate-700">·</span>
          <span>Click → inspect</span>
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
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.1}
          maxZoom={2.5}
          proOptions={{ hideAttribution: true }}
          nodesDraggable={true}
          nodesConnectable={true}
          elementsSelectable={true}
          deleteKeyCode="Delete"
          className="forge-canvas group"
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

        {/* ── Inspector Sidebar ────────────────────────────────────────────────── */}
        <ForgeInspector
          node={selectedNodeData}
          slug={slug}
          resources={selectedNodeResources}
          onNodeUpdate={handleNodeUpdate}
          onNodeDelete={handleNodeDelete}
          onResourcesChange={handleResourcesChange}
        />
      </div>
    </>
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
