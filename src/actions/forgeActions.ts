// src/actions/forgeActions.ts
// Admin Graph Forge — Server Actions for visual DAG editing
'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { Role } from '@prisma/client';
import { revalidatePath } from 'next/cache';

// ─── Auth Guard ───────────────────────────────────────────────────────────────
async function requireAdmin() {
  const session = await auth();
  const user = session?.user;

  const roleHierarchy: Record<string, number> = {
    VIEWER: 0, CONTRIBUTOR: 1, EDITOR: 2, ADMIN: 3, SUPER_ADMIN: 4,
  };

  const userLevel = roleHierarchy[user?.role ?? 'VIEWER'] ?? 0;
  if (!user || userLevel < roleHierarchy['ADMIN']) {
    throw new Error('Unauthorized: Admin access required.');
  }
  return user;
}

function revalidateForge(slug: string) {
  revalidatePath(`/admin/forge/${slug}`);
  revalidatePath(`/roadmaps/${slug}`);
}

// ─── 1. Create a blank node at a canvas position ──────────────────────────────
export async function createLearningNodeAction(
  roadmapId: string,
  slug: string,
  x: number,
  y: number
) {
  await requireAdmin();

  const node = await prisma.learningNode.create({
    data: {
      roadmapId,
      title: 'New Node',
      briefing: '',
      type: 'concept',
      positionX: x,
      positionY: y,
    },
  });

  revalidateForge(slug);
  return { success: true, node };
}

// ─── 2. Update node position after drag-stop ──────────────────────────────────
export async function updateNodePositionAction(
  nodeId: string,
  slug: string,
  x: number,
  y: number
) {
  await requireAdmin();

  await prisma.learningNode.update({
    where: { id: nodeId },
    data: { positionX: x, positionY: y },
  });

  revalidatePath(`/roadmaps/${slug}`);
  return { success: true };
}

// ─── 3. Update node data (title, type, briefing, knowledgeCheck, seniorInsight) ────────
export async function updateLearningNodeDataAction(
  nodeId: string,
  slug: string,
  data: { title: string; type: string; briefing: string; knowledgeCheck?: string; seniorInsight?: string }
) {
  await requireAdmin();

  const node = await prisma.learningNode.update({
    where: { id: nodeId },
    data: {
      title: data.title,
      type: data.type,
      briefing: data.briefing,
      knowledgeCheck: data.knowledgeCheck ?? null,
      seniorInsight: data.seniorInsight ?? null,
    },
  });

  revalidateForge(slug);
  return { success: true, node };
}

// ─── 4. Delete node (cascades edges via schema) ───────────────────────────────
export async function deleteLearningNodeAction(nodeId: string, slug: string) {
  await requireAdmin();

  await prisma.learningNode.delete({ where: { id: nodeId } });

  revalidateForge(slug);
  return { success: true };
}

// ─── 5. Create an edge (DAG prerequisite relationship) ────────────────────────
export async function createLearningEdgeAction(
  roadmapId: string,
  slug: string,
  sourceNodeId: string,
  targetNodeId: string
) {
  await requireAdmin();

  // Prevent self-loops
  if (sourceNodeId === targetNodeId) {
    return { error: 'A node cannot depend on itself.' };
  }

  // Prevent duplicate edges (upsert-style)
  const existing = await prisma.learningEdge.findUnique({
    where: { sourceNodeId_targetNodeId: { sourceNodeId, targetNodeId } },
  });

  if (existing) return { success: true, edge: existing }; // already wired

  const edge = await prisma.learningEdge.create({
    data: { roadmapId, sourceNodeId, targetNodeId },
  });

  revalidateForge(slug);
  return { success: true, edge };
}

// ─── 6. Delete an edge ────────────────────────────────────────────────────────
export async function deleteLearningEdgeAction(edgeId: string, slug: string) {
  await requireAdmin();

  await prisma.learningEdge.delete({ where: { id: edgeId } });

  revalidateForge(slug);
  return { success: true };
}

// ─── 7. Create an affiliate resource attached to a node ──────────────────────
export async function createAffiliateResourceAction(data: {
  nodeId: string;
  slug: string;
  title: string;
  description: string;
  url: string;
  type: 'COURSE' | 'BOOK' | 'TOOL' | 'ARTICLE';
  isPremium: boolean;
}) {
  await requireAdmin();

  const resource = await prisma.affiliateResource.create({
    data: {
      nodeId: data.nodeId,
      title: data.title,
      description: data.description,
      url: data.url,
      type: data.type,
      isPremium: data.isPremium,
    },
  });

  revalidatePath(`/roadmaps/${data.slug}`);
  revalidatePath(`/admin/forge/${data.slug}`);
  return { success: true, resource };
}

// ─── 8. Delete an affiliate resource ─────────────────────────────────────────
export async function deleteAffiliateResourceAction(resourceId: string, slug: string) {
  await requireAdmin();

  await prisma.affiliateResource.delete({ where: { id: resourceId } });

  revalidatePath(`/roadmaps/${slug}`);
  revalidatePath(`/admin/forge/${slug}`);
  return { success: true };
}

// ─── 9. Update roadmap metadata (contextual AI context + user display) ─────────
export async function updateRoadmapMetadataAction(
  roadmapId: string,
  slug: string,
  data: {
    title: string;
    description: string;
    targetAudience: string;
    prerequisiteText: string;
    estimatedTime: string;
    outcomes: string;
  }
) {
  await requireAdmin();

  if (!data.title.trim()) {
    return { success: false, error: 'Title is required.' };
  }

  const roadmap = await prisma.roadmap.update({
    where: { id: roadmapId },
    data: {
      title: data.title.trim(),
      description: data.description.trim(),
      targetAudience: data.targetAudience.trim() || null,
      prerequisiteText: data.prerequisiteText.trim() || null,
      estimatedTime: data.estimatedTime.trim() || null,
      outcomes: data.outcomes.trim() || null,
    },
    select: { slug: true },
  });

  revalidatePath(`/admin/forge/${slug}`);
  revalidatePath(`/admin/forge/${roadmap.slug}`);
  revalidatePath(`/roadmaps/${slug}`);
  revalidatePath(`/roadmaps/${roadmap.slug}`);
  return { success: true };
}
