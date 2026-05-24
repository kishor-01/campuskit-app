// src/app/roadmaps/[slug]/SpatialInvestigationBoard.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Handle,
  Position,
  Node,
  Edge,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { CheckCircle2, Milestone } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import {
  saveNodePositionsAction,
  spawnStickyNoteAction,
  updateStickyNoteAction,
  deleteStickyNoteAction
} from '@/actions';
import MobileListFallback from './MobileListFallback';
import StickyNoteNode from '@/components/roadmap/StickyNoteNode';

type Step = {
  id: string;
  title: string;
  description: string;
  order: number;
  branch?: { title: string; color?: string | null } | null;
  isCustom?: boolean;
};

interface StickyNoteData {
  id: string;
  content: string;
  color: string;
  positionX: number;
  positionY: number;
}

interface SpatialInvestigationBoardProps {
  roadmapId: string;
  steps: Step[];
  activeIds: string[];
  completedIds: string[];
  selectedStepId: string | null;
  setSelectedStepId: (id: string | null) => void;
  onToggleActiveMission: (stepId: string, isActive: boolean) => void;
  onInjectCustomObjectiveClick: () => void;
  initialPositions: Record<string, { x: number; y: number }>;
  initialStickyNotes: StickyNoteData[];
  sessionUserId: string | null;
}

// Custom Node component declared strictly outside the component to prevent unmounting/remounting
function CustomRoadmapNode({ data }: { data: any }) {
  const { step, isCompleted, isActive, isSelected, onClick } = data;

  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Left}
        className="w-2 h-2 !bg-muted-foreground/30 !border-0"
      />

      <div
        onClick={onClick}
        className={cn(
          "w-[300px] flex items-start gap-2.5 p-3.5 bg-card/85 backdrop-blur-md border rounded-xl cursor-pointer select-none transition-all duration-300 shadow-md",
          isSelected
            ? "border-primary bg-primary/5 ring-1 ring-primary/30 shadow-primary/5"
            : "border-border/60 hover:border-primary/40 hover:bg-card/95",
          isCompleted && "opacity-75 border-emerald-500/50 bg-emerald-500/5 hover:border-emerald-500/80 hover:bg-emerald-500/10",
          isActive && !isCompleted && "border-amber-500/40 bg-amber-500/[0.01] hover:border-amber-500/60"
        )}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
            <span className={cn(
              "flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-bold border",
              isCompleted
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : isActive
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  : "bg-muted border-border text-muted-foreground"
            )}>
              {step.isCustom ? "★" : step.order}
            </span>

            <h4 className={cn(
              "text-xs font-bold truncate text-foreground",
              isCompleted && "text-emerald-500/90",
              isSelected && "text-primary"
            )}>
              {step.title}
            </h4>

            {step.isCustom && (
              <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded-full text-[7px] font-extrabold border leading-none bg-blue-500/10 text-blue-400 border-blue-500/15 uppercase tracking-wide">
                Personal
              </span>
            )}

            {step.branch && (
              <span
                className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded-full text-[8px] font-medium border leading-none shrink-0"
                style={{
                  backgroundColor: `${step.branch.color || 'hsl(var(--primary))'}12`,
                  color: step.branch.color || 'hsl(var(--primary))',
                  borderColor: `${step.branch.color || 'hsl(var(--primary))'}25`,
                }}
              >
                🔀 {step.branch.title}
              </span>
            )}
          </div>

          <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
            {step.description}
          </p>
        </div>

        {isCompleted && (
          <div className="shrink-0 text-emerald-500 animate-fade-in self-center ml-1">
            <CheckCircle2 size={15} className="fill-emerald-500/10" />
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-2 !bg-muted-foreground/30 !border-0"
      />
    </div>
  );
}

// nodeTypes declared outside component function
const nodeTypes = {
  roadmapNode: CustomRoadmapNode,
  stickyNote: StickyNoteNode,
};

function CanvasInner({
  roadmapId,
  steps,
  activeIds,
  completedIds,
  selectedStepId,
  setSelectedStepId,
  initialPositions,
  initialStickyNotes,
  sessionUserId,
}: Omit<SpatialInvestigationBoardProps, 'onToggleActiveMission' | 'onInjectCustomObjectiveClick'>) {
  const { fitView, screenToFlowPosition } = useReactFlow();
  const [hasFitView, setHasFitView] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const noteSaveTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Debounced sticky note updates lookup
  const debouncedUpdateStickyNote = useCallback((
    id: string,
    content?: string,
    color?: string,
    x?: number,
    y?: number
  ) => {
    if (noteSaveTimeoutRef.current[id]) {
      clearTimeout(noteSaveTimeoutRef.current[id]);
    }

    noteSaveTimeoutRef.current[id] = setTimeout(async () => {
      if (!sessionUserId) return;
      try {
        await updateStickyNoteAction(id, content, color, x, y);
      } catch (err) {
        console.error('Failed to save sticky note:', err);
      }
    }, 1000);
  }, [sessionUserId]);

  const handleUpdateStickyNote = useCallback((id: string, content?: string, color?: string) => {
    setNodes((prevNodes) =>
      prevNodes.map((n) => {
        if (n.id === id) {
          const newContent = content !== undefined ? content : (n.data as any).content;
          const newColor = color !== undefined ? color : (n.data as any).color;
          return {
            ...n,
            data: {
              ...n.data,
              content: newContent,
              color: newColor,
            },
          };
        }
        return n;
      })
    );

    debouncedUpdateStickyNote(id, content, color);
  }, [debouncedUpdateStickyNote]);

  const handleDeleteStickyNote = useCallback(async (id: string) => {
    setNodes((prevNodes) => prevNodes.filter((n) => n.id !== id));

    if (!sessionUserId) return;
    try {
      await deleteStickyNoteAction(id);
      toast.success('Note removed.');
    } catch (err) {
      console.error('Failed to delete note:', err);
      toast.error('Failed to delete note.');
    }
  }, [sessionUserId]);

  // Generate initial nodes with coordinates (using saved positions or diagonal fallback)
  const stepNodes: Node[] = useMemo(() => {
    return steps.map((step, index) => {
      const saved = initialPositions[step.id];
      const position = saved
        ? { x: saved.x, y: saved.y }
        : { x: index * 350, y: index * 250 };

      return {
        id: step.id,
        type: 'roadmapNode',
        position,
        data: {
          step,
          isCompleted: completedIds.includes(step.id),
          isActive: activeIds.includes(step.id),
          isSelected: selectedStepId === step.id,
          onClick: () => setSelectedStepId(step.id),
        },
      };
    });
  }, [steps, initialPositions, completedIds, activeIds, selectedStepId, setSelectedStepId]);

  const stickyNodes: Node[] = useMemo(() => {
    return initialStickyNotes.map((note) => ({
      id: note.id,
      type: 'stickyNote',
      position: { x: note.positionX, y: note.positionY },
      data: {
        id: note.id,
        content: note.content,
        color: note.color,
        onDelete: () => handleDeleteStickyNote(note.id),
        onChange: (content: string, color: string) => handleUpdateStickyNote(note.id, content, color),
      },
      dragHandle: '.custom-drag-handle',
    }));
  }, [initialStickyNotes, handleDeleteStickyNote, handleUpdateStickyNote]);

  const initialNodes: Node[] = useMemo(() => {
    return [...stepNodes, ...stickyNodes];
  }, [stepNodes, stickyNodes]);

  // Generate edges representing step progression flow
  const initialEdges = useMemo(() => {
    const edgesList: Edge[] = [];
    for (let i = 0; i < steps.length - 1; i++) {
      const sourceStep = steps[i];
      const targetStep = steps[i + 1];
      const isConnectionActive = activeIds.includes(sourceStep.id) && activeIds.includes(targetStep.id);

      edgesList.push({
        id: `edge-${sourceStep.id}-${targetStep.id}`,
        source: sourceStep.id,
        target: targetStep.id,
        type: 'smoothstep',
        animated: isConnectionActive && !completedIds.includes(targetStep.id),
        style: {
          stroke: sourceStep.branch?.color || 'rgba(156, 163, 175, 0.25)',
          strokeWidth: isConnectionActive ? 2.5 : 1.5,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 12,
          height: 12,
          color: sourceStep.branch?.color || 'rgba(156, 163, 175, 0.25)',
        },
      });
    }
    return edgesList;
  }, [steps, activeIds, completedIds]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync node changes back into local React Flow state
  useEffect(() => {
    setNodes((prevNodes) => {
      return initialNodes.map((initNode) => {
        const matchingPrev = prevNodes.find((pn) => pn.id === initNode.id);
        if (matchingPrev) {
          return {
            ...initNode,
            selected: initNode.id === selectedStepId, // sync visual highlighting in React Flow
            position: matchingPrev.position, // Keep current position
            data: initNode.data, // sync fresh data props
          };
        }
        return initNode;
      });
    });
  }, [initialNodes, selectedStepId, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  // Auto-center and fit layout on initial mount
  useEffect(() => {
    if (nodes.length > 0 && !hasFitView) {
      const timer = setTimeout(() => {
        fitView({ padding: 0.2, duration: 800 });
        setHasFitView(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [nodes, fitView, hasFitView]);

  // Debounced coordinate sync database action
  const debouncedSavePositions = useCallback((positionsList: { stepId: string; positionX: number; positionY: number }[]) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      if (!sessionUserId) return;
      try {
        await saveNodePositionsAction(roadmapId, positionsList);
      } catch (err) {
        console.error('Failed to auto-save coordinates:', err);
      }
    }, 1000); // 1-second debounce
  }, [roadmapId, sessionUserId]);

  const handleNodeDragStop = useCallback((event: any, node: any) => {
    // Sync dragging nodes with database
    setNodes((prevNodes) => {
      const updatedNodes = prevNodes.map((n) => {
        if (n.id === node.id) {
          return { ...n, position: node.position };
        }
        return n;
      });

      // Split coordinates syncing:
      // 1. Step nodes sync via saveNodePositionsAction
      const stepNodesList = updatedNodes.filter(n => n.type === 'roadmapNode');
      const positionsList = stepNodesList.map((n) => ({
        stepId: n.id,
        positionX: n.position.x,
        positionY: n.position.y,
      }));
      debouncedSavePositions(positionsList);

      // 2. Sticky nodes sync via updateStickyNoteAction
      if (node.type === 'stickyNote') {
        debouncedUpdateStickyNote(node.id, undefined, undefined, node.position.x, node.position.y);
      }

      return updatedNodes;
    });
  }, [setNodes, debouncedSavePositions, debouncedUpdateStickyNote]);

  // Handle Double Click to place a Sticky Note (wired as onPaneClick checking detail === 2)
  const onPaneClick = useCallback(async (event: React.MouseEvent) => {
    if (event.detail !== 2) return; // Only trigger on double click

    if (!sessionUserId) {
      toast.error('You must be signed in to place sticky notes.');
      return;
    }

    // Get event coordinates translated to Flow zoom/pan space
    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    // Center the note: sticky note is 224px wide and 224px high (w-56 h-56 = 14rem = 224px)
    const adjustedPosition = {
      x: position.x - 112,
      y: position.y - 112,
    };

    // 1. Instantly spawn a temporary ID node locally for instant tactile feedback
    const tempId = `temp-${Date.now()}`;
    const tempNode: Node = {
      id: tempId,
      type: 'stickyNote',
      position: adjustedPosition,
      data: {
        id: tempId,
        content: '',
        color: 'yellow',
        onDelete: () => handleDeleteStickyNote(tempId),
        onChange: (content: string, color: string) => handleUpdateStickyNote(tempId, content, color),
      },
      dragHandle: '.custom-drag-handle',
    };

    setNodes((prev) => [...prev, tempNode]);

    // 2. Call backend to persist
    try {
      const result = await spawnStickyNoteAction(roadmapId, adjustedPosition.x, adjustedPosition.y);
      if (result.success && result.note) {
        // Swap temp ID for real database ID in nodes state
        setNodes((prev) =>
          prev.map((n) => {
            if (n.id === tempId) {
              return {
                ...n,
                id: result.note.id,
                data: {
                  ...n.data,
                  id: result.note.id,
                  onDelete: () => handleDeleteStickyNote(result.note.id),
                  onChange: (content: string, color: string) => handleUpdateStickyNote(result.note.id, content, color),
                },
              };
            }
            return n;
          })
        );
      }
    } catch (err) {
      console.error('Failed to spawn sticky note in DB:', err);
      // Remove temp node on failure
      setNodes((prev) => prev.filter((n) => n.id !== tempId));
      toast.error('Failed to spawn sticky note.');
    }
  }, [sessionUserId, roadmapId, screenToFlowPosition, setNodes, handleDeleteStickyNote, handleUpdateStickyNote]);

  // Handle Click on nodes (only standard roadmap steps, not sticky notes)
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (node.type !== 'roadmapNode') return;
    setSelectedStepId(node.id);
  }, [setSelectedStepId]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    const timeouts = noteSaveTimeoutRef.current;
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      Object.values(timeouts).forEach((t) => clearTimeout(t));
    };
  }, []);

  return (
    <div className="w-full h-full relative z-0">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={handleNodeDragStop}
        onPaneClick={onPaneClick}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={1.5}
        className="w-full h-full"
      >
        <Background color="rgba(255, 255, 255, 0.08)" gap={16} size={1} />
        <Controls className="!bg-card/85 !border-border/50 !text-foreground !rounded-lg" />
        <MiniMap
          nodeColor={(node) => {
            if (node.data.isCompleted) return 'rgba(16, 185, 129, 0.25)';
            if (node.data.isActive) return 'rgba(245, 158, 11, 0.25)';
            return 'rgba(255, 255, 255, 0.08)';
          }}
          maskColor="rgba(0, 0, 0, 0.6)"
          className="!border-border/50 !rounded-lg !overflow-hidden !bg-card/60 !backdrop-blur-sm"
        />
      </ReactFlow>
    </div>
  );
}

export default function SpatialInvestigationBoard(props: SpatialInvestigationBoardProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return <MobileListFallback {...props} />;
  }

  return (
    <div className="w-full h-full relative overflow-hidden bg-background">
      <ReactFlowProvider>
        <CanvasInner
          roadmapId={props.roadmapId}
          steps={props.steps}
          activeIds={props.activeIds}
          completedIds={props.completedIds}
          selectedStepId={props.selectedStepId}
          setSelectedStepId={props.setSelectedStepId}
          initialPositions={props.initialPositions}
          initialStickyNotes={props.initialStickyNotes}
          sessionUserId={props.sessionUserId}
        />
      </ReactFlowProvider>
    </div>
  );
}
