import prisma from "../src/lib/prisma";

async function main() {
  const roadmaps = await prisma.roadmap.findMany({
    select: {
      title: true,
      description: true
    }
  });

  console.log(JSON.stringify(roadmaps, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
