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

// ─── Recommendation Engine ────────────────────────────────────────────────────
// Extracts topic keywords from the user's active/completed roadmap titles and
// prerequisite tags, then finds Opportunities that hasSome match on skillsRequired.
export async function getRecommendedOpportunitiesAction() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return [];

  // 1. Get roadmaps the user has touched (≥1 completed node)
  const progressRecords = await prisma.userNodeProgress.findMany({
    where: { userId, status: 'COMPLETED' },
    select: { nodeId: true },
  });
  if (progressRecords.length === 0) return [];

  const completedNodeIds = progressRecords.map((p) => p.nodeId);

  const activeNodes = await prisma.learningNode.findMany({
    where: { id: { in: completedNodeIds } },
    select: { roadmapId: true },
    distinct: ['roadmapId'],
  });
  if (activeNodes.length === 0) return [];

  const roadmapIds = activeNodes.map((n) => n.roadmapId);

  // 2. Fetch roadmap titles and prerequisite tags as keyword sources
  const roadmaps = await prisma.roadmap.findMany({
    where: { id: { in: roadmapIds } },
    select: { title: true, prerequisites: true },
  });

  // 3. Build keyword set — extract meaningful words from titles + prerequisites
  const STOP_WORDS = new Set([
    'the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'for', 'with', 'on', 'at',
    'from', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'it', 'its',
    'this', 'that', 'complete', 'guide', 'full', 'course', 'fundamentals',
    'introduction', 'intro', 'basics', 'advanced', 'master', 'mastery', 'learning',
    'roadmap', 'path', 'zero', 'hero',
  ]);

  const keywords = new Set<string>();

  for (const roadmap of roadmaps) {
    // Tokenize title into individual meaningful words
    roadmap.title
      .toLowerCase()
      .replace(/[^a-z0-9\s.#+]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 3 && !STOP_WORDS.has(w))
      .forEach((w) => keywords.add(w));

    // Add full title as a compound keyword
    keywords.add(roadmap.title.trim());

    // Add prerequisites as-is (they are already skill tags)
    roadmap.prerequisites.forEach((p) => keywords.add(p.trim()));
  }

  if (keywords.size === 0) return [];

  const keywordArray = [...keywords];

  // 4. Query PUBLISHED opportunities — hasSome match against skillsRequired
  const matches = await prisma.opportunity.findMany({
    where: {
      status: 'PUBLISHED',
      skillsRequired: { hasSome: keywordArray },
    },
    orderBy: { createdAt: 'desc' },
    take: 20, // over-fetch for JS-side tier sorting
  });

  if (matches.length === 0) return [];

  // 5. Sort by tier priority: TIER_1 > TIER_2 > TIER_3
  const TIER_RANK: Record<string, number> = { TIER_1: 0, TIER_2: 1, TIER_3: 2 };
  return matches
    .sort((a, b) => (TIER_RANK[a.tier] ?? 2) - (TIER_RANK[b.tier] ?? 2))
    .slice(0, 4);
}

