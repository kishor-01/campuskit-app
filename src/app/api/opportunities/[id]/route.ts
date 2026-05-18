// src/app/api/opportunities/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Lightweight GET endpoint for fetching opportunity data (used by ATS pre-fill and mock interview)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        organization: true,
        description: true,
        type: true,
        skillsRequired: true,
        tier: true,
      },
    });

    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    return NextResponse.json(opportunity);
  } catch (error) {
    console.error('Error fetching opportunity:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
