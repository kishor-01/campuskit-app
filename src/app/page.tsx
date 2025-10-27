// src/app/page.tsx
import prisma from '@/lib/prisma';
import HomePageClient from '@/components/HomePageClient';

export default async function HomePage() {
  
  // Fetch all necessary data for the homepage shelves in parallel for performance.
  // We are now using explicit `select` statements to ensure all required fields,
  // including `imageUrl`, are reliably fetched from the database.
  const [resources, opportunities, articles, roadmaps] = await Promise.all([
    
    // Fetch the 3 latest approved resources
    prisma.resource.findMany({
      where: { status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: {
        id: true,
        name: true,
        description: true,
        url: true,
        imageUrl: true, // Explicitly selecting the image URL
        category: {
          select: { name: true },
        },
      },
    }),
    
    // Fetch the 3 latest published opportunities
    prisma.opportunity.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: {
        id: true,
        title: true,
        description: true,
        organization: true,
        imageUrl: true, // Explicitly selecting the image URL
      }
    }),
    
    // Fetch the 3 latest published articles
    prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: {
        id: true,
        title: true,
        excerpt: true,
        slug: true,
        imageUrl: true, // Explicitly selecting the image URL
      }
    }),

    // Fetch the 3 latest published roadmaps
    prisma.roadmap.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: {
            id: true,
            title: true,
            description: true,
            slug: true,
            imageUrl: true, // Explicitly selecting the image URL
        }
    }),
  ]);

  // Pass the complete data down to the client component for rendering.
  return (
    <HomePageClient 
      resources={resources} 
      opportunities={opportunities} 
      articles={articles}
      roadmaps={roadmaps}
    />
  );
}

