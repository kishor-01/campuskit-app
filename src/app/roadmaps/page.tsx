// /src/app/roadmaps/page.tsx
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { Map } from 'lucide-react';

const RoadmapCard = ({ title, description, href }: { title: string, description: string, href: string }) => {
  return (
    <Link href={href} className="block group">
      <div className="bg-muted/50 p-6 rounded-lg h-full border-2 border-transparent 
                      group-hover:border-primary group-hover:bg-muted/70 transition-all duration-300">
        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center text-primary mb-4">
          <Map size={28} />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
};

export default async function RoadmapsPage() {
  // Fetch only published roadmaps
  const roadmaps = await prisma.roadmap.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">
          Learning Roadmaps
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your guide to mastering new skills. Follow our curated paths to go from beginner to pro.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {roadmaps.map(roadmap => (
          <RoadmapCard 
            key={roadmap.id}
            title={roadmap.title}
            description={roadmap.description}
            href={`/roadmaps/${roadmap.slug}`}
          />
        ))}
      </div>
    </div>
  );
}