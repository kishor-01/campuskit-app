'use server';

import prisma from '@/lib/prisma';
import { checkPermission, isUserAtLeast } from '@/lib/auth-utils';
import { Permission, Role } from '@prisma/client';

import { Prisma } from '@prisma/client';

// ─── Legacy compat: trackEvent (used by roadmapActions, ActionSearchBar) ───────
export async function trackEvent(
  eventType: string,
  userId?: string | null,
  metadata?: Record<string, unknown>
) {
  try {
    await prisma.analyticsEvent.create({
      data: {
        eventType,
        userId: userId ?? null,
        metadata: metadata ? (metadata as Prisma.InputJsonValue) : undefined,
      },
    });
  } catch {
    // Fire-and-forget — never throw on tracking failures
  }
}

export async function getAdminKpisAction() {
  const canRead = await checkPermission(Permission.USER_READ);
  if (!canRead) throw new Error('Unauthorized');

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [totalUsers, newSignups, activeMissions] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.userMissionPlan.count(),
  ]);

  return { totalUsers, newSignups, activeMissions };
}

export async function getNodeBottlenecksAction() {
  const canRead = await isUserAtLeast(Role.ADMIN);
  if (!canRead) throw new Error('Unauthorized');

  // Aggregate user progress grouped by Node and Status
  const progressGroups = await prisma.userNodeProgress.groupBy({
    by: ['nodeId', 'status'],
    _count: { id: true },
  });

  // Calculate unlocked vs completed map
  const statsMap = new Map<string, { unlocked: number; completed: number }>();

  for (const group of progressGroups) {
    if (!statsMap.has(group.nodeId)) {
      statsMap.set(group.nodeId, { unlocked: 0, completed: 0 });
    }
    
    if (group.status === 'UNLOCKED') {
      statsMap.get(group.nodeId)!.unlocked += group._count.id;
    } else if (group.status === 'COMPLETED') {
      statsMap.get(group.nodeId)!.completed += group._count.id;
    }
  }

  // Get nodes that have at least some unlocked (active) users
  const activeNodeIds = Array.from(statsMap.keys()).filter((id) => statsMap.get(id)!.unlocked > 0);

  if (activeNodeIds.length === 0) {
    return []; // No bottlenecks
  }

  // Fetch node titles
  const nodes = await prisma.learningNode.findMany({
    where: { id: { in: activeNodeIds } },
    select: { id: true, title: true },
  });

  const titleMap = new Map(nodes.map(n => [n.id, n.title]));

  // Calculate ratio: unlocked / max(completed, 1)
  const bottlenecks = activeNodeIds.map(nodeId => {
    const stats = statsMap.get(nodeId)!;
    const ratio = stats.unlocked / Math.max(stats.completed, 1);
    return {
      id: nodeId,
      title: titleMap.get(nodeId) || 'Unknown Node',
      unlocked: stats.unlocked,
      completed: stats.completed,
      ratio,
    };
  });

  // Sort by highest ratio and take top 5
  bottlenecks.sort((a, b) => b.ratio - a.ratio);
  const topBottlenecks = bottlenecks.slice(0, 5).map(({ title, unlocked, completed }) => ({
    title: title.length > 25 ? title.substring(0, 25) + '...' : title,
    unlocked,
    completed,
  }));

  return topBottlenecks;
}
