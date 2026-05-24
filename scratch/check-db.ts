import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const roadmaps = await prisma.roadmap.findMany({
    where: { isPublished: true },
    select: { id: true, title: true, slug: true },
  });
  console.log('=== Published Roadmaps ===');
  console.log(JSON.stringify(roadmaps, null, 2));

  const nodes = await prisma.learningNode.findMany({
    select: { id: true, title: true, roadmapId: true, type: true },
  });
  console.log('\n=== Learning Nodes ===');
  console.log(JSON.stringify(nodes, null, 2));

  if (roadmaps.length > 0) {
    const slug = roadmaps[0].slug;
    console.log(`\n=== Navigate to: http://localhost:3001/roadmaps/${slug} ===`);
    console.log(`=== Seed at: http://localhost:3001/api/seed-constellation?slug=${slug} (requires login) ===`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
