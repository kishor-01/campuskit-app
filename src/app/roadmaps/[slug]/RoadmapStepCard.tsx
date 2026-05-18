// /src/app/roadmaps/[slug]/RoadmapStepCard.tsx
import { RoadmapStep, RoadmapStepResource, Resource, RoadmapBranch } from '@prisma/client';
import { ArrowUpRight, BookOpen, Zap } from 'lucide-react';

type StepWithResources = RoadmapStep & {
  linkedResources: (RoadmapStepResource & { resource: Resource })[];
  branch?: RoadmapBranch | null;
};

export default function RoadmapStepCard({ step }: { step: StepWithResources }) {
  return (
    <div className="relative pl-12" id={`step-${step.order}`}>
      {/* The circle on the timeline */}
      <div className="absolute top-1 left-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center 
                      font-bold text-primary-foreground text-sm shadow-md shadow-primary/20">
        {step.order}
      </div>

      <div className="ml-4 bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-all duration-300">
        {/* Branch badge + Title */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h2 className="text-xl font-bold text-foreground">{step.title}</h2>
            {step.branch && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-1 border"
                style={{
                  backgroundColor: `${step.branch.color || 'hsl(var(--primary))'}15`,
                  color: step.branch.color || 'hsl(var(--primary))',
                  borderColor: `${step.branch.color || 'hsl(var(--primary))'}30`,
                }}
              >
                🔀 {step.branch.title}
              </span>
            )}
          </div>
        </div>

        <p className="text-muted-foreground mb-4 leading-relaxed">{step.description}</p>

        {/* Deep Dive & Quick Ref buttons */}
        {(step.deepDiveUrl || step.quickRefUrl) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {step.deepDiveUrl && (
              <a
                href={step.deepDiveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary 
                           rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors"
              >
                <BookOpen size={13} />
                📚 Deep Dive
                <ArrowUpRight size={11} />
              </a>
            )}
            {step.quickRefUrl && (
              <a
                href={step.quickRefUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 
                           rounded-lg text-xs font-bold hover:bg-amber-500/20 transition-colors"
              >
                <Zap size={13} />
                ⚡ Quick Ref
                <ArrowUpRight size={11} />
              </a>
            )}
          </div>
        )}

        {/* Linked resources */}
        {step.linkedResources.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Recommended Resources
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {step.linkedResources.map(({ resource }) => (
                <a
                  key={resource.id}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-muted/40 p-3 rounded-lg flex items-center justify-between gap-2 
                             hover:bg-muted/70 border border-transparent hover:border-border transition-all"
                >
                  <span className="text-sm font-medium text-foreground">{resource.name}</span>
                  <ArrowUpRight size={14} className="text-muted-foreground flex-shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}