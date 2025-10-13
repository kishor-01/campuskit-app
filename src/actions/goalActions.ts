// /src/actions/goalActions.ts
'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { z } from 'zod';

/**
 * Helper to get the authenticated user session, throwing an error if not found.
 */
async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('You must be logged in to perform this action.');
  }
  return session;
}

/* --------------------------------------------------------------------------
   FORM ACTIONS (for useFormState)
-------------------------------------------------------------------------- */

// --- Goal Actions ---

export async function createGoal(prevState: any, formData: FormData) {
  try {
    const session = await requireUser();
    const title = formData.get('title') as string;
    if (!title) return { error: 'Title is required.' };

    const targetDateStr = formData.get('targetDate') as string;
    const targetDate = targetDateStr ? new Date(targetDateStr) : null;
    
    await prisma.goal.create({ data: { title, targetDate, userId: session.user.id } });
    revalidatePath('/my-goals');
    return { message: 'Goal created successfully.' };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function updateGoal(prevState: any, formData: FormData) {
    try {
        const session = await requireUser();
        const id = formData.get('id') as string;
        const title = formData.get('title') as string;
        if (!id || !title) return { error: 'ID and title are required.' };
        
        const goal = await prisma.goal.findUnique({ where: { id }, select: { userId: true }});
        if (goal?.userId !== session.user.id) throw new Error('Forbidden.');

        await prisma.goal.update({ where: { id }, data: { title } });
        revalidatePath(`/my-goals/${id}`);
        return { message: 'Goal updated.' };
    } catch(e: any) {
        return { error: e.message };
    }
}

export async function deleteGoal(prevState: any, formData: FormData) {
  try {
    const session = await requireUser();
    const id = formData.get('id') as string;
    if (!id) return { error: 'Goal ID is required.' };

    const goal = await prisma.goal.findUnique({ where: { id }, select: { userId: true } });
    if (goal?.userId !== session.user.id) throw new Error('Forbidden.');

    await prisma.goal.delete({ where: { id } });
  } catch (e: any) {
    return { error: e.message };
  }
  redirect('/my-goals');
}

// --- Milestone Actions ---

export async function createMilestone(prevState: any, formData: FormData) {
  try {
    const session = await requireUser();
    const goalId = formData.get('goalId') as string;
    const title = formData.get('title') as string;
    if (!goalId || !title) return { error: 'Goal ID and Title are required.' };
    
    const goal = await prisma.goal.findUnique({ where: { id: goalId }, select: { userId: true }});
    if (goal?.userId !== session.user.id) throw new Error('Forbidden.');

    const lastMilestone = await prisma.milestone.findFirst({ where: { goalId }, orderBy: { order: 'desc' } });
    const newOrder = (lastMilestone?.order || 0) + 1;
    await prisma.milestone.create({ data: { goalId, title, order: newOrder } });

    revalidatePath(`/my-goals/${goalId}`);
    return { message: 'Milestone added.' };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function updateMilestone(prevState: any, formData: FormData) {
    try {
        await requireUser();
        const id = formData.get('id') as string;
        const title = formData.get('title') as string;
        if (!id || !title) return { error: 'ID and title are required.' };

        const milestone = await prisma.milestone.findUnique({ where: { id }, select: { goal: { select: { userId: true }}}});
        if (milestone?.goal.userId !== (await auth())?.user?.id) throw new Error('Forbidden.');
        
        await prisma.milestone.update({ where: { id }, data: { title } });
        revalidatePath(`/my-goals/${(await prisma.milestone.findUnique({where: {id}}))?.goalId}`);
        return { message: 'Milestone updated.' };
    } catch(e: any) {
        return { error: e.message };
    }
}

export async function deleteMilestone(prevState: any, formData: FormData) {
    try {
        await requireUser();
        const id = formData.get('id') as string;
        if (!id) return { error: 'ID is required.' };
        
        const milestone = await prisma.milestone.findUnique({ where: { id }, select: { goal: { select: { userId: true }}}});
        if (milestone?.goal.userId !== (await auth())?.user?.id) throw new Error('Forbidden.');

        await prisma.milestone.delete({ where: { id } });
        revalidatePath(`/my-goals/${milestone.goalId}`);
        return { message: 'Milestone deleted.' };
    } catch (e: any) {
        return { error: e.message };
    }
}


// --- Topic & Sub-Topic actions follow the same pattern... ---
// For brevity, only create actions are shown as useFormState compatible.
// Update/delete can be converted in the same way if needed.
export async function createTopic(prevState: any, formData: FormData) { /* ... */ }
export async function createSubTopic(prevState: any, formData: FormData) { /* ... */ }


/* --------------------------------------------------------------------------
   TYPED HELPERS (for direct client-side calls)
-------------------------------------------------------------------------- */

export async function toggleSubTopicStatus(id: string, isCompleted: boolean) {
  const session = await requireUser();
  if (!id) throw new Error('Sub-topic ID is required.');
  
  // TODO: Add ownership check for security
  
  const subTopic = await prisma.subTopic.update({
    where: { id },
    data: { isCompleted: !isCompleted },
  });

  const topic = await prisma.topic.findUnique({
    where: { id: subTopic.topicId },
    include: { milestone: { select: { goalId: true } } }
  });

  if (topic?.milestone?.goalId) {
    revalidatePath(`/my-goals/${topic.milestone.goalId}`);
  }
  return subTopic;
}

export async function linkResourcesToSubTopic(subTopicId: string, resources: { resourceId: string, personalNote: string | null }[]) {
  const session = await requireUser();
  if (!subTopicId) throw new Error('Sub-topic ID is required.');
  
  // TODO: Add ownership check for security
  
  const subTopic = await prisma.subTopic.findUnique({
    where: { id: subTopicId },
    include: { topic: { include: { milestone: { select: { goalId: true }}}}}
  });

  if (!subTopic) throw new Error("Sub-topic not found.");

  // Your performant upsert logic
  const dedupedPayloadMap = resources.reduce<Record<string, { resourceId: string; personalNote: string | null }>>((acc, cur) => {
    acc[cur.resourceId] = { resourceId: cur.resourceId, personalNote: cur.personalNote ?? null };
    return acc;
  }, {});
  const dedupedPayload = Object.values(dedupedPayloadMap);
  const existing = await prisma.goalResource.findMany({ where: { subTopicId }, select: { resourceId: true } });
  const existingIds = existing.map(e => e.resourceId);
  const incomingIds = dedupedPayload.map(r => r.resourceId);
  const toDelete = existingIds.filter(id => !incomingIds.includes(id));
  
  const ops: any[] = [];
  if (toDelete.length > 0) {
    ops.push(prisma.goalResource.deleteMany({ where: { subTopicId, resourceId: { in: toDelete } } }));
  }
  for (const item of dedupedPayload) {
    ops.push(prisma.goalResource.upsert({
      where: { subTopicId_resourceId: { subTopicId, resourceId: item.resourceId } },
      update: { personalNote: item.personalNote },
      create: { subTopicId, resourceId: item.resourceId, personalNote: item.personalNote },
    }));
  }
  
  const results = await prisma.$transaction(ops);

  if (subTopic.topic?.milestone?.goalId) {
    revalidatePath(`/my-goals/${subTopic.topic.milestone.goalId}`);
  }
  return results.filter(r => r && typeof r === 'object' && 'id' in r);
}

export async function createGoalFromRoadmapTyped(roadmapId: string, title: string, targetDate: string | null) {
  const session = await requireUser();
  const userId = session.user.id;

  // Your roadmap import logic
  const roadmap = await prisma.roadmap.findUnique({
    where: { id: roadmapId },
    include: {
      steps: {
        orderBy: { order: 'asc' },
        include: { linkedResources: { include: { resource: true } } }
      }
    }
  });
  if (!roadmap || !roadmap.isPublished) throw new Error('Roadmap not found or not published.');

  const existing = await prisma.goal.findFirst({ where: { userId, title } });
  if (existing) return { duplicate: true, existingGoalId: existing.id };

  const milestonesCreate = roadmap.steps.map(step => {
    const approvedResources = (step.linkedResources ?? []).filter(lr => lr.resource?.status === 'APPROVED');
    const topicsCreate: any[] = [{
      title: 'Overview',
      order: 1,
      note: step.description,
      subTopics: { create: [] }
    }];
    if (approvedResources.length > 0) {
      topicsCreate[0].subTopics.create.push({
        title: 'Resources',
        order: 1,
        linkedResources: {
          create: approvedResources.map(lr => ({ resourceId: lr.resource.id, personalNote: null }))
        }
      });
    }
    return {
      title: step.title,
      order: step.order,
      topics: { create: topicsCreate }
    };
  });

  const goalData: any = { title, userId, isTemplate: false, milestones: { create: milestonesCreate } };
  if (targetDate) goalData.targetDate = new Date(targetDate);

  const createdGoal = await prisma.goal.create({ data: goalData, select: { id: true } });
  revalidatePath('/my-goals');
  revalidatePath(`/my-goals/${createdGoal.id}`);
  return { duplicate: false, created: createdGoal };
}