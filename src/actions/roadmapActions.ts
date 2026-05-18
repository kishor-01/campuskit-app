// /src/actions/roadmapActions.ts

'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Zod Schema for Roadmap
const RoadmapSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, "Title must be at least 3 characters."),
  slug: z.string().min(3, "Slug must be at least 3 characters.").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens."),
  description: z.string().min(10, "Description is required."),
});

// Zod Schema for Roadmap Step
const RoadmapStepSchema = z.object({
  id: z.string().optional(),
  roadmapId: z.string(),
  title: z.string().min(3, "Title is required."),
  description: z.string().min(10, "Description is required."),
  order: z.coerce.number().int().positive("Order must be a positive number."),
});

// Action to create a new Roadmap
export async function createRoadmap(prevState: any, formData: FormData) {
  const validatedFields = RoadmapSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  try {
    const { title, slug, description } = validatedFields.data;
    await prisma.roadmap.create({ data: { title, slug, description } });
    revalidatePath('/admin/roadmaps');
    return { message: `Roadmap "${title}" created successfully.` };
  } catch (e: any) {
    if (e.code === 'P2002') {
      return { error: { slug: ['A roadmap with this slug already exists.'] } };
    }
    return { error: 'Failed to create roadmap.' };
  }
}

// Action to delete a Roadmap
export async function deleteRoadmap(prevState: any, formData: FormData) {
  const id = formData.get('id') as string;
  if (!id) return { error: 'Roadmap ID is required.' };

  try {
    const deleted = await prisma.roadmap.delete({ where: { id } });
    revalidatePath('/admin/roadmaps');
    return { message: `Roadmap "${deleted.title}" deleted.` };
  } catch (e: any) {
    return { error: 'Failed to delete roadmap.' };
  }
}

// Action to toggle the publish status of a Roadmap
export async function toggleRoadmapStatus(prevState: any, formData: FormData) {
  const id = formData.get('id') as string;
  const isPublished = formData.get('isPublished') === 'true';

  if (!id) return { error: 'Roadmap ID is required.' };

  try {
    const updated = await prisma.roadmap.update({
      where: { id },
      data: { isPublished: !isPublished },
    });

    revalidatePath('/admin/roadmaps');
    revalidatePath('/roadmaps');
    return { message: `Roadmap is now ${updated.isPublished ? 'published' : 'a draft'}.` };
  } catch(e: any) {
    return { error: 'Failed to toggle status.' };
  }
}

// Action to create a new Roadmap Step
export async function createRoadmapStep(prevState: any, formData: FormData) {
  const validatedFields = RoadmapStepSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  try {
    const { roadmapId, title, description, order } = validatedFields.data;
    await prisma.roadmapStep.create({ data: { roadmapId, title, description, order } });
    revalidatePath(`/admin/roadmaps/${roadmapId}`);
    return { message: 'Step created successfully.' };
  } catch (e: any) {
    return { error: 'Failed to create step.' };
  }
}

// Action to update a Roadmap Step
export async function updateRoadmapStep(prevState: any, formData: FormData) {
  const validatedFields = RoadmapStepSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  try {
    const { id, roadmapId, title, description, order } = validatedFields.data;
    if (!id) return { error: 'Step ID is required.' };

    await prisma.roadmapStep.update({
      where: { id },
      data: { title, description, order },
    });

    revalidatePath(`/admin/roadmaps/${roadmapId}`);
    return { message: 'Step updated successfully.' };
  } catch (e: any) {
    return { error: 'Failed to update step.' };
  }
}

// Action to delete a Roadmap Step
export async function deleteRoadmapStep(prevState: any, formData: FormData) {
  const id = formData.get('id') as string;
  const roadmapId = formData.get('roadmapId') as string;

  if (!id || !roadmapId) return { error: 'Step ID and Roadmap ID are required.' };

  try {
    await prisma.roadmapStep.delete({ where: { id } });
    revalidatePath(`/admin/roadmaps/${roadmapId}`);
    return { message: 'Step deleted.' };
  } catch (e: any) {
    return { error: 'Failed to delete step.' };
  }
}

// --- BRANCH ACTIONS ---

// Action to create a new RoadmapBranch
export async function createBranch(prevState: any, formData: FormData) {
  const roadmapId = formData.get('roadmapId') as string;
  const title = formData.get('title') as string;
  const description = (formData.get('description') as string) || null;
  const color = (formData.get('color') as string) || null;

  if (!roadmapId || !title) {
    return { error: 'Roadmap ID and branch title are required.' };
  }

  try {
    // Auto-calculate next order
    const lastBranch = await prisma.roadmapBranch.findFirst({
      where: { roadmapId },
      orderBy: { order: 'desc' },
    });
    const newOrder = (lastBranch?.order || 0) + 1;

    await prisma.roadmapBranch.create({
      data: { roadmapId, title, description, color, order: newOrder },
    });

    revalidatePath(`/admin/roadmaps/${roadmapId}`);
    return { message: `Branch "${title}" created.` };
  } catch (e: any) {
    return { error: 'Failed to create branch.' };
  }
}

// Action to delete a RoadmapBranch (steps get unassigned via SetNull)
export async function deleteBranch(prevState: any, formData: FormData) {
  const id = formData.get('id') as string;
  const roadmapId = formData.get('roadmapId') as string;

  if (!id || !roadmapId) return { error: 'Branch ID and Roadmap ID are required.' };

  try {
    const deleted = await prisma.roadmapBranch.delete({ where: { id } });
    revalidatePath(`/admin/roadmaps/${roadmapId}`);
    return { message: `Branch "${deleted.title}" deleted.` };
  } catch (e: any) {
    return { error: 'Failed to delete branch.' };
  }
}

// Action to assign a step to a branch (or unassign by passing null)
export async function assignStepToBranch(prevState: any, formData: FormData) {
  const stepId = formData.get('stepId') as string;
  const branchId = (formData.get('branchId') as string) || null;
  const roadmapId = formData.get('roadmapId') as string;

  if (!stepId || !roadmapId) return { error: 'Step ID and Roadmap ID are required.' };

  try {
    await prisma.roadmapStep.update({
      where: { id: stepId },
      data: { branchId: branchId || null },
    });

    revalidatePath(`/admin/roadmaps/${roadmapId}`);
    return { message: 'Step branch assignment updated.' };
  } catch (e: any) {
    return { error: 'Failed to assign step to branch.' };
  }
}

// Action to link/sync resources with a roadmap step
export async function linkResourcesToStep(formData: FormData) {
  const stepId = formData.get('stepId') as string;
  const resourceIds = formData.getAll('resourceIds') as string[];

  if (!stepId) {
    throw new Error("Step ID is required.");
  }

  const roadmapId = (await prisma.roadmapStep.findUnique({
    where: { id: stepId },
    select: { roadmapId: true }
  }))?.roadmapId;

  if (!roadmapId) {
    throw new Error("Roadmap not found for this step.");
  }

  try {
    await prisma.$transaction([
      prisma.roadmapStepResource.deleteMany({ where: { roadmapStepId: stepId } }),
      ...(resourceIds.length > 0 ? [
        prisma.roadmapStepResource.createMany({
          data: resourceIds.map((resourceId) => ({
            roadmapStepId: stepId,
            resourceId: resourceId,
          })),
          skipDuplicates: true,
        })
      ] : [])
    ]);

    revalidatePath(`/admin/roadmaps/${roadmapId}`);
    return { message: `Linked ${resourceIds.length} resources.` };
  } catch(e) {
    return { error: 'Failed to link resources.' };
  }
}