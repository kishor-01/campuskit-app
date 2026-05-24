// src/actions/nodeProgressActions.ts
'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { recordUserActivity } from '@/lib/streakService';

/**
 * completeNodeAction
 *
 * Upserts a UserNodeProgress record to COMPLETED for the authenticated user.
 * Revalidates the roadmap slug route so the server component re-computes the
 * graph status map and streams fresh data to the canvas.
 */
export async function completeNodeAction(nodeId: string, roadmapId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'You must be logged in to complete a node.' };
  }

  const userId = session.user.id;

  try {
    // Verify the node belongs to the roadmap
    const node = await prisma.learningNode.findUnique({
      where: { id: nodeId },
      select: { id: true, roadmapId: true },
    });

    if (!node || node.roadmapId !== roadmapId) {
      return { error: 'Node not found or does not belong to this roadmap.' };
    }

    // Upsert progress record → COMPLETED
    await prisma.userNodeProgress.upsert({
      where: {
        userId_nodeId: { userId, nodeId },
      },
      create: {
        userId,
        nodeId,
        status: 'COMPLETED',
        completedAt: new Date(),
      },
      update: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    // ── Ecosystem Unification: Trigger global user activity tracking ──────────
    recordUserActivity(userId).catch((err) => {
      console.error('[Streak] Error recording user activity from node completion:', err);
    });

    // Resolve the roadmap slug for cache revalidation
    const roadmap = await prisma.roadmap.findUnique({
      where: { id: roadmapId },
      select: { slug: true },
    });

    if (roadmap) {
      revalidatePath(`/roadmaps/${roadmap.slug}`);
    }

    return { success: true };
  } catch (e: any) {
    console.error('[completeNodeAction] error:', e);
    return { error: 'Failed to mark node as complete.' };
  }
}
