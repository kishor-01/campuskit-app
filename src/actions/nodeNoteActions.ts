// src/actions/nodeNoteActions.ts
'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';

/**
 * saveNodeNoteAction
 *
 * Upserts a UserNodeNote for the authenticated user.
 * Returns { success: true } or { error: string }.
 * Does NOT revalidate the path — the note is purely a user workspace asset
 * and the server page does not render it (the drawer is client-side).
 */
export async function saveNodeNoteAction(nodeId: string, content: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'You must be logged in to save a note.' };
  }

  const userId = session.user.id;

  try {
    await prisma.userNodeNote.upsert({
      where: {
        userId_nodeId: { userId, nodeId },
      },
      create: {
        userId,
        nodeId,
        content,
      },
      update: {
        content,
      },
    });

    return { success: true };
  } catch (e: any) {
    console.error('[saveNodeNoteAction] error:', e);
    return { error: 'Failed to save note.' };
  }
}

/**
 * getNodeNotesForUserAction
 *
 * Fetches all UserNodeNotes for the authenticated user within a given set of nodeIds.
 * Returns a Record<nodeId, content> map.
 */
export async function getNodeNotesForUserAction(nodeIds: string[]) {
  const session = await auth();
  if (!session?.user?.id || nodeIds.length === 0) {
    return {} as Record<string, string>;
  }

  const userId = session.user.id;

  try {
    const notes = await prisma.userNodeNote.findMany({
      where: {
        userId,
        nodeId: { in: nodeIds },
      },
      select: { nodeId: true, content: true },
    });

    return Object.fromEntries(notes.map((n) => [n.nodeId, n.content]));
  } catch (e: any) {
    console.error('[getNodeNotesForUserAction] error:', e);
    return {} as Record<string, string>;
  }
}
