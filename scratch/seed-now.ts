/**
 * Direct seed script — bypasses auth, seeds directly into DB.
 * Run: npx tsx scratch/seed-now.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Target the "Modern Frontend Engineering" roadmap
  const roadmap = await prisma.roadmap.findFirst({
    where: { isPublished: true },
    orderBy: { createdAt: 'asc' },
  });

  if (!roadmap) {
    console.error('No published roadmap found.');
    return;
  }

  console.log(`Seeding into: "${roadmap.title}" (${roadmap.slug})`);

  // Wipe existing constellation data for this roadmap (idempotent)
  await prisma.learningEdge.deleteMany({ where: { roadmapId: roadmap.id } });
  await prisma.learningNode.deleteMany({ where: { roadmapId: roadmap.id } });

  const nodePayloads = [
    {
      title: 'Foundations',
      briefing: 'Master the essential building blocks. Variables, control flow, data structures.',
      type: 'concept',
      positionX: 80,
      positionY: 200,
    },
    {
      title: 'Core Concepts',
      briefing: 'Deep-dive into paradigm-defining patterns. Functions, closures, async/await.',
      type: 'concept',
      positionX: 380,
      positionY: 200,
    },
    {
      title: 'Advanced Patterns',
      briefing: 'Design patterns, SOLID principles, hexagonal architecture.',
      type: 'practice',
      positionX: 680,
      positionY: 80,
    },
    {
      title: 'Practical Project',
      briefing: 'Build a real-world application applying everything learned so far.',
      type: 'practice',
      positionX: 680,
      positionY: 340,
    },
    {
      title: 'Ship It 🚀',
      briefing: 'Deploy to production, write a case study, and share with the world.',
      type: 'milestone',
      positionX: 980,
      positionY: 340,
    },
  ];

  const created = await Promise.all(
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

  const [foundations, coreConcepts, advancedPatterns, practicalProject, shipIt] = created;

  const edgePayloads = [
    { sourceNodeId: foundations.id,      targetNodeId: coreConcepts.id },
    { sourceNodeId: coreConcepts.id,     targetNodeId: advancedPatterns.id },
    { sourceNodeId: coreConcepts.id,     targetNodeId: practicalProject.id },
    { sourceNodeId: practicalProject.id, targetNodeId: shipIt.id },
  ];

  await Promise.all(
    edgePayloads.map((e) =>
      prisma.learningEdge.create({
        data: { roadmapId: roadmap.id, sourceNodeId: e.sourceNodeId, targetNodeId: e.targetNodeId },
      })
    )
  );

  // Mark "Foundations" as COMPLETED for all existing users (so we see the status cascade)
  const users = await prisma.user.findMany({ select: { id: true }, take: 5 });
  for (const user of users) {
    await prisma.userNodeProgress.upsert({
      where: { userId_nodeId: { userId: user.id, nodeId: foundations.id } },
      create: { userId: user.id, nodeId: foundations.id, status: 'COMPLETED', completedAt: new Date() },
      update: { status: 'COMPLETED', completedAt: new Date() },
    });
  }

  console.log(`\n✅ Seeded ${created.length} nodes + ${edgePayloads.length} edges`);
  console.log(`\n🚀 Navigate to: http://localhost:3001/roadmaps/${roadmap.slug}`);
  console.log('\nExpected visual states:');
  console.log('  🟢 Foundations       → COMPLETED (solid emerald)');
  console.log('  🟣 Core Concepts     → UNLOCKED  (pulsing violet)');
  console.log('  🔒 Advanced Patterns → LOCKED    (gray/muted)');
  console.log('  🔒 Practical Project → LOCKED    (gray/muted)');
  console.log('  🔒 Ship It           → LOCKED    (gray/muted)');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
