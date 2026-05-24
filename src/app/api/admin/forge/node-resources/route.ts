// src/app/api/admin/forge/node-resources/route.ts
// Returns AffiliateResources for a given nodeId — admin-only
import { NextRequest, NextResponse } from 'next/server';
import { isUserAtLeast } from '@/lib/auth-utils';
import { Role } from '@prisma/client';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const isAdmin = await isUserAtLeast(Role.ADMIN);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const nodeId = request.nextUrl.searchParams.get('nodeId');
  if (!nodeId) {
    return NextResponse.json({ resources: [] });
  }

  const resources = await prisma.affiliateResource.findMany({
    where: { nodeId },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      title: true,
      description: true,
      url: true,
      type: true,
      isPremium: true,
    },
  });

  return NextResponse.json({ resources });
}
