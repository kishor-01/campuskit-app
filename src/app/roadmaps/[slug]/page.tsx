import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { computeNodeStatuses } from '@/lib/graphEngine';
import { Suspense } from 'react';
import ConstellationView from './ConstellationView';
import type { ConstellationNode, ConstellationEdge } from './ConstellationCanvas';
import type { NodeStatus } from '@/lib/graphEngine';
import { seedConstellationAction } from '@/actions/seedConstellationAction';
import { Sparkles, GitBranch, Lock, Zap, CheckCircle2 } from 'lucide-react';

// ─── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const roadmap = await prisma.roadmap.findUnique({
    where: { slug, isPublished: true },
    select: { title: true, description: true },
  });

  return {
    title: roadmap ? `${roadmap.title} — Skill Graph` : 'Roadmap',
    description: roadmap?.description ?? 'Interactive skill constellation graph.',
  };
}

// ─── Page Component ───────────────────────────────────────────────────────────
export default async function RoadmapDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  const userId = session?.user?.id ?? null;

  // ── 1. Fetch Roadmap with its Constellation Graph ──────────────────────────
  const roadmap = await prisma.roadmap.findUnique({
    where: { slug, isPublished: true },
    include: {
      learningNodes: {
        orderBy: { createdAt: 'asc' },
        include: { affiliateResources: { orderBy: { createdAt: 'asc' } } },
      },
      learningEdges: true,
    },
  });

  if (!roadmap) notFound();

  // ── 2. Empty State — no nodes seeded yet ──────────────────────────────────
  if (roadmap.learningNodes.length === 0) {
    // Bind the roadmapId as the first argument.
    // Next.js natively supports bound Server Actions as form actions.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const seedThisRoadmap = seedConstellationAction.bind(null, roadmap.id) as any;

    return (
      <div className="fixed inset-0 bg-[#020817] flex items-center justify-center">
        {/* Subtle dot grid background */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle, #1e293b 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Glow orb */}
        <div className="absolute w-[500px] h-[500px] rounded-full bg-violet-600/5 blur-3xl pointer-events-none" />

        {/* Card */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-md px-8 py-10 rounded-2xl border border-slate-800/80 bg-slate-950/80 backdrop-blur-md shadow-2xl">

          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-5">
            <GitBranch className="w-7 h-7 text-violet-400" />
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-slate-100 mb-2">
            No Skill Graph Yet
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-1">
            <span className="font-semibold text-slate-300">{roadmap.title}</span> doesn&apos;t have a constellation graph seeded yet.
          </p>
          <p className="text-xs text-slate-500 leading-relaxed mb-7">
            Click below to instantly populate a demo DAG with 5 connected skill nodes so you can see the Constellation Engine in action.
          </p>

          {/* State legend preview */}
          <div className="flex items-center gap-5 mb-8 py-3 px-5 rounded-xl bg-slate-900/60 border border-slate-800/50 w-full justify-center">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] text-slate-400 font-medium">Completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
              <span className="text-[10px] text-slate-400 font-medium">Unlocked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-[10px] text-slate-400 font-medium">Locked</span>
            </div>
          </div>

          {/* Seed Form — Server Action */}
          <form action={seedThisRoadmap} className="w-full">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200
                bg-gradient-to-r from-violet-600 to-indigo-600
                hover:from-violet-500 hover:to-indigo-500
                hover:shadow-[0_0_24px_rgba(139,92,246,0.35)]
                active:scale-[0.98] cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Ignite Constellation Graph
            </button>
          </form>

          <p className="text-[10px] text-slate-600 mt-4">
            Seeds a 5-node demo graph. Safe to run multiple times.
          </p>
        </div>
      </div>
    );
  }

  // ── 3. Fetch User Progress (completed node IDs) ────────────────────────────
  const userProgressRecords = userId
    ? await prisma.userNodeProgress.findMany({
        where: {
          userId,
          nodeId: { in: roadmap.learningNodes.map((n) => n.id) },
          status: 'COMPLETED',
        },
        select: { nodeId: true },
      })
    : [];

  const completedNodeIds = new Set(userProgressRecords.map((p) => p.nodeId));

  // ── 3b. Fetch user node notes (cloud-synced) ──────────────────────────────
  const nodeIds = roadmap.learningNodes.map((n) => n.id);
  const userNoteRecords = userId
    ? await prisma.userNodeNote.findMany({
        where: { userId, nodeId: { in: nodeIds } },
        select: { nodeId: true, content: true },
      })
    : [];

  // nodeId → note content map (empty string if no note exists)
  const noteContentMap: Record<string, string> = Object.fromEntries(
    userNoteRecords.map((n) => [n.nodeId, n.content])
  );

  // ── 4. Compute Status Map via Graph Engine ─────────────────────────────────
  const graphNodes = roadmap.learningNodes.map((n) => ({ id: n.id }));
  const graphEdges = roadmap.learningEdges.map((e) => ({
    sourceNodeId: e.sourceNodeId,
    targetNodeId: e.targetNodeId,
  }));

  const statusMap = computeNodeStatuses(graphNodes, graphEdges, completedNodeIds);

  // ── 5. Shape data for the Canvas ──────────────────────────────────────────
  const constellationNodes: ConstellationNode[] = roadmap.learningNodes.map((n) => ({
    id: n.id,
    title: n.title,
    briefing: n.briefing,
    type: n.type as 'concept' | 'practice' | 'milestone',
    positionX: n.positionX,
    positionY: n.positionY,
    status: (statusMap.get(n.id) ?? 'LOCKED') as NodeStatus,
    affiliateResources: n.affiliateResources.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      url: r.url,
      type: r.type,
      isPremium: r.isPremium,
    })),
  }));

  const constellationEdges: ConstellationEdge[] = roadmap.learningEdges.map((e) => ({
    id: e.id,
    sourceNodeId: e.sourceNodeId,
    targetNodeId: e.targetNodeId,
    sourceStatus: (statusMap.get(e.sourceNodeId) ?? 'LOCKED') as NodeStatus,
    targetStatus: (statusMap.get(e.targetNodeId) ?? 'LOCKED') as NodeStatus,
  }));

  // ── 6. Render full-screen canvas ───────────────────────────────────────────
  return (
    <div className="fixed inset-0 overflow-hidden bg-[#020817]">
      {/* Header overlay */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-3 bg-gradient-to-b from-slate-950/90 via-slate-950/50 to-transparent pointer-events-none">
        <div>
          <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mb-0.5">
            Skill Graph · Constellation Engine
          </p>
          <h1 className="text-lg font-bold text-slate-100 tracking-tight">
            {roadmap.title}
          </h1>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 pointer-events-none">
          <LegendItem icon={<Lock className="w-2.5 h-2.5 text-slate-600" />} label="Locked" />
          <LegendItem icon={<Zap className="w-2.5 h-2.5 text-violet-400 animate-pulse" />} label="Unlocked" />
          <LegendItem icon={<CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />} label="Completed" />
        </div>
      </div>

      {/* Full-screen Canvas + Drawer (client-owned state) */}
      <div className="absolute inset-0">
        <Suspense fallback={null}>
          <ConstellationView
            nodes={constellationNodes}
            edges={constellationEdges}
            roadmapTitle={roadmap.title}
            roadmapId={roadmap.id}
            noteContentMap={noteContentMap}
          />
        </Suspense>
      </div>
    </div>
  );
}

// ─── Legend Item ──────────────────────────────────────────────────────────────
function LegendItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {icon}
      <span className="text-[10px] text-slate-400 font-medium tracking-wide">{label}</span>
    </div>
  );
}