// src/components/dashboard/OnboardingMatrix.tsx
// Cold-Start Onboarding Protocol — First Roadmap Selection UI
import prisma from '@/lib/prisma';
import Link from 'next/link';
import {
  GitBranch, Zap, ArrowRight, Code2, Network, Cpu,
  Shield, Map, BookOpen, Rocket,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface PublishedRoadmap {
  id: string;
  title: string;
  description: string;
  slug: string;
  _count: { learningNodes: number };
}

// ─── Icon heuristic (same as LandingPage) ────────────────────────────────────
function getIcon(title: string): React.ElementType {
  const t = title.toLowerCase();
  if (t.includes('react') || t.includes('frontend') || t.includes('next')) return Code2;
  if (t.includes('system') || t.includes('network') || t.includes('distributed')) return Network;
  if (t.includes('rust') || t.includes('backend') || t.includes('server')) return Cpu;
  if (t.includes('security') || t.includes('auth')) return Shield;
  if (t.includes('roadmap') || t.includes('map')) return Map;
  return BookOpen;
}

const GRADIENT_PAIRS = [
  'from-violet-600/80 to-indigo-600/80',
  'from-emerald-600/80 to-teal-600/80',
  'from-orange-500/80 to-amber-500/80',
  'from-pink-600/80 to-rose-600/80',
  'from-cyan-600/80 to-blue-600/80',
  'from-fuchsia-600/80 to-purple-600/80',
];

// ─── Fallback placeholder cards when DB is empty ──────────────────────────────
const PLACEHOLDER_ROADMAPS: PublishedRoadmap[] = [
  {
    id: 'ph1',
    title: 'Modern Frontend Engineering',
    description: 'React Fiber, Next.js App Router, Server Components — mapped as an interactive skill graph you can navigate spatially.',
    slug: '',
    _count: { learningNodes: 0 },
  },
  {
    id: 'ph2',
    title: 'System Design Mastery',
    description: 'Scale distributed systems from zero to millions. CAP theorem, consistency models, and real architectures — node by node.',
    slug: '',
    _count: { learningNodes: 0 },
  },
  {
    id: 'ph3',
    title: 'Rust Systems Programming',
    description: 'Ownership, lifetimes, zero-cost abstractions. The hardest language made navigable via prerequisite-linked skill nodes.',
    slug: '',
    _count: { learningNodes: 0 },
  },
];

// ─── Single Roadmap Card ──────────────────────────────────────────────────────
function RoadmapPickCard({ roadmap, index }: { roadmap: PublishedRoadmap; index: number }) {
  const Icon = getIcon(roadmap.title);
  const gradient = GRADIENT_PAIRS[index % GRADIENT_PAIRS.length];
  const isReal = !!roadmap.slug;

  return (
    <div className="group relative flex flex-col rounded-2xl border border-slate-800/60 bg-slate-900/50
      hover:border-violet-500/30 hover:bg-slate-900/80
      hover:-translate-y-1 hover:shadow-2xl hover:shadow-violet-500/10
      transition-all duration-300 overflow-hidden h-full">

      {/* Top glow on hover */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent
        opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Header strip */}
      <div className={`relative h-20 bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 overflow-hidden`}>
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        />
        <Icon className="w-7 h-7 text-white/90 relative z-10 drop-shadow" />
        {roadmap._count.learningNodes > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/30 backdrop-blur-sm
            px-2 py-0.5 rounded-full text-[9px] font-bold text-white/80">
            <GitBranch className="w-2.5 h-2.5" />
            {roadmap._count.learningNodes} nodes
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5 gap-4">
        <div className="flex-1">
          <h3 className="text-sm font-bold text-slate-200 leading-tight mb-2 group-hover:text-violet-300 transition-colors">
            {roadmap.title}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
            {roadmap.description}
          </p>
        </div>

        {/* CTA */}
        {isReal ? (
          <Link
            href={`/roadmaps/${roadmap.slug}`}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl
              font-bold text-xs text-white transition-all duration-200
              bg-gradient-to-r from-violet-600 to-indigo-600
              hover:from-violet-500 hover:to-indigo-500
              hover:shadow-[0_0_18px_rgba(139,92,246,0.35)]
              active:scale-[0.98]"
            id={`init-mission-${roadmap.slug}`}
          >
            <Zap className="w-3.5 h-3.5" />
            Initialize Mission
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        ) : (
          <div className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl
            font-bold text-xs text-slate-600 border border-slate-800/60 cursor-not-allowed">
            Coming Soon
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component (Server) ──────────────────────────────────────────────────
export default async function OnboardingMatrix({ firstName }: { firstName: string }) {
  // Fetch all published roadmaps directly — no heavy dashboard query needed
  const roadmaps = await prisma.roadmap.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      title: true,
      description: true,
      slug: true,
      _count: { select: { learningNodes: true } },
    },
  });

  const display: PublishedRoadmap[] = roadmaps.length > 0
    ? (roadmaps as PublishedRoadmap[])
    : PLACEHOLDER_ROADMAPS;

  return (
    <div className="relative min-h-[80vh] flex flex-col items-center justify-start px-4 py-16">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full bg-violet-600/8 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[200px] rounded-full bg-indigo-600/5 blur-[80px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
            border border-violet-500/30 bg-violet-500/10 mb-6">
            <Rocket className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-xs font-bold text-violet-300 uppercase tracking-wider">
              Cold Start Protocol
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-100 tracking-tight mb-4 leading-tight">
            Welcome to the{' '}
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Constellation
            </span>
            {firstName !== 'Engineer' && `, ${firstName}`}.
          </h1>

          <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
            Initialize your first skill graph to begin tracking your progress.
            Every node you complete unlocks the next.
          </p>

          {/* How it works — micro-explainer */}
          <div className="mt-8 inline-flex items-center gap-6 px-6 py-3 rounded-2xl
            border border-slate-800/60 bg-slate-900/50 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-700" /> Node Unlocks
            </span>
            <span className="text-slate-700">→</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" /> Learn It
            </span>
            <span className="text-slate-700">→</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Mark Complete
            </span>
            <span className="text-slate-700">→</span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-violet-400" /> Next Unlocks
            </span>
          </div>
        </div>

        {/* Roadmap Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {display.map((rm, i) => (
            <RoadmapPickCard key={rm.id} roadmap={rm} index={i} />
          ))}
        </div>

        {/* Footer hint */}
        <p className="mt-10 text-center text-xs text-slate-600">
          You can always explore all roadmaps from{' '}
          <Link href="/roadmaps" className="text-violet-500 hover:text-violet-400 transition-colors font-semibold">
            the Roadmaps library
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
