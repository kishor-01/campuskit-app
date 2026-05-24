'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export interface SaveLifemapEdgeInput {
  sourceId: string;
  targetId: string;
}

/**
 * Saves a connection edge between two LifemapNode milestones.
 * Performs a safe upsert to prevent duplicate edge keys.
 */
export async function saveLifemapEdgeAction(data: SaveLifemapEdgeInput) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  const userId = session.user.id;

  const { sourceId, targetId } = data;

  if (sourceId === targetId) {
    throw new Error('Cannot connect a node to itself');
  }

  const edge = await prisma.lifemapEdge.upsert({
    where: {
      userId_sourceId_targetId: {
        userId,
        sourceId,
        targetId,
      },
    },
    update: {}, // No updates needed if it already exists
    create: {
      userId,
      sourceId,
      targetId,
    },
  });

  return { success: true, edge };
}
