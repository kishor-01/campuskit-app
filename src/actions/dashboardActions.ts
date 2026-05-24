// src/actions/dashboardActions.ts
// Student Command Center — Data Engine
'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { computeNodeStatuses } from '@/lib/graphEngine';

export interface ActiveRoadmapSummary {
  roadmapId: string;
  slug: string;
  title: string;
  description: string;
  totalNodes: number;
  completedNodes: number;
  progressPercentage: number;
  /** First UNLOCKED node ID — used for "Resume Learning" deep-link */
  nextActionableNodeId: string | null;
}

export async function getUserDashboardDataAction(): Promise<{
  user: { name: string | null; email: string | null; image: string | null };
  activeRoadmaps: ActiveRoadmapSummary[];
} | null> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  // ── 1. Find all roadmaps where the user has ≥1 COMPLETED node ────────────
  const progressRecords = await prisma.userNodeProgress.findMany({
    where: { userId, status: 'COMPLETED' },
    select: { nodeId: true },
  });
  const completedNodeIds = new Set(progressRecords.map((p) => p.nodeId));

  if (completedNodeIds.size === 0) {
    return {
      user: { name: session.user?.name ?? null, email: session.user?.email ?? null, image: session.user?.image ?? null },
      activeRoadmaps: [],
    };
  }

  // Find which roadmaps those completed nodes belong to
  const activeNodes = await prisma.learningNode.findMany({
    where: { id: { in: [...completedNodeIds] } },
    select: { roadmapId: true },
    distinct: ['roadmapId'],
  });
  const activeRoadmapIds = activeNodes.map((n) => n.roadmapId);

  // ── 2. Fetch full graph data for each active roadmap ─────────────────────
  const roadmaps = await prisma.roadmap.findMany({
    where: { id: { in: activeRoadmapIds }, isPublished: true },
    include: {
      learningNodes: {
        select: { id: true, positionX: true, positionY: true },
        orderBy: { createdAt: 'asc' },
      },
      learningEdges: {
        select: { sourceNodeId: true, targetNodeId: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  // ── 3. Compute progress + next actionable node for each roadmap ───────────
  const activeRoadmaps: ActiveRoadmapSummary[] = roadmaps.map((roadmap) => {
    const graphNodes = roadmap.learningNodes.map((n) => ({ id: n.id }));
    const graphEdges = roadmap.learningEdges.map((e) => ({
      sourceNodeId: e.sourceNodeId,
      targetNodeId: e.targetNodeId,
    }));

    const statusMap = computeNodeStatuses(graphNodes, graphEdges, completedNodeIds);

    const totalNodes = roadmap.learningNodes.length;
    const completedNodes = roadmap.learningNodes.filter((n) => completedNodeIds.has(n.id)).length;
    const progressPercentage = totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;

    // First UNLOCKED node (stable order = creation order)
    const nextActionableNodeId =
      roadmap.learningNodes.find((n) => statusMap.get(n.id) === 'UNLOCKED')?.id ?? null;

    return {
      roadmapId: roadmap.id,
      slug: roadmap.slug,
      title: roadmap.title,
      description: roadmap.description ?? '',
      totalNodes,
      completedNodes,
      progressPercentage,
      nextActionableNodeId,
    };
  });

  return {
    user: {
      name: session.user?.name ?? null,
      email: session.user?.email ?? null,
      image: session.user?.image ?? null,
    },
    activeRoadmaps,
  };
}
