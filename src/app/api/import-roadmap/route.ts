// src/app/api/import-roadmap/route.ts

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
// FIX: Correctly import the function from goalActions
import { createGoalFromRoadmapTyped } from '@/actions/goalActions';

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
        targetDate, 
        includeResources, // These were missing
        includeNotes,     // These were missing
        replace 
    } = body;

    if (!roadmapId || !title) {
      return NextResponse.json({ error: 'Roadmap ID and title are required' }, { status: 400 });
    }

    // FIX: Pass all required arguments to the action
    const result = await createGoalFromRoadmapTyped(
        roadmapId, 
        title, 
        targetDate,
        includeResources,
        includeNotes,
        replace
    );

    if (result.duplicate) {
      return NextResponse.json({ duplicate: true, existingGoalId: result.existingGoalId }, { status: 200 });
    }
    
    if (result.success && result.newGoalId) {
        return NextResponse.json({ success: true, newGoalId: result.newGoalId }, { status: 201 });
    }

    // Fallback for unexpected results
    return NextResponse.json({ error: 'An unexpected error occurred during import.' }, { status: 500 });

  } catch (error: any) {
    console.error('API /import-roadmap Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to import roadmap' }, { status: 500 });
  }
}
