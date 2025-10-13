// /src/app/roadmaps/[slug]/page.tsx
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import RoadmapStepCard from './RoadmapStepCard';

export default async function RoadmapDetailPage({ params }: { params: { slug: string } }) {
  const roadmap = await prisma.roadmap.findUnique({
    where: { 
      slug: params.slug,
      isPublished: true, // Ensure only published roadmaps are visible
    },
    include: {
      steps: {
        orderBy: { order: 'asc' }, // Order the steps correctly
        include: {
          linkedResources: { // Go into the join table
            include: {
              resource: true, // And include the actual resource data for each link
            },
          },
        },
      },
    },
  });

  if (!roadmap) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">{roadmap.title}</h1>
        <p className="text-lg text-muted-foreground">{roadmap.description}</p>
      </div>

      {/* The Timeline Container */}
      <div className="relative">
        {/* The vertical line */}
        <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-muted"></div>
        
        <div className="space-y-12">
          {roadmap.steps.map(step => (
            <RoadmapStepCard key={step.id} step={step} />
          ))}
        </div>
      </div>
    </div>
  );
}