// src/actions/affiliateActions_v2.ts
// Seed action for affiliate resources (dev/admin only)
'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';

/**
 * seedAffiliateResourcesAction
 *
 * Seeds mock AffiliateResource records into the "React Fiber & Rendering Internals" node.
 * Idempotent — clears existing resources for the node before re-seeding.
 * Admin/dev only.
 */
export async function seedAffiliateResourcesAction(nodeId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized.' };
  }

  try {
    // Wipe existing resources for this node (idempotent)
    await prisma.affiliateResource.deleteMany({ where: { nodeId } });

    const resources = await prisma.affiliateResource.createMany({
      data: [
        {
          nodeId,
          title: 'React — The Complete Guide (Udemy)',
          description:
            'Dive deep into React internals including the Fiber architecture, reconciliation, and advanced hook patterns. Used by 1M+ developers worldwide.',
          url: 'https://www.udemy.com/course/react-the-complete-guide-incl-redux/',
          type: 'COURSE',
          isPremium: true,
        },
        {
          nodeId,
          title: 'Fluent React by Tejas Kumar',
          description:
            "A practitioner's deep-dive into how React actually works — fiber trees, concurrent rendering, suspense, and the scheduler. Essential for senior engineers.",
          url: 'https://www.oreilly.com/library/view/fluent-react/9781098138707/',
          type: 'BOOK',
          isPremium: true,
        },
        {
          nodeId,
          title: 'React DevTools Profiler',
          description:
            'The official Chrome extension for profiling React component render performance, spotting unnecessary re-renders, and validating memoization strategies.',
          url: 'https://react.dev/learn/react-developer-tools',
          type: 'TOOL',
          isPremium: false,
        },
      ],
    });

    return { success: true, count: resources.count };
  } catch (e: any) {
    console.error('[seedAffiliateResourcesAction] error:', e);
    return { error: 'Failed to seed affiliate resources.' };
  }
}
