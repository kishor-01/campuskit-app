// src/app/api/import-roadmap/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createGoalFromRoadmapTyped } from '@/actions/roadmapActions';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const {
      roadmapId,
      title,
      targetDate = null,
      includeResources = true,
      includeNotes = true,
      replace = false
    } = body;

    if (!roadmapId || !title) {
      return NextResponse.json({ error: 'roadmapId and title are required' }, { status: 400 });
    }

    // Call typed helper to create the goal. It returns { duplicate: true, existingGoalId } OR { duplicate:false, created }
    const result = await createGoalFromRoadmapTyped(
      session.user.id,
      roadmapId,
      title,
      targetDate,
      includeResources,
      includeNotes,
      replace
    );

    if (result && (result as any).duplicate) {
      return NextResponse.json({ duplicate: true, existingGoalId: (result as any).existingGoalId }, { status: 200 });
    }

    return NextResponse.json({ success: true, newGoalId: (result as any).created.id }, { status: 200 });
  } catch (err: any) {
    console.error('Import roadmap failed', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
