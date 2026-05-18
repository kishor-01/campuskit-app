import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const resources = await prisma.resource.findMany({ select: { id: true, name: true, status: true, publishedAt: true } })
  console.log("Resources:", resources.length)
  console.dir(resources.slice(0, 5))
  
  const opportunities = await prisma.opportunity.findMany({ select: { id: true, title: true, status: true, publishedAt: true } })
  console.log("Opportunities:", opportunities.length)
  console.dir(opportunities.slice(0, 5))
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
