'use server';

/**
 * seedConstellationAction.ts
 *
 * Seeds 5 LearningNodes + 4 LearningEdges into a specific roadmap by ID.
 * Designed to be bound and used as a Next.js Server Action form handler:
 *
 *   const seedThisRoadmap = seedConstellationAction.bind(null, roadmap.id);
 *   <form action={seedThisRoadmap}><button type="submit">Seed</button></form>
 *
 * DAG structure:
 *   [Foundations] ──► [Core Concepts] ──► [Advanced Patterns]
 *                          │
 *                          └──► [Practical Project] ──► [Ship It 🚀]
 *
 * When called by a logged-in user: marks "Foundations" as COMPLETED → cascade demo.
 * When called by a guest: nodes are seeded, root node shows as UNLOCKED.
 * Ends with revalidatePath so the page re-fetches and renders the canvas immediately.
 */

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function seedConstellationAction(roadmapId: string, _formData?: FormData) {
  // Resolve the roadmap by ID
  const roadmap = await prisma.roadmap.findUnique({
    where: { id: roadmapId, isPublished: true },
    select: { id: true, slug: true, title: true },
  });

  if (!roadmap) {
    return { success: false, error: 'Roadmap not found or not published.' };
  }

  // Wipe existing constellation data — makes this action idempotent
  await prisma.learningEdge.deleteMany({ where: { roadmapId: roadmap.id } });
  await prisma.learningNode.deleteMany({ where: { roadmapId: roadmap.id } });

  // ── Create 5 nodes ────────────────────────────────────────────────────────
  const nodePayloads = [
    {
      title: 'Foundations',
      briefing:
        'Master the essential building blocks. Variables, control flow, data structures. This node unlocks everything else.',
      type: 'concept',
      positionX: 80,
      positionY: 200,
    },
    {
      title: 'Core Concepts',
      briefing:
        'Deep-dive into the paradigm-defining patterns. Functions, closures, async/await, and the event loop.',
      type: 'concept',
      positionX: 380,
      positionY: 200,
    },
    {
      title: 'Advanced Patterns',
      briefing:
        'Architectural patterns that separate senior engineers from juniors. Design patterns, SOLID principles, hexagonal architecture.',
      type: 'practice',
      positionX: 680,
      positionY: 80,
    },
    {
      title: 'Practical Project',
      briefing:
        'Build a real-world application applying everything learned so far. Portfolio-grade project with full deployment.',
      type: 'practice',
      positionX: 680,
      positionY: 340,
    },
    {
      title: 'Ship It 🚀',
      briefing:
        "You've done the work. Deploy to production, write a case study, and share with the world. Milestone unlocked.",
      type: 'milestone',
      positionX: 980,
      positionY: 340,
    },
  ];

  const createdNodes = await Promise.all(
    nodePayloads.map((n) =>
      prisma.learningNode.create({
        data: {
          roadmapId: roadmap.id,
          title: n.title,
          briefing: n.briefing,
          type: n.type,
          positionX: n.positionX,
          positionY: n.positionY,
        },
      })
    )
  );

  const [foundations, coreConcepts, advancedPatterns, practicalProject, shipIt] = createdNodes;

  // ── Create prerequisite edges (DAG) ───────────────────────────────────────
  const edgePayloads = [
    { sourceNodeId: foundations.id,       targetNodeId: coreConcepts.id },
    { sourceNodeId: coreConcepts.id,      targetNodeId: advancedPatterns.id },
    { sourceNodeId: coreConcepts.id,      targetNodeId: practicalProject.id },
    { sourceNodeId: practicalProject.id,  targetNodeId: shipIt.id },
  ];

  await Promise.all(
    edgePayloads.map((e) =>
      prisma.learningEdge.create({
        data: {
          roadmapId: roadmap.id,
          sourceNodeId: e.sourceNodeId,
          targetNodeId: e.targetNodeId,
        },
      })
    )
  );

  // ── If logged in: mark "Foundations" COMPLETED so the cascade is visible ──
  const session = await auth();
  if (session?.user?.id) {
    await prisma.userNodeProgress.upsert({
      where: {
        userId_nodeId: { userId: session.user.id, nodeId: foundations.id },
      },
      create: {
        userId: session.user.id,
        nodeId: foundations.id,
        status: 'COMPLETED',
        completedAt: new Date(),
      },
      update: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });
  }

  // ── Revalidate the roadmap page so it re-renders with the new nodes ───────
  revalidatePath(`/roadmaps/${roadmap.slug}`);

  return {
    success: true,
    nodesCreated: createdNodes.length,
    edgesCreated: edgePayloads.length,
  };
}
