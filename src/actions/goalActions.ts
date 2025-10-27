// src/actions/goalActions.ts

'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

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

/* --- GOAL ACTIONS --- */
export async function createGoal(formData: FormData) {
  const session = await requireUser();

  const title = formData.get('title') as string;
  if (!title) {
    throw new Error('Title is required.');
  }

  const targetDateStr = formData.get('targetDate') as string;
  const targetDate = targetDateStr ? new Date(targetDateStr) : null;

  const newGoal = await prisma.goal.create({
    data: {
      title,
      targetDate,
      userId: session.user.id
    }
  });

  revalidatePath('/my-goals');
  return newGoal;
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

/* --- MILESTONE ACTIONS --- */
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
    const session = await requireUser();

    const id = formData.get('id') as string;
    const title = formData.get('title') as string;

    if (!id || !title) return { error: 'ID and title are required.' };

    const milestone = await prisma.milestone.findUnique({ 
      where: { id }, 
      include: { goal: { select: { id: true, userId: true }}}
    });

    if (milestone?.goal.userId !== session.user.id) throw new Error('Forbidden.');

    await prisma.milestone.update({ where: { id }, data: { title } });
    revalidatePath(`/my-goals/${milestone.goal.id}`);
    return { message: 'Milestone updated.' };
  } catch(e: any) {
    return { error: e.message };
  }
}

export async function deleteMilestone(prevState: any, formData: FormData) {
  try {
    const session = await requireUser();

    const id = formData.get('id') as string;
    if (!id) return { error: 'ID is required.' };

    const milestone = await prisma.milestone.findUnique({ 
      where: { id }, 
      include: { goal: { select: { id: true, userId: true }}}
    });

    if (milestone?.goal.userId !== session.user.id) throw new Error('Forbidden.');

    await prisma.milestone.delete({ where: { id } });
    revalidatePath(`/my-goals/${milestone.goal.id}`);
    return { message: 'Milestone deleted.' };
  } catch (e: any) {
    return { error: e.message };
  }
}

/* --- TOPIC ACTIONS --- */
export async function createTopic(prevState: any, formData: FormData) {
  try {
    const session = await requireUser();

    const milestoneId = formData.get('milestoneId') as string;
    const title = formData.get('title') as string;

    if (!milestoneId || !title) return { error: 'Milestone ID and Title are required.' };

    const milestone = await prisma.milestone.findUnique({ 
      where: { id: milestoneId }, 
      include: { goal: { select: { id: true, userId: true }}}
    });

    if (milestone?.goal.userId !== session.user.id) throw new Error('Forbidden.');

    const lastTopic = await prisma.topic.findFirst({ where: { milestoneId }, orderBy: { order: 'desc' } });
    const newOrder = (lastTopic?.order || 0) + 1;

    await prisma.topic.create({ data: { milestoneId, title, order: newOrder } });
    revalidatePath(`/my-goals/${milestone.goal.id}`);
    return { message: 'Topic added.' };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function updateTopic(prevState: any, formData: FormData) {
  try {
    const session = await requireUser();

    const id = formData.get('id') as string;
    const title = formData.get('title') as string;

    if (!id || !title) return { error: 'ID and title are required.' };

    const topic = await prisma.topic.findUnique({ 
      where: { id }, 
      include: { milestone: { select: { goalId: true, goal: { select: { userId: true }}}}}
    });

    if (topic?.milestone.goal.userId !== session.user.id) throw new Error('Forbidden.');

    await prisma.topic.update({ where: { id }, data: { title } });
    revalidatePath(`/my-goals/${topic.milestone.goalId}`);
    return { message: 'Topic updated.' };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function deleteTopic(prevState: any, formData: FormData) {
  try {
    const session = await requireUser();

    const id = formData.get('id') as string;
    if (!id) return { error: 'ID is required.' };

    const topic = await prisma.topic.findUnique({ 
      where: { id }, 
      include: { milestone: { select: { goalId: true, goal: { select: { userId: true }}}}}
    });

    if (topic?.milestone.goal.userId !== session.user.id) throw new Error('Forbidden.');

    await prisma.topic.delete({ where: { id } });
    revalidatePath(`/my-goals/${topic.milestone.goalId}`);
    return { message: 'Topic deleted.' };
  } catch (e: any) {
    return { error: e.message };
  }
}

/* --- SUB-TOPIC ACTIONS --- */
export async function createSubTopic(prevState: any, formData: FormData) {
  try {
    const session = await requireUser();

    const topicId = formData.get('topicId') as string;
    const title = formData.get('title') as string;

    if (!topicId || !title) return { error: 'Topic ID and Title are required.' };

    const topic = await prisma.topic.findUnique({ 
      where: { id: topicId }, 
      include: { milestone: { select: { goalId: true, goal: { select: { userId: true }}}}}
    });

    if (topic?.milestone.goal.userId !== session.user.id) throw new Error('Forbidden.');

    const lastSubTopic = await prisma.subTopic.findFirst({ where: { topicId }, orderBy: { order: 'desc' } });
    const newOrder = (lastSubTopic?.order || 0) + 1;

    await prisma.subTopic.create({ data: { topicId, title, order: newOrder } });
    revalidatePath(`/my-goals/${topic.milestone.goalId}`);
    return { message: 'Sub-topic added.' };
  } catch(e: any) {
    return { error: e.message };
  }
}

export async function updateSubTopic(prevState: any, formData: FormData) {
  try {
    const session = await requireUser();

    const id = formData.get('id') as string;
    const title = formData.get('title') as string;

    if (!id || !title) return { error: 'ID and title are required.' };

    const subTopic = await prisma.subTopic.findUnique({ 
      where: { id }, 
      include: { topic: { include: { milestone: { select: { goalId: true, goal: { select: { userId: true }}}}}}}
    });

    if (subTopic?.topic.milestone.goal.userId !== session.user.id) throw new Error('Forbidden.');

    await prisma.subTopic.update({ where: { id }, data: { title } });
    revalidatePath(`/my-goals/${subTopic.topic.milestone.goalId}`);
    return { message: 'Sub-topic updated.' };
  } catch(e: any) {
    return { error: e.message };
  }
}

export async function deleteSubTopic(prevState: any, formData: FormData) {
  try {
    const session = await requireUser();

    const id = formData.get('id') as string;
    if (!id) return { error: 'ID is required.' };

    const subTopic = await prisma.subTopic.findUnique({ 
      where: { id }, 
      include: { topic: { include: { milestone: { select: { goalId: true, goal: { select: { userId: true }}}}}}}
    });

    if (subTopic?.topic.milestone.goal.userId !== session.user.id) throw new Error('Forbidden.');

    await prisma.subTopic.delete({ where: { id } });
    revalidatePath(`/my-goals/${subTopic.topic.milestone.goalId}`);
    return { message: 'Sub-topic deleted.' };
  } catch(e: any) {
    return { error: e.message };
  }
}

/* --- TYPED HELPERS & OTHER ACTIONS --- */
export async function toggleSubTopicStatus(id: string, isCompleted: boolean) {
  const session = await requireUser();

  if (!id) throw new Error('Sub-topic ID is required.');

  const subTopicForAuth = await prisma.subTopic.findUnique({ 
    where: { id }, 
    select: { topic: { select: { milestone: { select: { goal: { select: { userId: true }}}}}}}
  });

  if (subTopicForAuth?.topic.milestone.goal.userId !== session.user.id) throw new Error('Forbidden.');

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

  const subTopic = await prisma.subTopic.findUnique({
    where: { id: subTopicId },
    include: { topic: { include: { milestone: { select: { goal: { select: { userId: true, id: true }}}}}}}
  });

  if (!subTopic) throw new Error("Sub-topic not found.");
  if (subTopic.topic.milestone.goal.userId !== session.user.id) throw new Error('Forbidden.');

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

export async function linkResourcesToTopic(topicId: string, resources: { resourceId: string, personalNote: string | null }[]) {
  const session = await requireUser();

  if (!topicId) throw new Error('Topic ID is required.');

  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: { milestone: { select: { goalId: true, goal: { select: { userId: true } } } } }
  });

  if (!topic) throw new Error("Topic not found.");
  if (topic.milestone.goal.userId !== session.user.id) throw new Error('Forbidden.');

  const dedupedPayload = Object.values(resources.reduce<Record<string, { resourceId: string; personalNote: string | null }>>((acc, cur) => {
    acc[cur.resourceId] = { resourceId: cur.resourceId, personalNote: cur.personalNote ?? null };
    return acc;
  }, {}));

  const existing = await prisma.topicResource.findMany({ where: { topicId }, select: { resourceId: true } });
  const existingIds = existing.map(e => e.resourceId);
  const incomingIds = dedupedPayload.map(r => r.resourceId);

  const toDelete = existingIds.filter(id => !incomingIds.includes(id));
  const ops: any[] = [];

  if (toDelete.length > 0) {
    ops.push(prisma.topicResource.deleteMany({ where: { topicId, resourceId: { in: toDelete } } }));
  }

  for (const item of dedupedPayload) {
    ops.push(prisma.topicResource.upsert({
      where: { topicId_resourceId: { topicId, resourceId: item.resourceId } },
      update: { personalNote: item.personalNote },
      create: { topicId, resourceId: item.resourceId, personalNote: item.personalNote },
    }));
  }

  const results = await prisma.$transaction(ops);

  if (topic.milestone?.goalId) {
    revalidatePath(`/my-goals/${topic.milestone.goalId}`);
  }

  return results.filter(r => r && typeof r === 'object' && 'id' in r);
}

export async function updateTopicNote(prevState: any, formData: FormData) {
  try {
    const session = await requireUser();

    const id = formData.get('id') as string;
    const note = formData.get('note') as string;

    if (!id) return { error: 'Topic ID required' };

    const topic = await prisma.topic.findUnique({ 
      where: { id }, 
      select: { milestone: { select: { goalId: true, goal: { select: { userId: true }}}}}
    });

    if (topic?.milestone.goal.userId !== session.user.id) throw new Error('Forbidden.');

    await prisma.topic.update({
      where: { id: id },
      data: { note: note && note.trim() !== '' ? note : null }
    });

    revalidatePath(`/my-goals/${topic.milestone.goalId}`);
    return { message: 'Note updated.' };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function updateSubTopicNote(prevState: any, formData: FormData) {
  try {
    const session = await requireUser();

    const id = formData.get('id') as string;
    const note = formData.get('note') as string;

    if (!id) return { error: 'Sub-topic ID required' };

    const subTopic = await prisma.subTopic.findUnique({ 
      where: { id }, 
      select: { topic: { select: { milestone: { select: { goalId: true, goal: { select: { userId: true }}}}}}}
    });

    if (subTopic?.topic.milestone.goal.userId !== session.user.id) throw new Error('Forbidden.');

    await prisma.subTopic.update({
      where: { id: id },
      data: { note: note && note.trim() !== '' ? note : null }
    });

    revalidatePath(`/my-goals/${subTopic.topic.milestone.goalId}`);
    return { message: 'Note updated.' };
  } catch(e: any) {
    return { error: e.message };
  }
}

export async function createGoalFromRoadmapTyped(roadmapId: string, title: string, targetDate: string | null, replaceExisting = false) {
  const session = await requireUser();
  const userId = session.user.id;

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

  if (existing && replaceExisting) {
    await prisma.goal.delete({ where: { id: existing.id } });
  } else if (existing && !replaceExisting) {
    return { duplicate: true, existingGoalId: existing.id };
  }

  const milestonesCreate = roadmap.steps.map(step => {
    const approvedResources = (step.linkedResources ?? []).filter(lr => lr.resource?.status === 'APPROVED');

    const topicsCreate: any[] = [{
      title: 'Overview', order: 1, note: step.description,
      subTopics: { create: [] }
    }];

    if (approvedResources.length > 0) {
      topicsCreate[0].subTopics.create.push({
        title: 'Resources', order: 1,
        linkedResources: {
          create: approvedResources.map(lr => ({ resourceId: lr.resource.id, personalNote: null }))
        }
      });
    }

    return { title: step.title, order: step.order, topics: { create: topicsCreate } };
  });

  const goalData: any = { title, userId, isTemplate: false, milestones: { create: milestonesCreate } };

  if (targetDate) goalData.targetDate = new Date(targetDate);

  const createdGoal = await prisma.goal.create({ data: goalData, select: { id: true } });

  revalidatePath('/my-goals');
  revalidatePath(`/my-goals/${createdGoal.id}`);

  return { success: true, newGoalId: createdGoal.id };
}