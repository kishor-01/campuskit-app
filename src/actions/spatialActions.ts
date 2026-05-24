'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';

interface NodePositionInput {
  stepId: string;
  positionX: number;
  positionY: number;
}

export async function saveNodePositionsAction(roadmapId: string, positions: NodePositionInput[]) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  const userId = session.user.id;

  // Execute batch upserts securely inside a transaction
  await prisma.$transaction(
    positions.map((pos) =>
      prisma.userNodePosition.upsert({
        where: {
          userId_roadmapId_stepId: {
            userId,
            roadmapId,
            stepId: pos.stepId,
          },
        },
        update: {
          positionX: pos.positionX,
          positionY: pos.positionY,
        },
        create: {
          userId,
          roadmapId,
          stepId: pos.stepId,
          positionX: pos.positionX,
          positionY: pos.positionY,
        },
      })
    )
  );

  return { success: true };
}

export async function spawnStickyNoteAction(roadmapId: string, positionX: number, positionY: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  const userId = session.user.id;

  const note = await prisma.userStepNote.create({
    data: {
      userId,
      roadmapId,
      positionX,
      positionY,
      content: '',
      color: 'yellow',
    },
  });

  return { success: true, note };
}

export async function updateStickyNoteAction(
  noteId: string,
  content?: string,
  color?: string,
  positionX?: number,
  positionY?: number
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  const userId = session.user.id;

  // Verify ownership
  const existing = await prisma.userStepNote.findUnique({
    where: { id: noteId },
  });
  if (!existing || existing.userId !== userId) {
    throw new Error('Forbidden');
  }

  const updated = await prisma.userStepNote.update({
    where: { id: noteId },
    data: {
      ...(content !== undefined && { content }),
      ...(color !== undefined && { color }),
      ...(positionX !== undefined && { positionX }),
      ...(positionY !== undefined && { positionY }),
    },
  });

  return { success: true, note: updated };
}

export async function deleteStickyNoteAction(noteId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  const userId = session.user.id;

  // Verify ownership
  const existing = await prisma.userStepNote.findUnique({
    where: { id: noteId },
  });
  if (!existing || existing.userId !== userId) {
    throw new Error('Forbidden');
  }

  await prisma.userStepNote.delete({
    where: { id: noteId },
  });

  return { success: true };
}
