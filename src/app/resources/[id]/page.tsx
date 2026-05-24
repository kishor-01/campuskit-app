// src/app/resources/[id]/page.tsx

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowUpRight, ChevronRight, BookOpen, 
  CheckCircle2, Lightbulb, ListChecks, 
  Layers, Target, Zap, Network
} from 'lucide-react';
import ResourceCard from '@/components/ResourceCard';
import BookmarkButton from '@/components/BookmarkButton';
import MermaidRenderer from '@/components/MermaidRenderer';

type Step = { title: string; description: string };
type Visualization = { type: string; content: string };

export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id;

  const resource = await prisma.resource.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!resource || resource.status !== 'APPROVED') notFound();

  const [similarResources, allUserSaved] = await Promise.all([
    prisma.resource.findMany({
      where: {
        categoryId: resource.categoryId,
        status: 'APPROVED',
        NOT: { id: resource.id },
      },
      include: { 
        category: true,
        _count: {
          select: { savedByUsers: true }
        }
      },
      take: 3,
      orderBy: { createdAt: 'desc' },
    }),
    userId ? prisma.savedResource.findMany({ where: { userId } }) : []
  ]);

  const savedIds = new Set(allUserSaved.map(s => s.resourceId));
  const isSaved = savedIds.has(id);

  // Type casting with fallbacks
  const steps = (resource.steps as unknown as Step[]) || [];
  const highlights = (resource.highlights as string[]) || [];
  const prerequisites = (resource.prerequisites as string[]) || [];
  const visualizations = (resource.visualizations as unknown as Visualization[]) || [];
  
  const mermaidChart = visualizations.find(v => v.type === 'mermaid')?.content;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section: Immersive Visuals */}
      <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
        {resource.imageUrl ? (
          <Image 
            src={resource.imageUrl} 
            alt={resource.name} 
            fill 
            className="object-cover" 
            priority 
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <BookOpen size={80} className="text-primary/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/resources" className="hover:text-primary transition-colors">Resources</Link>
          <ChevronRight size={14} />
          <span className="bg-primary/10 text-primary font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider">
            {resource.category.name}
          </span>
        </nav>

        {/* Main Header Card */}
        <div className="bg-card border border-border rounded-3xl p-6 md:p-10 shadow-xl mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="flex-1">
              <h1 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4 leading-tight">
                {resource.name}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
                {resource.description}
              </p>
            </div>
            <div className="flex flex-col gap-4 w-full md:w-auto shrink-0">
              <Link 
                href={resource.url} 
                target="_blank" 
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-bold rounded-2xl hover:bg-primary/90 hover:scale-[1.02] transition-all shadow-lg shadow-primary/20 text-lg"
              >
                Open Resource <ArrowUpRight size={20} />
              </Link>
              <div className="flex justify-center md:justify-end">
                 <BookmarkButton resourceId={resource.id} isInitiallySaved={isSaved} />
              </div>
            </div>
          </div>
        </div>

        {/* THE LEARNING PATHWAY (The Core Content) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Column: The Roadmap (Steps & Highlights) */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Section: Prerequisites (Preparation) */}
            {prerequisites.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                    <Target size={24} />
                  </div>
                  <h2 className="text-2xl font-bold">What you need first</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {prerequisites.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl border border-border/50">
                      <CheckCircle2 className="text-primary shrink-0 mt-1" size={18} />
                      <span className="text-sm font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
            
            {/* Section: Interactive Visualizations (Mermaid) */}
            {mermaidChart && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                    <Network size={24} />
                  </div>
                  <h2 className="text-2xl font-bold">Memory Map & Flowchart</h2>
                </div>
                <MermaidRenderer chart={mermaidChart} />
              </section>
            )}

            {/* Section: The Roadmap (The Steps) */}
            {steps.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Layers size={24} />
                  </div>
                  <h2 className="text-2xl font-bold">Step-by-Step Guide</h2>
                </div>
                <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                  {steps.map((step, idx) => (
                    <div key={idx} className="relative pl-12">
                      <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-background border-2 border-primary flex items-center justify-center font-bold text-primary z-10">
                        {idx + 1}
                      </div>
                      <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Section: Key Highlights */}
            {highlights.length > 0 && (
              <section className="bg-primary/5 rounded-3xl p-8 border border-primary/10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Lightbulb size={24} />
                  </div>
                  <h2 className="text-2xl font-bold">Pro-Tips & Highlights</h2>
                </div>
                <ul className="space-y-4">
                  {highlights.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-foreground/90">
                      <Zap size={18} className="text-yellow-500 shrink-0 mt-1" />
                      <span className="text-sm leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Right Column: Quick Stats / Sidebar */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6">
              <h4 className="font-bold mb-4 flex items-center gap-2">
                <ListChecks size={18} className="text-primary" /> Summary
              </h4>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Difficulty</span>
                  <span className="font-medium">{resource.difficultyTier || "Intermediate"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time Required</span>
                  <span className="font-medium">{resource.timeRequired || "~2 Hours"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium">{resource.category.name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Resources Section */}
        {similarResources.length > 0 && (
          <div className="mt-24 border-t border-border pt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">Continue Learning</h2>
              <Link href="/resources" className="text-primary font-semibold hover:underline">View all</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarResources.map((r) => {
                const currentSavedStatus = savedIds.has(r.id);
                return (
                  <ResourceCard
                    key={r.id}
                    resource={{ ...r, isInitiallySaved: currentSavedStatus }}
                    viewMode="grid"
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
