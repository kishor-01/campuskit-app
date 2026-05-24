'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Handle,
  Position,
  Node,
  useViewport,
  addEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import {
  Calendar,
  Tag,
  Trash2,
  Edit,
  Plus,
  Clock,
  Navigation,
  Loader2,
  CalendarDays,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import {
  createLifemapNodeAction,
  updateLifemapNodeAction,
  deleteLifemapNodeAction,
  saveLifemapEdgeAction,
} from '@/actions';
import { dateToX, xToDate, PIXELS_PER_DAY } from '@/lib/timeScale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// Interface for serialized node data
interface SerializedLifemapNode {
  id: string;
  title: string;
  description: string;
  targetDate: string; // ISO String
  tags: string[];
  colorTheme: string;
  createdAt: string;
  updatedAt: string;
}

interface LifemapCanvasProps {
  initialNodes: SerializedLifemapNode[];
  initialEdges: any[];
  sessionUserId: string;
}

// Color Theme Tailwind Mappings
const COLOR_THEMES: Record<string, { border: string; bg: string; text: string; glow: string; badge: string; shadow: string }> = {
  indigo: {
    border: 'border-indigo-500/50 hover:border-indigo-400',
    bg: 'bg-slate-900/90 border-indigo-500/30',
    text: 'text-indigo-400',
    glow: 'shadow-indigo-500/10',
    badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    shadow: 'hover:shadow-[0_0_15px_rgba(99,102,241,0.15)]',
  },
  emerald: {
    border: 'border-emerald-500/50 hover:border-emerald-400',
    bg: 'bg-slate-900/90 border-emerald-500/30',
    text: 'text-emerald-400',
    glow: 'shadow-emerald-500/10',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    shadow: 'hover:shadow-[0_0_15px_rgba(16,185,129,0.15)]',
  },
  violet: {
    border: 'border-violet-500/50 hover:border-violet-400',
    bg: 'bg-slate-900/90 border-violet-500/30',
    text: 'text-violet-400',
    glow: 'shadow-violet-500/10',
    badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    shadow: 'hover:shadow-[0_0_15px_rgba(139,92,246,0.15)]',
  },
  blue: {
    border: 'border-blue-500/50 hover:border-blue-400',
    bg: 'bg-slate-900/90 border-blue-500/30',
    text: 'text-blue-400',
    glow: 'shadow-blue-500/10',
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    shadow: 'hover:shadow-[0_0_15px_rgba(59,130,246,0.15)]',
  },
  amber: {
    border: 'border-amber-500/50 hover:border-amber-400',
    bg: 'bg-slate-900/90 border-amber-500/30',
    text: 'text-amber-400',
    glow: 'shadow-amber-500/10',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    shadow: 'hover:shadow-[0_0_15px_rgba(245,158,11,0.15)]',
  },
  rose: {
    border: 'border-rose-500/50 hover:border-rose-400',
    bg: 'bg-slate-900/90 border-rose-500/30',
    text: 'text-rose-400',
    glow: 'shadow-rose-500/10',
    badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    shadow: 'hover:shadow-[0_0_15px_rgba(244,63,94,0.15)]',
  },
};

/**
 * Custom Lifemap Node Component for React Flow
 */
function LifemapNodeComponent({ data }: { data: any }) {
  const { node, onEdit, onDelete } = data;
  const theme = COLOR_THEMES[node.colorTheme] || COLOR_THEMES.indigo;
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardHeight, setCardHeight] = useState(140); // sensible default

  const yOffset = data.y || 0;
  const showPlumbLine = Math.abs(yOffset) > 10;

  // Measure actual card height for precise plumb line geometry
  useEffect(() => {
    if (cardRef.current) {
      setCardHeight(cardRef.current.offsetHeight);
    }
  }, [node.title, node.description, node.tags]);

  const plumbColors: Record<string, string> = {
    indigo: 'border-indigo-500/35 shadow-[0_0_10px_rgba(99,102,241,0.15)]',
    emerald: 'border-emerald-500/35 shadow-[0_0_10px_rgba(16,185,129,0.15)]',
    violet: 'border-violet-500/35 shadow-[0_0_10px_rgba(139,92,246,0.15)]',
    blue: 'border-blue-500/35 shadow-[0_0_10px_rgba(59,130,246,0.15)]',
    amber: 'border-amber-500/35 shadow-[0_0_10px_rgba(245,158,11,0.15)]',
    rose: 'border-rose-500/35 shadow-[0_0_10px_rgba(244,63,94,0.15)]',
  };
  const plumbStyle = plumbColors[node.colorTheme] || plumbColors.indigo;

  const dateFormatted = useMemo(() => {
    const d = new Date(node.targetDate);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  }, [node.targetDate]);

  // Plumb line geometry: accounts for React Flow's top-left positioning model
  // yOffset is the node.position.y in flow coordinates
  // When yOffset < 0 (above axis): line originates from bottom-center of card, drops down to Y=0
  //   Distance from card bottom to Y=0 = |yOffset| - cardHeight (could be negative if card straddles axis)
  // When yOffset > 0 (below axis): line originates from top-center of card, reaches up to Y=0
  //   Distance from card top to Y=0 = yOffset
  const plumbLineStyle = useMemo(() => {
    if (yOffset < 0) {
      // Node is above the axis. Card top-left is at yOffset.
      // Card bottom is at yOffset + cardHeight.
      // Distance from card bottom to Y=0:
      const distToAxis = Math.abs(yOffset) - cardHeight;
      if (distToAxis <= 0) return null; // card straddles or touches the axis
      return {
        height: `${distToAxis}px`,
        top: `${cardHeight}px`, // Start right below the card
      };
    } else {
      // Node is below the axis. Card top-left is at yOffset.
      // Distance from card top to Y=0 = yOffset
      return {
        height: `${yOffset}px`,
        top: `-${yOffset}px`, // Start at Y=0 (above the card)
      };
    }
  }, [yOffset, cardHeight]);

  return (
    <div className="relative group">
      {/* Plumb Line tethering the node to the timeline center axis Y=0 */}
      {showPlumbLine && plumbLineStyle && (
        <div
          className={cn(
            "absolute left-1/2 -translate-x-1/2 -z-10 border-l border-dashed pointer-events-none transition-all duration-75",
            plumbStyle
          )}
          style={plumbLineStyle}
        />
      )}

      {/* Styled connection Handles for custom wiring */}
      <Handle
        type="target"
        position={Position.Left}
        className={cn(
          "w-2.5 h-2.5 !border-2 !border-slate-950 transition-all rounded-full z-20",
          node.colorTheme === 'emerald' ? '!bg-emerald-400 hover:!bg-emerald-300' :
          node.colorTheme === 'violet' ? '!bg-violet-400 hover:!bg-violet-300' :
          node.colorTheme === 'blue' ? '!bg-blue-400 hover:!bg-blue-300' :
          node.colorTheme === 'amber' ? '!bg-amber-400 hover:!bg-amber-300' :
          node.colorTheme === 'rose' ? '!bg-rose-400 hover:!bg-rose-300' :
          '!bg-indigo-400 hover:!bg-indigo-300'
        )}
        style={{ left: '-5px' }}
      />
      
      {/* Node Content Card */}
      <div
        ref={cardRef}
        className={cn(
          "w-[320px] p-4 rounded-xl border bg-slate-950/85 backdrop-blur-md transition-all duration-300 select-none shadow-lg",
          theme.border,
          theme.glow,
          theme.shadow
        )}
      >
        {/* Node Header */}
        <div className="flex items-center justify-between mb-2">
          <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-full">
            <Clock size={10} className={theme.text} />
            {dateFormatted}
          </span>
          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(node);
              }}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Edit Node"
            >
              <Edit size={11} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(node.id);
              }}
              className="p-1 rounded bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-400 transition-colors"
              title="Delete Node"
            >
              <Trash2 size={11} />
            </button>
          </div>
        </div>

        {/* Title */}
        <h4 className="text-sm font-bold text-slate-100 truncate mb-1">
          {node.title}
        </h4>

        {/* Description */}
        {node.description && (
          <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed mb-3">
            {node.description}
          </p>
        )}

        {/* Tags */}
        {node.tags && node.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {node.tags.map((tag: string, i: number) => (
              <span
                key={i}
                className={cn(
                  "text-[8px] font-semibold px-2 py-0.5 rounded-full border tracking-wide uppercase",
                  theme.badge
                )}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className={cn(
          "w-2.5 h-2.5 !border-2 !border-slate-950 transition-all rounded-full z-20",
          node.colorTheme === 'emerald' ? '!bg-emerald-400 hover:!bg-emerald-300' :
          node.colorTheme === 'violet' ? '!bg-violet-400 hover:!bg-violet-300' :
          node.colorTheme === 'blue' ? '!bg-blue-400 hover:!bg-blue-300' :
          node.colorTheme === 'amber' ? '!bg-amber-400 hover:!bg-amber-300' :
          node.colorTheme === 'rose' ? '!bg-rose-400 hover:!bg-rose-300' :
          '!bg-indigo-400 hover:!bg-indigo-300'
        )}
        style={{ right: '-5px' }}
      />
    </div>
  );
}

const nodeTypes = {
  lifemapNode: LifemapNodeComponent,
};

/**
 * Sweep-line auto-layout algorithm for initial vertical stacking based on horizontal overlaps.
 */
function layoutNodes(nodes: SerializedLifemapNode[]): Node[] {
  const sorted = [...nodes].sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime());
  const cardWidth = 340; // width (320px) + padding spacing
  const activeRanges: { right: number; y: number }[] = [];

  return sorted.map((node) => {
    const x = dateToX(node.targetDate);
    const left = x;
    const right = x + cardWidth;

    let rowCandidateIndex = 0;
    const rowStep = 170;

    while (true) {
      let y = 0;
      if (rowCandidateIndex > 0) {
        const magnitude = Math.ceil(rowCandidateIndex / 2);
        const sign = rowCandidateIndex % 2 === 1 ? -1 : 1;
        y = sign * magnitude * rowStep;
      }

      const hasOverlap = activeRanges.some(
        (range) => range.y === y && left < range.right
      );

      if (!hasOverlap) {
        activeRanges.push({ right, y });
        return {
          id: node.id,
          type: 'lifemapNode',
          position: { x, y },
          data: { node },
        };
      }
      rowCandidateIndex++;
    }
  });
}

/**
 * Performance-Optimized Timeline Ruler Component
 */
function TimelineRuler() {
  const { x: viewportX, zoom } = useViewport();
  const [windowWidth, setWindowWidth] = useState(1200);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate visible range in canvas coordinates (pixels)
  const xMin = -viewportX / zoom;
  const xMax = (windowWidth - viewportX) / zoom;

  // Convert pixel range to Dates
  const dateMin = xToDate(xMin);
  const dateMax = xToDate(xMax);

  // Generate ticks only for the visible window
  const ticks = useMemo(() => {
    const visibleTicks: { date: Date; x: number; label: string; isMajor: boolean }[] = [];
    let current = new Date(dateMin);

    // Dynamic density scaling based on zoom level
    let stepDays = 1;
    let drawHours = false;
    let drawMonthsOnly = false;

    if (zoom <= 0.08) {
      drawMonthsOnly = true;
    } else if (zoom <= 0.22) {
      stepDays = 7; // Weekly
    } else if (zoom <= 0.55) {
      stepDays = 2; // Every 2 days
    } else {
      stepDays = 1; // Daily
      drawHours = true; // Show sub-day hour ticks
    }

    let iterations = 0;
    const maxIterations = 200; // safety ceiling

    if (drawMonthsOnly) {
      // Month-by-month ticks
      current.setUTCHours(0, 0, 0, 0);
      current.setUTCDate(1); // align to month boundary
      while (current <= dateMax && iterations < maxIterations) {
        iterations++;
        const cx = dateToX(current);
        visibleTicks.push({
          date: new Date(current),
          x: cx,
          label: current.toLocaleString('default', { month: 'short', year: 'numeric' }),
          isMajor: true,
        });
        current.setUTCMonth(current.getUTCMonth() + 1);
      }
    } else {
      // Day-by-day/weekly ticks
      current.setUTCHours(0, 0, 0, 0);
      while (current <= dateMax && iterations < maxIterations) {
        iterations++;
        const cx = dateToX(current);

        const isStartOfWeek = current.getUTCDay() === 1; // Monday
        const isStartOfMonth = current.getUTCDate() === 1;

        visibleTicks.push({
          date: new Date(current),
          x: cx,
          label: isStartOfMonth
            ? current.toLocaleString('default', { month: 'short', year: 'numeric' })
            : current.toLocaleString('default', { day: '2-digit', month: 'short' }),
          isMajor: isStartOfMonth || isStartOfWeek || stepDays >= 7,
        });

        // Sub-ticks for hours (6:00, 12:00, 18:00) at higher zoom
        if (drawHours && stepDays === 1) {
          for (let h = 6; h < 24; h += 6) {
            const hourDate = new Date(current.getTime() + h * 60 * 60 * 1000);
            const hx = dateToX(hourDate);
            visibleTicks.push({
              date: hourDate,
              x: hx,
              label: `${h.toString().padStart(2, '0')}:00`,
              isMajor: false,
            });
          }
        }

        current.setUTCDate(current.getUTCDate() + stepDays);
      }
    }

    return visibleTicks;
  }, [dateMin, dateMax, zoom]);

  return (
    <div className="absolute bottom-0 left-0 w-full h-[86px] bg-slate-950/80 backdrop-blur-md border-t border-slate-900 pointer-events-none select-none z-10 overflow-hidden">
      {/* Horizonal Center Axis Line with soft neon glow */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />

      {ticks.map((tick, idx) => {
        const screenX = tick.x * zoom + viewportX;

        // Skip rendering if it drifted out of bounds (margin padding)
        if (screenX < -100 || screenX > windowWidth + 100) return null;

        return (
          <div
            key={idx}
            className="absolute top-0 flex flex-col items-center"
            style={{
              left: `${screenX}px`,
              transform: 'translateX(-50%)',
            }}
          >
            {/* Visual Indicator */}
            <div
              className={cn(
                "w-[1px] transition-all",
                tick.isMajor
                  ? "h-6.5 bg-indigo-400/90 shadow-[0_0_6px_rgba(99,102,241,0.5)] w-[1.5px]"
                  : "h-4 bg-slate-700/80 w-[1px]"
              )}
            />

            {/* Timestamp Label */}
            <span
              className={cn(
                "mt-1.5 font-mono tracking-wider",
                tick.isMajor ? "text-indigo-400 font-bold text-xs md:text-sm" : "text-slate-500 text-[10px] md:text-xs"
              )}
            >
              {tick.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Inner Canvas component wrapping React Flow context
 */
function CanvasInner({
  initialNodes,
  initialEdges,
  sessionUserId,
}: LifemapCanvasProps) {
  const { fitView, setCenter, screenToFlowPosition } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [hasInitView, setHasInitView] = useState(false);

  // Dialog / Modal states
  const [isOpenCreate, setIsOpenCreate] = useState(false);
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDateStr, setTargetDateStr] = useState(''); // Format: YYYY-MM-DDTHH:mm
  const [colorTheme, setColorTheme] = useState('indigo');
  const [tagsInput, setTagsInput] = useState('');
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  // Layout nodes on mount
  useEffect(() => {
    const arranged = layoutNodes(initialNodes);
    setNodes(arranged);
  }, [initialNodes, setNodes]);

  // Sync edges on change
  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  // Center on Today on initial mount
  useEffect(() => {
    if (nodes.length > 0 && !hasInitView) {
      const todayX = dateToX(new Date());
      setCenter(todayX, 0, { zoom: 0.85 });
      setHasInitView(true);
    }
  }, [nodes, setCenter, hasInitView]);

  // Helper: inject node actions in local state
  const handleEditNodeClick = useCallback((node: SerializedLifemapNode) => {
    setTitle(node.title);
    setDescription(node.description);
    // Format ISO to YYYY-MM-DDTHH:mm
    const dateObj = new Date(node.targetDate);
    // offset timezone to match local timezone in input
    const tzOffset = dateObj.getTimezoneOffset() * 60000;
    const localISOTime = new Date(dateObj.getTime() - tzOffset).toISOString().slice(0, 16);
    setTargetDateStr(localISOTime);
    setColorTheme(node.colorTheme);
    setTagsInput(node.tags.join(', '));
    setActiveNodeId(node.id);
    setIsOpenEdit(true);
  }, []);

  const handleDeleteNodeClick = useCallback(async (nodeId: string) => {
    if (!confirm('Are you sure you want to delete this node from your timeline?')) return;

    try {
      const res = await deleteLifemapNodeAction(nodeId);
      if (res.success) {
        setNodes((prev) => prev.filter((n) => n.id !== nodeId));
        toast.success('Node deleted.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete node.');
    }
  }, [setNodes]);

  // Map callbacks to React Flow nodes on data change
  const mappedNodes = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        y: node.position.y, // Pass Y coordinate into data so the node component can render the plumb line!
        onEdit: handleEditNodeClick,
        onDelete: handleDeleteNodeClick,
      },
    }));
  }, [nodes, handleEditNodeClick, handleDeleteNodeClick]);

  // Calculate dynamic boundary coordinates from active nodes
  const { minX, maxX } = useMemo(() => {
    if (nodes.length === 0) {
      const todayX = dateToX(new Date());
      return { minX: todayX, maxX: todayX };
    }
    const xPositions = nodes.map((n) => n.position.x);
    return {
      minX: Math.min(...xPositions),
      maxX: Math.max(...xPositions),
    };
  }, [nodes]);

  const BUFFER_X = PIXELS_PER_DAY * 180; // ~6 months

  // Optimistic UI connections & DB edge persistence
  const onConnect = useCallback(async (params: any) => {
    const newEdge = {
      ...params,
      id: `edge-${params.source}-${params.target}`,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#6366f1', strokeWidth: 2 },
    };

    // Optimistic UI update
    setEdges((eds) => addEdge(newEdge, eds));

    try {
      await saveLifemapEdgeAction({
        sourceId: params.source,
        targetId: params.target,
      });
      toast.success('Connection saved.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save connection.');
    }
  }, [setEdges]);

  // Triggered when dragging stops
  const handleNodeDragStop = useCallback(async (event: any, node: Node) => {
    // 1. Calculate new date strictly based on the final position.x
    const newDate = xToDate(node.position.x);

    // 2. Keep the local state updated (both X and Y are updated in React Flow automatically, but we sync node data targetDate)
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === node.id) {
          const updatedNodeData = {
            ...(n.data.node as any),
            targetDate: newDate.toISOString(),
          };
          return {
            ...n,
            position: { x: node.position.x, y: node.position.y },
            data: {
              ...n.data,
              node: updatedNodeData,
            },
          };
        }
        return n;
      })
    );

    // 3. Persist targetDate update to database
    try {
      await updateLifemapNodeAction(node.id, {
        targetDate: newDate.toISOString(),
      });
      
      const dateFormatted = newDate.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      toast.success(`Date updated to ${dateFormatted}`);
    } catch (err) {
      console.error('Failed to save dragged date:', err);
      toast.error('Failed to persist date change.');
    }
  }, [setNodes]);

  // Triggered on pane click (check for double click)
  const onPaneClick = useCallback((event: React.MouseEvent) => {
    if (event.detail !== 2) return; // Only process double-clicks

    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    // Convert screen/flow position.x to date
    const targetDate = xToDate(position.x);

    // Format targetDate to fit input datetime-local type (YYYY-MM-DDTHH:mm)
    const tzOffset = targetDate.getTimezoneOffset() * 60000;
    const localISOTime = new Date(targetDate.getTime() - tzOffset).toISOString().slice(0, 16);

    // Pre-fill form state
    setTitle('');
    setDescription('');
    setTargetDateStr(localISOTime);
    setColorTheme('indigo');
    setTagsInput('');
    setActiveNodeId(null);

    // Open creation modal
    setIsOpenCreate(true);
  }, [screenToFlowPosition]);

  // Create submission handler
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please provide a title.');
      return;
    }

    setIsSubmitting(true);
    try {
      const dateVal = new Date(targetDateStr);
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const res = await createLifemapNodeAction({
        title: title.trim(),
        description: description.trim(),
        targetDate: dateVal.toISOString(),
        tags,
        colorTheme,
      });

      if (res.success && res.node) {
        // Construct serialized node object
        const newNodeSerialized: SerializedLifemapNode = {
          id: res.node.id,
          title: res.node.title,
          description: res.node.description || '',
          targetDate: res.node.targetDate.toISOString(),
          tags: res.node.tags,
          colorTheme: res.node.colorTheme,
          createdAt: res.node.createdAt.toISOString(),
          updatedAt: res.node.updatedAt.toISOString(),
        };

        // Layout the node onto coordinates
        const x = dateToX(newNodeSerialized.targetDate);
        
        // Use standard height coordinate offset if clicked near Y (or just defaults to center 0)
        // Let's place it at Y = 0 on screen center, React Flow will auto-render it.
        const flowNode: Node = {
          id: res.node.id,
          type: 'lifemapNode',
          position: { x, y: 0 },
          data: {
            node: newNodeSerialized,
            onEdit: handleEditNodeClick,
            onDelete: handleDeleteNodeClick,
          },
        };

        setNodes((prev) => [...prev, flowNode]);
        setIsOpenCreate(false);
        toast.success('Node dropped successfully!');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to drop node.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit submission handler
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeNodeId || !title.trim()) return;

    setIsSubmitting(true);
    try {
      const dateVal = new Date(targetDateStr);
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const res = await updateLifemapNodeAction(activeNodeId, {
        title: title.trim(),
        description: description.trim(),
        targetDate: dateVal.toISOString(),
        tags,
        colorTheme,
      });

      if (res.success && res.node) {
        const updatedNodeSerialized: SerializedLifemapNode = {
          id: res.node.id,
          title: res.node.title,
          description: res.node.description || '',
          targetDate: res.node.targetDate.toISOString(),
          tags: res.node.tags,
          colorTheme: res.node.colorTheme,
          createdAt: res.node.createdAt.toISOString(),
          updatedAt: res.node.updatedAt.toISOString(),
        };

        // Calculate new X position based on new targetDate
        const newX = dateToX(updatedNodeSerialized.targetDate);

        setNodes((prev) =>
          prev.map((n) => {
            if (n.id === activeNodeId) {
              return {
                ...n,
                position: { x: newX, y: n.position.y }, // shift horizontally based on date, keep vertical Y stack
                data: {
                  ...n.data,
                  node: updatedNodeSerialized,
                },
              };
            }
            return n;
          })
        );

        setIsOpenEdit(false);
        toast.success('Node updated successfully!');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update node.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Navigation: Go to Today function
  const handleGoToToday = useCallback(() => {
    const todayX = dateToX(new Date());
    setCenter(todayX, 0, { zoom: 0.85, duration: 800 });
  }, [setCenter]);

  return (
    <div className="w-full h-full relative">
      {/* Header HUD panel (Glassmorphic) */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-1 bg-slate-950/70 border border-slate-900 px-4 py-3 rounded-xl backdrop-blur-md shadow-2xl pointer-events-auto">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-indigo-400" />
          <h1 className="text-sm font-black uppercase tracking-wider bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
            LIFEMAP TIMELINE
          </h1>
        </div>
        <p className="text-[10px] text-slate-400">
          Double-click empty canvas to drop a milestone. Drag horizontally to change date, vertically to stack.
        </p>
      </div>

      {/* Control panel buttons (Go to Today, etc.) */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <button
          onClick={handleGoToToday}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-slate-900 border border-slate-800 text-indigo-400 hover:text-indigo-300 hover:bg-slate-800 hover:border-slate-700 transition-all shadow-md"
        >
          <Navigation size={12} className="rotate-45" />
          Today
        </button>
      </div>

      {/* React Flow Viewport */}
      <ReactFlow
        nodes={mappedNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={handleNodeDragStop}
        onPaneClick={onPaneClick}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        translateExtent={[
          [minX - BUFFER_X, -Infinity],
          [maxX + BUFFER_X, Infinity]
        ]}
        minZoom={0.03}
        maxZoom={1.5}
        className="w-full h-full"
      >
        <Background color="rgba(255, 255, 255, 0.03)" gap={20} size={1} />
        <Controls className="!bg-slate-900 !border-slate-800 !text-slate-100 !rounded-lg" />
        <TimelineRuler />
      </ReactFlow>

      {/* --- Sleek Dialogs for Drop/Edit Node --- */}

      {/* CREATE NODE DIALOG */}
      <Dialog open={isOpenCreate} onOpenChange={setIsOpenCreate}>
        <DialogContent className="sm:max-w-[425px] bg-slate-950 border border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-slate-100 text-md font-bold flex items-center gap-2">
              <Plus className="text-indigo-400" size={16} /> Drop a Lifemap Node
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Positioned on the timeline at the double-clicked moment. You can adjust the exact time below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Completed Advanced Agentic Coding Project"
                className="w-full p-2.5 rounded-lg border border-slate-800 bg-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What details would you like to note down?"
                rows={3}
                className="w-full p-2.5 rounded-lg border border-slate-800 bg-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Target Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={targetDateStr}
                  onChange={(e) => setTargetDateStr(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-800 bg-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-100"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Color Theme</label>
                <select
                  value={colorTheme}
                  onChange={(e) => setColorTheme(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-800 bg-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-100"
                >
                  <option value="indigo">Indigo</option>
                  <option value="emerald">Emerald</option>
                  <option value="violet">Violet</option>
                  <option value="blue">Blue</option>
                  <option value="amber">Amber</option>
                  <option value="rose">Rose</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Tags (Comma Separated)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. career, coding, goal"
                className="w-full p-2.5 rounded-lg border border-slate-800 bg-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <DialogFooter className="pt-2">
              <button
                type="button"
                onClick={() => setIsOpenCreate(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 bg-slate-900 hover:bg-slate-800 hover:text-white rounded-lg border border-slate-800 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmitting && <Loader2 size={12} className="animate-spin" />}
                Drop Node
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT NODE DIALOG */}
      <Dialog open={isOpenEdit} onOpenChange={setIsOpenEdit}>
        <DialogContent className="sm:max-w-[425px] bg-slate-950 border border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-slate-100 text-md font-bold flex items-center gap-2">
              <Edit className="text-indigo-400" size={16} /> Edit Lifemap Node
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Update the milestones details, color coding, or date parameters.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 pt-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-800 bg-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full p-2.5 rounded-lg border border-slate-800 bg-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Target Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={targetDateStr}
                  onChange={(e) => setTargetDateStr(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-800 bg-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-100"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Color Theme</label>
                <select
                  value={colorTheme}
                  onChange={(e) => setColorTheme(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-800 bg-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-100"
                >
                  <option value="indigo">Indigo</option>
                  <option value="emerald">Emerald</option>
                  <option value="violet">Violet</option>
                  <option value="blue">Blue</option>
                  <option value="amber">Amber</option>
                  <option value="rose">Rose</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Tags (Comma Separated)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-800 bg-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <DialogFooter className="pt-2">
              <button
                type="button"
                onClick={() => setIsOpenEdit(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 bg-slate-900 hover:bg-slate-800 hover:text-white rounded-lg border border-slate-800 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmitting && <Loader2 size={12} className="animate-spin" />}
                Save Changes
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function LifemapCanvas(props: LifemapCanvasProps) {
  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-950">
      <ReactFlowProvider>
        <CanvasInner
          initialNodes={props.initialNodes}
          initialEdges={props.initialEdges}
          sessionUserId={props.sessionUserId}
        />
      </ReactFlowProvider>
    </div>
  );
}
