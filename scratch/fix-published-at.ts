import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // Set to yesterday to ensure it's in the past

  const resourcesUpdate = await prisma.resource.updateMany({
    data: {
      publishedAt: pastDate
    }
  });
  console.log(`Updated ${resourcesUpdate.count} resources.`);

  const opportunitiesUpdate = await prisma.opportunity.updateMany({
    data: {
      publishedAt: pastDate
    }
  });
  console.log(`Updated ${opportunitiesUpdate.count} opportunities.`);
  
  const articlesUpdate = await prisma.article.updateMany({
    data: {
      publishedAt: pastDate
    }
  });
  console.log(`Updated ${articlesUpdate.count} articles.`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
