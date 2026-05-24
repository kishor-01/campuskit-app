'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export interface LifemapNodeInput {
  title: string;
  description?: string;
  targetDate: string; // ISO string representation
  tags: string[];
  colorTheme?: string;
}

/**
 * Fetches all Lifemap nodes belonging to the authenticated user.
 */
export async function getLifemapNodesAction() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  const userId = session.user.id;

  const nodes = await prisma.lifemapNode.findMany({
    where: { userId },
    orderBy: { targetDate: 'asc' },
  });

  return { success: true, nodes };
}

/**
 * Creates a new Lifemap node for the authenticated user.
 */
export async function createLifemapNodeAction(data: LifemapNodeInput) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  const userId = session.user.id;

  const node = await prisma.lifemapNode.create({
    data: {
      userId,
      title: data.title,
      description: data.description || '',
      targetDate: new Date(data.targetDate),
      tags: data.tags,
      colorTheme: data.colorTheme || 'indigo',
    },
  });

  return { success: true, node };
}

/**
 * Updates an existing Lifemap node.
 */
export async function updateLifemapNodeAction(
  id: string,
  data: Partial<LifemapNodeInput>
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  const userId = session.user.id;

  // Verify ownership
  const existing = await prisma.lifemapNode.findUnique({
    where: { id },
  });
  if (!existing || existing.userId !== userId) {
    throw new Error('Forbidden');
  }

  const updated = await prisma.lifemapNode.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.targetDate !== undefined && { targetDate: new Date(data.targetDate) }),
      ...(data.tags !== undefined && { tags: data.tags }),
      ...(data.colorTheme !== undefined && { colorTheme: data.colorTheme }),
    },
  });

  return { success: true, node: updated };
}

/**
 * Deletes an existing Lifemap node.
 */
export async function deleteLifemapNodeAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  const userId = session.user.id;

  // Verify ownership
  const existing = await prisma.lifemapNode.findUnique({
    where: { id },
  });
  if (!existing || existing.userId !== userId) {
    throw new Error('Forbidden');
  }

  await prisma.lifemapNode.delete({
    where: { id },
  });

  return { success: true };
}
