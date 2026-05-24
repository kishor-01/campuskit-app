// src/app/page.tsx
// Seniofy — Conversion Engine (Phase 8 Marketing Landing Page)

import { Metadata } from 'next';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import LandingPage from '@/components/home/LandingPage';

export const metadata: Metadata = {
  title: 'Seniofy — Escape Tutorial Hell. Enter the Constellation.',
  description:
    'Stop following linear checklists. Master complex engineering with spatial skill graphs, curated arsenals, and daily streaks.',
  openGraph: {
    title: 'Seniofy — Escape Tutorial Hell. Enter the Constellation.',
    description:
      'Spatial skill graphs, elite resource arsenals, and streak-based mastery. Built for engineers who refuse to settle.',
    type: 'website',
  },
};

export default async function HomePage() {
  const session = await auth();
  const isAuthenticated = !!session?.user;

  // Fetch live roadmaps for the "Flagship Vault" section
  const roadmaps = await prisma.roadmap.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
    take: 4,
    select: {
      id: true,
      title: true,
      description: true,
      slug: true,
      _count: { select: { learningNodes: true } },
    },
  });

  return <LandingPage isAuthenticated={isAuthenticated} roadmaps={roadmaps} />;
}
