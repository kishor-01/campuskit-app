// src/app/api/seed-constellation/route.ts
// Quick seed endpoint — triggers constellation graph seeding for the calling user.
// Usage: GET /api/seed-constellation?slug=your-roadmap-slug
//        GET /api/seed-constellation  (seeds first published roadmap)

import { NextRequest, NextResponse } from 'next/server';
import { seedConstellationAction } from '@/actions/seedConstellationAction';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug');

  // Resolve roadmap ID from slug (or grab first published roadmap)
  const roadmap = slug
    ? await prisma.roadmap.findUnique({ where: { slug, isPublished: true }, select: { id: true } })
    : await prisma.roadmap.findFirst({ where: { isPublished: true }, select: { id: true } });

  if (!roadmap) {
    return NextResponse.json({ success: false, error: 'Roadmap not found.' }, { status: 404 });
  }

  const result = await seedConstellationAction(roadmap.id);

  if (!result.success) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result, { status: 200 });
}
