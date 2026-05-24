// src/components/home/LandingPage.tsx
// Phase 8 — The Conversion Engine
'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import {
  GitBranch, BookMarked, Flame, ArrowRight, ChevronDown,
  Zap, Map, Shield, Star, CheckCircle2, Twitter, Github,
  Code2, Cpu, Network, Lock,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface RoadmapCard {
  id: string;
  title: string;
  description: string;
  slug: string;
  _count: { learningNodes: number };
}

interface LandingPageProps {
  isAuthenticated: boolean;
  roadmaps: RoadmapCard[];
}

// ─── Animated reveal wrapper ──────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = '' }: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Subtle constellation SVG background ──────────────────────────────────────
function ConstellationBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Radial deep-space glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(139,92,246,0.15),transparent)]" />
      {/* Secondary glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[400px] rounded-full bg-indigo-600/5 blur-[120px]" />
      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.25]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(139,92,246,0.4) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />
      {/* Animated floating orbs */}
      <motion.div
        className="absolute top-20 right-[15%] w-72 h-72 rounded-full bg-violet-500/8 blur-3xl"
        animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-32 left-[10%] w-56 h-56 rounded-full bg-indigo-500/8 blur-3xl"
        animate={{ y: [0, 16, 0], scale: [1, 0.95, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
    </div>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function HeroSection({ isAuthenticated }: { isAuthenticated: boolean }) {
  const ctaHref = isAuthenticated ? '/dashboard' : '/login';

  return (
    <section className="relative min-h-[92vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden bg-[#020817]">
      <ConstellationBg />

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative z-10 mb-8 flex items-center gap-2 px-4 py-1.5 rounded-full
          border border-violet-500/30 bg-violet-500/10 backdrop-blur-sm"
      >
        <Zap className="w-3.5 h-3.5 text-violet-400" />
        <span className="text-xs font-bold text-violet-300 tracking-wider uppercase">
          Spatial Learning Engine · Now Live
        </span>
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-w-5xl text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08]"
      >
        Escape Tutorial Hell.{' '}
        <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
          Enter the Constellation.
        </span>
      </motion.h1>

      {/* Subheadline */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mt-6 max-w-2xl text-lg md:text-xl text-slate-400 leading-relaxed"
      >
        Stop following linear checklists. Master complex engineering with{' '}
        <span className="text-slate-300 font-semibold">spatial skill graphs</span>,{' '}
        <span className="text-slate-300 font-semibold">curated arsenals</span>, and{' '}
        <span className="text-slate-300 font-semibold">daily streaks</span>.
      </motion.p>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mt-10 flex flex-col sm:flex-row items-center gap-4"
      >
        <Link
          href={ctaHref}
          className="group flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-base text-white
            bg-gradient-to-r from-violet-600 to-indigo-600
            hover:from-violet-500 hover:to-indigo-500
            shadow-[0_0_40px_rgba(139,92,246,0.35)]
            hover:shadow-[0_0_60px_rgba(139,92,246,0.5)]
            transition-all duration-300 active:scale-[0.97]"
          id="hero-primary-cta"
        >
          <Zap className="w-4.5 h-4.5" />
          Initialize Dashboard
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <a
          href="#features"
          className="flex items-center gap-2 px-6 py-4 rounded-2xl font-semibold text-base text-slate-400
            border border-slate-700/60 hover:border-slate-600 hover:text-slate-300
            backdrop-blur-sm transition-all duration-200"
          id="hero-secondary-cta"
        >
          View Intel
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </a>
      </motion.div>

      {/* Social proof micro-line */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="relative z-10 mt-8 text-xs text-slate-600 font-mono tracking-wider"
      >
        NO PAYWALLS · NO FLUFF · OPEN SOURCE SPIRIT
      </motion.p>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-5 h-8 rounded-full border border-slate-700/60 flex items-start justify-center pt-1.5"
        >
          <div className="w-1 h-2 rounded-full bg-slate-600" />
        </motion.div>
      </div>
    </section>
  );
}

// ─── Feature Bento ────────────────────────────────────────────────────────────
const FEATURES = [
  {
    id: 'graphs',
    icon: GitBranch,
    iconColor: 'text-violet-400',
    iconBg: 'bg-violet-500/10 border-violet-500/20',
    tag: 'Core Engine',
    tagColor: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    title: 'Spatial Skill Graphs',
    body: 'Every roadmap is a DAG — a Directed Acyclic Graph. Nodes unlock in dependency order. You see exactly what to learn, why, and what it unlocks next. No guessing. No backtracking.',
    bullets: ['Prerequisite-gated progression', 'Visual DAG constellation view', 'Status: LOCKED → UNLOCKED → COMPLETED'],
  },
  {
    id: 'arsenal',
    icon: BookMarked,
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10 border-emerald-500/20',
    tag: 'Resource Engine',
    tagColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    title: 'The Arsenal',
    body: 'Each node comes loaded with curated, elite resources — courses, books, tools, articles — attached directly to the skill that needs them. No separate resource hunting. No fluff.',
    bullets: ['Attached to specific skill nodes', 'Curated by engineers, for engineers', 'Premium & free tiers clearly marked'],
  },
  {
    id: 'identity',
    icon: Flame,
    iconColor: 'text-orange-400',
    iconBg: 'bg-orange-500/10 border-orange-500/20',
    tag: 'Gamification Layer',
    tagColor: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    title: 'Developer Identity',
    body: 'Your activity heatmap, current streak, and longest streak aren\'t vanity metrics — they\'re accountability infrastructure. Your dossier tells the story of your consistency.',
    bullets: ['Daily activity contribution graph', 'Streak system with streak protection', 'Public profile dossier @ /u/username'],
  },
];

function FeatureBento() {
  return (
    <section id="features" className="relative py-24 md:py-32 px-4 bg-[#020817]">
      {/* Section divider glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />

      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center mb-16">
          <p className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-3">The Architecture</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Three Systems. One Engine.
          </h2>
          <p className="mt-4 text-slate-400 text-lg max-w-2xl mx-auto">
            Every feature is load-bearing. Nothing is decoration.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <Reveal key={f.id} delay={i * 0.1}>
                <div className="group relative rounded-2xl border border-slate-800/60 bg-slate-900/40
                  backdrop-blur-sm p-7 flex flex-col gap-5 h-full
                  hover:border-slate-700/80 hover:bg-slate-900/70 transition-all duration-300
                  hover:shadow-[0_0_40px_rgba(0,0,0,0.4)]">
                  {/* Top glow line on hover */}
                  <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="flex items-center justify-between">
                    <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${f.iconBg}`}>
                      <Icon className={`w-5 h-5 ${f.iconColor}`} />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${f.tagColor}`}>
                      {f.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{f.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{f.body}</p>
                  </div>

                  <ul className="mt-auto space-y-2">
                    {f.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-xs text-slate-500">
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-600 flex-shrink-0 mt-0.5" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Roadmap Vault ────────────────────────────────────────────────────────────
const ROADMAP_ICONS: Record<string, React.ElementType> = {
  default: Map,
  react: Code2,
  frontend: Code2,
  system: Network,
  rust: Cpu,
  backend: Shield,
};

function getIcon(title: string): React.ElementType {
  const lower = title.toLowerCase();
  if (lower.includes('react') || lower.includes('frontend') || lower.includes('next')) return Code2;
  if (lower.includes('system') || lower.includes('network')) return Network;
  if (lower.includes('rust') || lower.includes('cpu') || lower.includes('backend')) return Cpu;
  if (lower.includes('security') || lower.includes('auth')) return Shield;
  return Map;
}

const GRADIENT_PAIRS = [
  'from-violet-600 to-indigo-600',
  'from-emerald-600 to-teal-600',
  'from-orange-500 to-amber-500',
  'from-pink-600 to-rose-600',
];

function RoadmapVault({ roadmaps, isAuthenticated }: { roadmaps: RoadmapCard[]; isAuthenticated: boolean }) {
  // Pad with placeholder cards if fewer than 3 exist
  const PLACEHOLDERS: RoadmapCard[] = [
    { id: 'ph1', title: 'System Design Mastery', description: 'Scale distributed systems from zero to millions. DAG-routed deep dives into consistency, CAP theorem, and real architectures.', slug: 'system-design', _count: { learningNodes: 0 } },
    { id: 'ph2', title: 'Modern Frontend Engineering', description: 'React Fiber to Server Components. Not a tutorial — a spatial graph of how the modern web actually works.', slug: 'modern-frontend', _count: { learningNodes: 0 } },
    { id: 'ph3', title: 'Rust Systems Programming', description: 'Memory safety without a GC. Ownership, lifetimes, and zero-cost abstractions mapped as interconnected skill nodes.', slug: 'rust-systems', _count: { learningNodes: 0 } },
  ];

  const display = roadmaps.length >= 3 ? roadmaps.slice(0, 4) : [...roadmaps, ...PLACEHOLDERS].slice(0, 4);

  return (
    <section className="relative py-24 md:py-32 px-4 bg-slate-950/50">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-700/40 to-transparent" />

      <div className="max-w-6xl mx-auto">
        <Reveal className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-14">
          <div>
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3">Flagship Vault</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Live Skill Graphs
            </h2>
            <p className="mt-3 text-slate-400 text-lg max-w-xl">
              Hand-crafted DAGs for the skills that actually get you hired.
            </p>
          </div>
          <Link
            href="/roadmaps"
            className="self-start md:self-auto flex items-center gap-1.5 text-sm font-bold text-violet-400
              border border-violet-500/30 bg-violet-500/10 px-4 py-2.5 rounded-xl
              hover:bg-violet-500/20 transition-all shrink-0"
          >
            All Roadmaps <ArrowRight className="w-4 h-4" />
          </Link>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {display.map((rm, i) => {
            const Icon = getIcon(rm.title);
            const gradient = GRADIENT_PAIRS[i % GRADIENT_PAIRS.length];
            const isReal = !!roadmaps.find((r) => r.id === rm.id);
            const nodeCount = rm._count.learningNodes;

            return (
              <Reveal key={rm.id} delay={i * 0.08}>
                <Link
                  href={isReal ? `/roadmaps/${rm.slug}` : '/roadmaps'}
                  className="group relative flex flex-col rounded-2xl border border-slate-800/60 bg-slate-900/50
                    overflow-hidden hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-violet-500/20
                    hover:border-slate-700/80 transition-all duration-300 h-full"
                  id={`roadmap-card-${rm.slug}`}
                >
                  {/* Card header gradient */}
                  <div className={`relative h-24 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
                    <div className="absolute inset-0 opacity-20"
                      style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                    <Icon className="w-8 h-8 text-white/90 relative z-10" />
                  </div>

                  {/* Card body */}
                  <div className="flex flex-col flex-1 p-5 gap-3">
                    <h3 className="text-sm font-bold text-white leading-tight group-hover:text-violet-300 transition-colors">
                      {rm.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 flex-1">
                      {rm.description}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-800/60">
                      {nodeCount > 0 ? (
                        <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                          <GitBranch className="w-3 h-3" /> {nodeCount} nodes
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Coming soon
                        </span>
                      )}
                      <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────
function StatsBar() {
  const stats = [
    { value: 'DAG-native', label: 'Skill Graph Architecture' },
    { value: '∞', label: 'Prerequisite Chains' },
    { value: 'Cloud-sync', label: 'Progress & Notes' },
    { value: 'Open', label: 'Affiliate Arsenal' },
  ];

  return (
    <Reveal>
      <div className="relative py-14 border-y border-slate-800/60 bg-slate-950/30">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map(({ value, label }) => (
            <div key={label} className="space-y-1">
              <p className="text-2xl md:text-3xl font-black text-white tracking-tight">{value}</p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

// ─── Final CTA Section ────────────────────────────────────────────────────────
function FinalCTA({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <section className="relative py-32 px-4 overflow-hidden bg-[#020817]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_50%,rgba(139,92,246,0.12),transparent)]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />

      <Reveal className="relative z-10 max-w-3xl mx-auto text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
          ))}
        </div>
        <h2 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
          Ready to Build Your{' '}
          <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Constellation?
          </span>
        </h2>
        <p className="mt-6 text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
          Your skill graph is waiting. Every node you complete unlocks the next. The streak starts today.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={isAuthenticated ? '/dashboard' : '/signup'}
            className="group flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-lg text-white
              bg-gradient-to-r from-violet-600 to-indigo-600
              hover:from-violet-500 hover:to-indigo-500
              shadow-[0_0_40px_rgba(139,92,246,0.3)]
              hover:shadow-[0_0_60px_rgba(139,92,246,0.5)]
              transition-all duration-300 active:scale-[0.97]"
            id="final-cta"
          >
            {isAuthenticated ? 'Open Mission Control' : 'Start for Free'}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            href="/roadmaps"
            className="text-sm font-semibold text-slate-500 hover:text-slate-300 transition-colors"
          >
            Explore skill graphs →
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

// ─── Compact Footer ───────────────────────────────────────────────────────────
function LandingFooter() {
  return (
    <footer className="border-t border-slate-800/60 bg-[#020817] py-10 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center font-black text-white text-xs">
            S
          </div>
          <span className="font-bold text-slate-300">Seniofy</span>
          <span className="text-slate-600 text-sm">·</span>
          <span className="text-slate-600 text-xs">© {new Date().getFullYear()}</span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6 text-sm text-slate-500">
          <Link href="/roadmaps" className="hover:text-slate-300 transition-colors">Roadmaps</Link>
          <Link href="/resources" className="hover:text-slate-300 transition-colors">Resources</Link>
          <Link href="/blog" className="hover:text-slate-300 transition-colors">Blog</Link>
          <Link href="/about" className="hover:text-slate-300 transition-colors">About</Link>
          <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
        </div>

        {/* Social */}
        <div className="flex items-center gap-3">
          <a
            href="https://x.com/GetSeniofy"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Seniofy on X / Twitter"
            className="w-8 h-8 rounded-lg border border-slate-800 bg-slate-900/60 flex items-center justify-center
              text-slate-500 hover:text-slate-300 hover:border-slate-700 transition-all"
          >
            <Twitter className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://github.com/GetSeniofy"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Seniofy on GitHub"
            className="w-8 h-8 rounded-lg border border-slate-800 bg-slate-900/60 flex items-center justify-center
              text-slate-500 hover:text-slate-300 hover:border-slate-700 transition-all"
          >
            <Github className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────
export default function LandingPage({ isAuthenticated, roadmaps }: LandingPageProps) {
  return (
    <div className="bg-[#020817] overflow-x-hidden">
      <HeroSection isAuthenticated={isAuthenticated} />
      <FeatureBento />
      <StatsBar />
      <RoadmapVault roadmaps={roadmaps} isAuthenticated={isAuthenticated} />
      <FinalCTA isAuthenticated={isAuthenticated} />
      <LandingFooter />
    </div>
  );
}
