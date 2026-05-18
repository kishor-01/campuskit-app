import { PrismaClient, DifficultyTier, ResourceStatus, ResourceHealth } from '@prisma/client';

const prisma = new PrismaClient();

async function testPublishedAt() {
  try {
    // 1. Create a category if it doesn't exist
    let category = await prisma.category.findFirst();
    if (!category) {
      category = await prisma.category.create({
        data: {
          name: 'Test Category',
          slug: 'test-category',
          icon: 'test',
        }
      });
    }

    // 2. Create a future-dated resource
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1); // 1 year in the future

    const resourceId = `test-res-${Date.now()}`;
    const resource = await prisma.resource.create({
      data: {
        id: resourceId,
        name: 'Future Resource Test',
        description: 'This is a test resource',
        url: `https://example.com/${resourceId}`,
        categoryId: category.id,
        difficultyTier: DifficultyTier.JUNIOR,
        seniorInsight: 'Test insight',
        status: ResourceStatus.APPROVED,
        healthStatus: ResourceHealth.HEALTHY,
        publishedAt: futureDate,
      }
    });

    console.log(`Created future-dated resource: ${resource.id} with publishedAt: ${resource.publishedAt}`);

    // 3. Query as the frontend would
    const visibleResources = await prisma.resource.findMany({
      where: {
        status: ResourceStatus.APPROVED,
        publishedAt: { lte: new Date() },
      }
    });

    const isVisible = visibleResources.some(r => r.id === resource.id);
    
    console.log(`Is the future resource visible in the query? ${isVisible ? 'YES (FAIL)' : 'NO (PASS)'}`);

    // 4. Cleanup
    await prisma.resource.delete({
      where: { id: resource.id }
    });
    console.log('Test completed and cleaned up.');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPublishedAt();
