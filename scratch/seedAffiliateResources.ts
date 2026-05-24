/**
 * scratch/seedAffiliateResources.ts
 * Seeds affiliate resources into the "React Fiber & Rendering Internals" node.
 * Run once: npx tsx scratch/seedAffiliateResources.ts
 */
import prisma from '../src/lib/prisma';

async function main() {
  // Find the target node
  const node = await prisma.learningNode.findFirst({
    where: { title: 'React Fiber & Rendering Internals' },
    select: { id: true, title: true, roadmapId: true },
  });

  if (!node) {
    console.error('Node "React Fiber & Rendering Internals" not found. Run seedModernFrontend.ts first.');
    return;
  }

  console.log(`Found node: ${node.title} (ID: ${node.id})`);

  // Wipe existing resources for idempotency
  await prisma.affiliateResource.deleteMany({ where: { nodeId: node.id } });

  const created = await prisma.affiliateResource.createMany({
    data: [
      {
        nodeId: node.id,
        title: 'React — The Complete Guide (Udemy)',
        description:
          'Dive deep into React internals including the Fiber architecture, reconciliation, and advanced hook patterns. Used by 1M+ developers worldwide.',
        url: 'https://www.udemy.com/course/react-the-complete-guide-incl-redux/',
        type: 'COURSE',
        isPremium: true,
      },
      {
        nodeId: node.id,
        title: 'Fluent React by Tejas Kumar',
        description:
          "A practitioner's deep-dive into how React actually works — fiber trees, concurrent rendering, suspense, and the scheduler. Essential for senior engineers.",
        url: 'https://www.oreilly.com/library/view/fluent-react/9781098138707/',
        type: 'BOOK',
        isPremium: true,
      },
      {
        nodeId: node.id,
        title: 'React DevTools Profiler',
        description:
          'The official Chrome extension for profiling React component render performance, spotting unnecessary re-renders, and validating memoization strategies.',
        url: 'https://react.dev/learn/react-developer-tools',
        type: 'TOOL',
        isPremium: false,
      },
    ],
  });

  console.log(`Seeded ${created.count} affiliate resources into node "${node.title}".`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
