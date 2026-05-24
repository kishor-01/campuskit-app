// src/actions/personalActions.ts
'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

// Action to save/update markdown study notes for a step
export async function saveStepNoteAction(stepId: string, isCustom: boolean, content: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'You must be logged in to perform this action.' };
  }

  const userId = session.user.id;

  try {
    if (isCustom) {
      await prisma.userStepNote.upsert({
        where: {
          userId_customStepId: {
            userId,
            customStepId: stepId,
          },
        },
        update: {
          content,
        },
        create: {
          userId,
          customStepId: stepId,
          content,
        },
      });
    } else {
      await prisma.userStepNote.upsert({
        where: {
          userId_roadmapStepId: {
            userId,
            roadmapStepId: stepId,
          },
        },
        update: {
          content,
        },
        create: {
          userId,
          roadmapStepId: stepId,
          content,
        },
      });
    }

    return { success: true };
  } catch (e: any) {
    console.error('saveStepNoteAction error:', e);
    return { error: 'Failed to persist note.' };
  }
}

// Action to inject a custom step (side-quest) into the user's mission
export async function createCustomStepAction(roadmapId: string, title: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'You must be logged in to perform this action.' };
  }

  const userId = session.user.id;

  try {
    // 1. Create the custom step in the database
    const customStep = await prisma.userCustomStep.create({
      data: {
        userId,
        roadmapId,
        title,
        theory: 'Core Theory Briefing: Draft your outline for this custom objective in "My Notes".',
      },
    });

    // 2. Fetch the user's existing UserMissionPlan
    const existingPlan = await prisma.userMissionPlan.findUnique({
      where: {
        userId_roadmapId: {
          userId,
          roadmapId,
        },
      },
    });

    let newStepIds = existingPlan ? [...existingPlan.roadmapStepIds] : [];
    if (!newStepIds.includes(customStep.id)) {
      newStepIds.push(customStep.id);
    }

    // 3. Upsert UserMissionPlan to include the custom step ID in Active Mission
    await prisma.userMissionPlan.upsert({
      where: {
        userId_roadmapId: {
          userId,
          roadmapId,
        },
      },
      update: {
        roadmapStepIds: newStepIds,
      },
      create: {
        userId,
        roadmapId,
        roadmapStepIds: newStepIds,
      },
    });

    const roadmap = await prisma.roadmap.findUnique({
      where: { id: roadmapId },
      select: { slug: true },
    });

    if (roadmap) {
      revalidatePath(`/roadmaps/${roadmap.slug}`);
    }

    return { success: true, customStep };
  } catch (e: any) {
    console.error('createCustomStepAction error:', e);
    return { error: 'Failed to inject custom objective.' };
  }
}
