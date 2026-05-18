// src/actions/blogActions.ts
'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('You must be logged in to perform this action.');
  }
  return session;
}

/**
 * Toggle bookmark on an article. Mirrors the existing toggleSaveResource pattern.
 */
export async function toggleSaveArticle(articleId: string) {
  const session = await requireUser();
  const userId = session.user.id!;

  if (!articleId) {
    return { error: 'Article ID is required.' };
  }

  try {
    const existing = await prisma.savedArticle.findUnique({
      where: { userId_articleId: { userId, articleId } },
    });

    if (existing) {
      await prisma.savedArticle.delete({
        where: { userId_articleId: { userId, articleId } },
      });
      revalidatePath('/blog');
      return { saved: false, message: 'Article removed from saved.' };
    } else {
      await prisma.savedArticle.create({
        data: { userId, articleId },
      });
      revalidatePath('/blog');
      return { saved: true, message: 'Article saved.' };
    }
  } catch (err) {
    console.error('toggleSaveArticle error:', err);
    return { error: 'Failed to toggle bookmark.' };
  }
}

/**
 * Blueprint schema expected in clonableBlueprint JSON:
 * {
 *   "title": "Build a REST API",
 *   "milestones": [
 *     {
 *       "title": "Setup & Architecture",
 *       "topics": [
 *         { "title": "Project scaffolding" },
 *         { "title": "Database design" }
 *       ]
 *     }
 *   ]
 * }
 */
interface BlueprintMilestone {
  title: string;
  topics?: { title: string }[];
}

interface ClonableBlueprint {
  title?: string;
  milestones: BlueprintMilestone[];
}

export async function cloneBlueprintToGoal(articleId: string) {
  const session = await requireUser();
  const userId = session.user.id!;

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { id: true, title: true, clonableBlueprint: true },
  });

  if (!article || !article.clonableBlueprint) {
    return { error: 'Article does not have a clonable blueprint.' };
  }

  const blueprint = article.clonableBlueprint as unknown as ClonableBlueprint;

  if (!blueprint.milestones || blueprint.milestones.length === 0) {
    return { error: 'Blueprint has no milestones defined.' };
  }

  const goalTitle = blueprint.title || `Project: ${article.title}`;

  try {
    // Build milestone creation data
    const milestonesCreate = blueprint.milestones.map((ms, msIdx) => ({
      title: ms.title,
      order: msIdx + 1,
      topics: {
        create: (ms.topics || []).map((topic, tIdx) => ({
          title: topic.title,
          order: tIdx + 1,
        })),
      },
    }));

    // Create the goal with milestones and topics in a single transaction
    const createdGoal = await prisma.goal.create({
      data: {
        title: goalTitle,
        userId,
        priority: 'HIGH',
        milestones: { create: milestonesCreate },
      },
      select: { id: true },
    });

    // Auto-save the article for the user
    await prisma.savedArticle.upsert({
      where: { userId_articleId: { userId, articleId } },
      update: {},
      create: { userId, articleId },
    });

    revalidatePath('/my-goals');
    revalidatePath(`/my-goals/${createdGoal.id}`);
    revalidatePath('/blog');

    return { success: true, goalId: createdGoal.id };
  } catch (err) {
    console.error('cloneBlueprintToGoal error:', err);
    return { error: 'Failed to clone blueprint into goals.' };
  }
}
