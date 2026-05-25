// src/app/admin/forge/[slug]/page.tsx
// Admin Graph Forge — Visual DAG Builder for Constellation Engine
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { isUserAtLeast } from '@/lib/auth-utils';
import { Role } from '@prisma/client';
import ForgeCanvas from './ForgeCanvas';
import ForgeSettings from './ForgeSettings';
import Link from 'next/link';
import { ArrowLeft, GitBranch } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const roadmap = await prisma.roadmap.findUnique({
    where: { slug },
    select: { title: true },
  });
  return {
    title: roadmap ? `Graph Forge — ${roadmap.title}` : 'Graph Forge',
    robots: { index: false, follow: false },
  };
}

export default async function ForgePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // ── Strict admin-only gate ────────────────────────────────────────────────
  const session = await auth();
  const isAdmin = await isUserAtLeast(Role.ADMIN);
  if (!session?.user || !isAdmin) {
    redirect('/');
  }

  // ── Fetch roadmap with full DAG ───────────────────────────────────────────
  const roadmap = await prisma.roadmap.findUnique({
    where: { slug },
    include: {
      learningNodes: { orderBy: { createdAt: 'asc' } },
      learningEdges: true,
    },
  });

  if (!roadmap) notFound();

  // ── Roadmap metadata for ForgeSettings modal ──────────────────────────────
  const roadmapMeta = {
    id: roadmap.id,
    slug: roadmap.slug,
    title: roadmap.title,
    description: roadmap.description,
    targetAudience: roadmap.targetAudience,
    prerequisiteText: roadmap.prerequisiteText,
    estimatedTime: roadmap.estimatedTime,
    outcomes: roadmap.outcomes,
  };

  // ── Serialize for client ──────────────────────────────────────────────────
  const forgeNodes = roadmap.learningNodes.map((n) => ({
    id: n.id,
    title: n.title,
    briefing: n.briefing,
    type: n.type,
    positionX: n.positionX,
    positionY: n.positionY,
  }));

  const forgeEdges = roadmap.learningEdges.map((e) => ({
    id: e.id,
    sourceNodeId: e.sourceNodeId,
    targetNodeId: e.targetNodeId,
  }));

  return (
    // Full-screen dark canvas with top header bar
    <div className="fixed inset-0 flex flex-col bg-[#020817] overflow-hidden">
      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 flex items-center justify-between px-5 py-3
        bg-slate-950/90 border-b border-slate-800/80 backdrop-blur-md z-30">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/roadmaps"
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-xs font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Admin
          </Link>
          <span className="text-slate-700">/</span>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-violet-500/15 border border-violet-500/25 flex items-center justify-center">
              <GitBranch className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
                Graph Forge
              </p>
              <h1 className="text-sm font-bold text-slate-100 leading-tight">
                {roadmap.title}
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Node + edge count */}
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
            <span className="px-2 py-1 rounded-md bg-slate-900 border border-slate-800">
              {roadmap.learningNodes.length} nodes
            </span>
            <span className="px-2 py-1 rounded-md bg-slate-900 border border-slate-800">
              {roadmap.learningEdges.length} edges
            </span>
          </div>
          {/* Roadmap Settings */}
          <ForgeSettings roadmap={roadmapMeta} />
          {/* View live */}
          <Link
            href={`/roadmaps/${roadmap.slug}`}
            target="_blank"
            className="text-[11px] font-semibold px-3 py-1.5 rounded-lg
              bg-violet-600/20 text-violet-400 border border-violet-500/30
              hover:bg-violet-600/30 transition-all"
          >
            View Live ↗
          </Link>
        </div>
      </header>

      {/* ── Forge Canvas (full remaining height) ─────────────────────────── */}
      <div className="flex-1 relative overflow-hidden">
        <ForgeCanvas
          roadmapId={roadmap.id}
          slug={roadmap.slug}
          initialNodes={forgeNodes}
          initialEdges={forgeEdges}
        />
      </div>
    </div>
  );
}
