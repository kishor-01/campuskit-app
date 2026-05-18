// /src/app/roadmaps/page.tsx
import prisma from '@/lib/prisma';
import { DifficultyTier } from '@prisma/client';
import RoadmapList from '@/components/RoadmapList';
import React from 'react';

const ROADMAPS_PER_PAGE = 9;

export default async function RoadmapsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Await searchParams in Next.js 15
  const sp = await searchParams;
  
  const page = parseInt((Array.isArray(sp?.page) ? sp?.page[0] : sp?.page) as string) || 1;
  const tier = (Array.isArray(sp?.tier) ? sp?.tier[0] : sp?.tier) as DifficultyTier | undefined;

  const whereClause = {
    isPublished: true,
    ...(tier && { difficultyTier: tier }),
  };

  try {
    const [roadmaps, totalRoadmaps] = await Promise.all([
      prisma.roadmap.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * ROADMAPS_PER_PAGE,
        take: ROADMAPS_PER_PAGE,
        select: {
          id: true,
          title: true,
          description: true,
          slug: true,
          difficultyTier: true,
          estimatedHours: true,
          prerequisites: true,
          _count: {
            select: { steps: true, branches: true }
          }
        }
      }),
      prisma.roadmap.count({ where: whereClause })
    ]);

    const totalPages = Math.ceil(totalRoadmaps / ROADMAPS_PER_PAGE);

    return (
      <RoadmapList
        roadmaps={roadmaps}
        totalPages={totalPages}
        currentPage={page}
        currentTier={tier}
      />
    );
  } catch (err) {
    console.error('RoadmapsPage server error:', err);
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Could Not Fetch Roadmaps</h2>
          <p className="text-muted-foreground">
            There was an issue connecting to the database. Please try again later.
          </p>
        </div>
      </div>
    );
  }
}