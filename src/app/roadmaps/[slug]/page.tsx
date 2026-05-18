// /src/app/roadmaps/[slug]/page.tsx
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import RoadmapStepCard from './RoadmapStepCard';
import SkillTreeView from './SkillTreeView';
import ArchitectPathButton from '@/components/goals/ArchitectPathButton';
import { auth } from '@/auth';
import { Clock, Shield, Zap, GraduationCap, AlertTriangle } from 'lucide-react';

const difficultyConfig: Record<string, { label: string; color: string; icon: typeof Zap }> = {
  BEGINNER: { label: 'Beginner', color: 'text-emerald-500', icon: GraduationCap },
  INTERMEDIATE: { label: 'Intermediate', color: 'text-amber-500', icon: Zap },
  SENIOR: { label: 'Senior', color: 'text-red-400', icon: Shield },
};

export default async function RoadmapDetailPage({ params }: { params: { slug: string } }) {
  const session = await auth();

  const roadmap = await prisma.roadmap.findUnique({
    where: {
      slug: params.slug,
      isPublished: true,
    },
    include: {
      branches: {
        orderBy: { order: 'asc' },
      },
      steps: {
        orderBy: { order: 'asc' },
        include: {
          branch: true,
          linkedResources: {
            include: {
              resource: true,
            },
          },
        },
      },
    },
  });

  if (!roadmap) {
    notFound();
  }

  const config = difficultyConfig[roadmap.difficultyTier] || difficultyConfig.INTERMEDIATE;
  const DiffIcon = config.icon;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-muted/50 border border-border ${config.color}`}>
            <DiffIcon size={13} />
            {config.label}
          </span>
          {roadmap.estimatedHours && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-muted/50 border border-border text-muted-foreground">
              <Clock size={13} />
              {roadmap.estimatedHours} hours
            </span>
          )}
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">
          {roadmap.title}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {roadmap.description}
        </p>

        {/* Prerequisites */}
        {roadmap.prerequisites.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <span className="text-xs text-muted-foreground font-medium">Prerequisites:</span>
            {roadmap.prerequisites.map((prereq) => (
              <span
                key={prereq}
                className="px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-xs font-medium border border-amber-500/20"
              >
                {prereq}
              </span>
            ))}
          </div>
        )}

        {/* Architect this Path button */}
        {session?.user?.id && (
          <div className="mt-6">
            <ArchitectPathButton
              roadmapId={roadmap.id}
              roadmapTitle={roadmap.title}
              seniorInsight={roadmap.seniorInsight}
            />
          </div>
        )}
      </div>

      {/* Senior Insight */}
      {roadmap.seniorInsight && roadmap.seniorInsight !== 'Pending senior insight' && (
        <div className="flex gap-3 p-5 bg-amber-500/5 border border-amber-500/15 rounded-2xl mb-10">
          <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">
              Senior Insight
            </p>
            <p className="text-sm text-foreground/80 italic leading-relaxed">
              &ldquo;{roadmap.seniorInsight}&rdquo;
            </p>
          </div>
        </div>
      )}

      {/* Skill Tree Visualization */}
      <SkillTreeView
        roadmapTitle={roadmap.title}
        branches={roadmap.branches}
        steps={roadmap.steps.map((s) => ({
          id: s.id,
          title: s.title,
          order: s.order,
          branchId: s.branchId,
        }))}
      />

      {/* Step Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gradient-to-b from-primary/40 via-muted to-muted" />

        <div className="space-y-12">
          {roadmap.steps.map((step) => (
            <RoadmapStepCard key={step.id} step={step} />
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      {session?.user?.id && roadmap.steps.length > 0 && (
        <div className="text-center mt-16 p-8 bg-muted/30 rounded-2xl border border-border">
          <h3 className="text-xl font-bold mb-2">Ready to start this journey?</h3>
          <p className="text-muted-foreground mb-4">
            Clone this roadmap into your personal goals and track your progress.
          </p>
          <ArchitectPathButton
            roadmapId={roadmap.id}
            roadmapTitle={roadmap.title}
            seniorInsight={roadmap.seniorInsight}
          />
        </div>
      )}
    </div>
  );
}