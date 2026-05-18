import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  const jsonPath = path.join(__dirname, "roadmap.json");
  
  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ Error: roadmap.json not found at ${jsonPath}`);
    console.log("Please create a roadmap.json file in the scripts folder with your roadmap data.");
    process.exit(1);
  }

  const rawData = fs.readFileSync(jsonPath, "utf-8");
  let data;
  try {
    data = JSON.parse(rawData);
  } catch (error) {
    console.error("❌ Error parsing roadmap.json. Please ensure it is valid JSON.");
    process.exit(1);
  }

  if (!data.roadmap || !data.branches || !data.steps) {
    console.error("❌ Error: Invalid JSON structure. Must contain 'roadmap', 'branches', and 'steps'.");
    process.exit(1);
  }

  console.log(`Seeding roadmap: ${data.roadmap.title}...`);

  // 1. Upsert Roadmap
  const roadmap = await prisma.roadmap.upsert({
    where: { slug: data.roadmap.slug },
    update: {
      title: data.roadmap.title,
      description: data.roadmap.description,
      difficultyTier: data.roadmap.difficultyTier as any,
      seniorInsight: data.roadmap.seniorInsight,
      estimatedHours: data.roadmap.estimatedHours,
      prerequisites: data.roadmap.prerequisites,
      isPublished: true,
    },
    create: {
      title: data.roadmap.title,
      slug: data.roadmap.slug,
      description: data.roadmap.description,
      difficultyTier: data.roadmap.difficultyTier as any,
      seniorInsight: data.roadmap.seniorInsight,
      estimatedHours: data.roadmap.estimatedHours,
      prerequisites: data.roadmap.prerequisites,
      isPublished: true,
    },
  });

  console.log(`✅ Upserted Roadmap: ${roadmap.title}`);

  // 2. Upsert Branches
  const branchesMap = new Map();
  for (const branchData of data.branches) {
    const branch = await prisma.roadmapBranch.upsert({
      where: {
        roadmapId_order: {
          roadmapId: roadmap.id,
          order: branchData.order,
        },
      },
      update: {
        title: branchData.title,
        description: branchData.description,
        color: branchData.color,
      },
      create: {
        title: branchData.title,
        description: branchData.description,
        order: branchData.order,
        color: branchData.color,
        roadmapId: roadmap.id,
      },
    });
    branchesMap.set(branch.order, branch.id);
    console.log(`  ✅ Upserted Branch: ${branch.title}`);
  }

  // 3. Upsert Steps
  for (const stepData of data.steps) {
    const branchId = branchesMap.get(stepData.branchOrder);
    if (!branchId) {
      console.warn(`⚠️ Warning: Branch order ${stepData.branchOrder} not found for step ${stepData.title}`);
    }

    await prisma.roadmapStep.upsert({
      where: {
        roadmapId_order: {
          roadmapId: roadmap.id,
          order: stepData.order,
        },
      },
      update: {
        title: stepData.title,
        description: stepData.description,
        branchId: branchId || null,
        deepDiveUrl: stepData.deepDiveUrl,
        quickRefUrl: stepData.quickRefUrl,
      },
      create: {
        title: stepData.title,
        description: stepData.description,
        order: stepData.order,
        roadmapId: roadmap.id,
        branchId: branchId || null,
        deepDiveUrl: stepData.deepDiveUrl,
        quickRefUrl: stepData.quickRefUrl,
      },
    });
    console.log(`    ✅ Upserted Step: ${stepData.title}`);
  }

  console.log("🎉 Roadmap import completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
