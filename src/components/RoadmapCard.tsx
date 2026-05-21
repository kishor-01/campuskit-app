import Link from 'next/link';
import { Map, Clock, Zap, GraduationCap, Shield } from 'lucide-react';
import type { Roadmap, DifficultyTier } from '@prisma/client';

const difficultyConfig: Record<string, { label: string; color: string; icon: typeof Zap }> = {
  BEGINNER: { label: 'Beginner', color: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20', icon: GraduationCap },
  INTERMEDIATE: { label: 'Intermediate', color: 'bg-amber-500/15 text-amber-500 border-amber-500/20', icon: Zap },
  SENIOR: { label: 'Senior', color: 'bg-red-500/15 text-red-400 border-red-500/20', icon: Shield },
};

export interface RoadmapCardProps {
  roadmap: Pick<Roadmap, 'id' | 'title' | 'description' | 'slug' | 'difficultyTier' | 'estimatedHours' | 'prerequisites'> & {
    _count: {
      steps: number;
      branches: number;
    }
  };
}

export default function RoadmapCard({ roadmap }: RoadmapCardProps) {
  const config = difficultyConfig[roadmap.difficultyTier] || difficultyConfig.INTERMEDIATE;
  const DiffIcon = config.icon;
  const href = `/roadmaps/${roadmap.slug}`;

  return (
    <Link href={href} className="block group" id={`roadmap-card-${roadmap.slug}`}>
      <div className="relative bg-card p-6 rounded-2xl h-full border border-border/40 overflow-hidden
                      group-hover:border-primary/50 group-hover:shadow-lg group-hover:shadow-primary/5
                      transition-all duration-300 shadow-sm dark:shadow-none">
        {/* Gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary
                          group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
            <Map size={24} />
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${config.color}`}>
            <DiffIcon size={12} />
            {config.label}
          </div>
        </div>

        {/* Title & Description */}
        <h2 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {roadmap.title}
        </h2>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{roadmap.description}</p>

        {/* Metadata pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {roadmap.estimatedHours && (
            <span className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded-md text-xs text-muted-foreground">
              <Clock size={11} />
              {roadmap.estimatedHours}h
            </span>
          )}
          <span className="px-2 py-1 bg-muted/50 rounded-md text-xs text-muted-foreground">
            {roadmap._count.steps} steps
          </span>
          {roadmap._count.branches > 0 && (
            <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
              🔀 {roadmap._count.branches} branches
            </span>
          )}
        </div>

        {/* Prerequisites */}
        {roadmap.prerequisites.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs text-muted-foreground font-medium">Prereqs:</span>
            {roadmap.prerequisites.slice(0, 3).map((prereq) => (
              <span key={prereq} className="px-2 py-0.5 bg-muted rounded-full text-xs text-muted-foreground">
                {prereq}
              </span>
            ))}
            {roadmap.prerequisites.length > 3 && (
              <span className="px-2 py-0.5 text-xs text-muted-foreground">
                +{roadmap.prerequisites.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
