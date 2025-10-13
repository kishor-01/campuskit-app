// /src/app/roadmaps/[slug]/RoadmapStepCard.tsx
import { RoadmapStep, RoadmapStepResource, Resource } from '@prisma/client';
import { ArrowUpRight } from 'lucide-react';

type StepWithResources = RoadmapStep & {
  linkedResources: (RoadmapStepResource & { resource: Resource })[];
};

export default function RoadmapStepCard({ step }: { step: StepWithResources }) {
  return (
    <div className="relative pl-12">
      {/* The circle on the timeline */}
      <div className="absolute top-1 left-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center font-bold text-primary-foreground">
        {step.order}
      </div>
      
      <div className="ml-4">
        <h2 className="text-2xl font-bold text-foreground mb-2">{step.title}</h2>
        <p className="text-muted-foreground mb-4">{step.description}</p>
        
        {step.linkedResources.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Recommended Resources:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {step.linkedResources.map(({ resource }) => (
                <a 
                  key={resource.id} 
                  href={resource.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-muted/50 p-3 rounded-lg flex items-center justify-between gap-2 hover:bg-muted transition-colors"
                >
                  <span className="text-sm font-medium">{resource.name}</span>
                  <ArrowUpRight size={16} className="text-muted-foreground flex-shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}