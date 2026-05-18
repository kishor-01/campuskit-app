// /src/actions/resourceActions.ts
'use server';

import { ResourceStatus, DifficultyTier, ResourceHealth } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// UPDATED: requireAdmin function for RBAC
async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized: not signed in");
  }
  
  // Check if user has ADMIN or SUPER_ADMIN role
  const userRole = session.user.role;
  if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
    throw new Error("Forbidden: Admin access required");
  }
  
  return session;
}

// UPDATED: requirePermission function for specific permissions
async function requirePermission(minimumRole: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized: not signed in");
  }
  
  const roleHierarchy = {
    'VIEWER': 0,
    'CONTRIBUTOR': 1,
    'EDITOR': 2,
    'ADMIN': 3,
    'SUPER_ADMIN': 4,
  };
  
  const userLevel = roleHierarchy[session.user.role as keyof typeof roleHierarchy] || 0;
  const requiredLevel = roleHierarchy[minimumRole as keyof typeof roleHierarchy] || 0;
  
  if (userLevel < requiredLevel) {
    throw new Error(`Forbidden: ${minimumRole} role required`);
  }
  
  return session;
}

// Validation schemas
const CreateResourceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  url: z.string().url('Valid URL is required'),
  imageUrl: z.string().url('Valid image URL is required').optional().or(z.literal('')),
  categoryId: z.string().min(1, 'Category is required'),
  status: z.nativeEnum(ResourceStatus),
  difficultyTier: z.nativeEnum(DifficultyTier).optional(),
  seniorInsight: z.string().optional(),
  timeRequired: z.string().optional(),
  prerequisites: z.string().optional(),
  visualizations: z.string().optional(),
  publishedAt: z.string().optional(),
  authorOverride: z.string().optional(),
});

const UpdateResourceSchema = z.object({
  id: z.string().min(1, 'Resource ID is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  url: z.string().url('Valid URL is required'),
  imageUrl: z.string().url('Valid image URL is required').optional().or(z.literal('')),
  categoryId: z.string().min(1, 'Category is required'),
  status: z.nativeEnum(ResourceStatus),
  difficultyTier: z.nativeEnum(DifficultyTier).optional(),
  seniorInsight: z.string().optional(),
  timeRequired: z.string().optional(),
  prerequisites: z.string().optional(),
  visualizations: z.string().optional(),
  publishedAt: z.string().optional(),
  authorOverride: z.string().optional(),
});

export async function createResource(prevState: any, formData: FormData) {
  try {
    await requirePermission('EDITOR'); // UPDATED: EDITOR can create resources

    const validatedFields = CreateResourceSchema.safeParse({
      name: formData.get('name'),
      description: formData.get('description'),
      url: formData.get('url'),
      imageUrl: formData.get('imageUrl'),
      categoryId: formData.get('categoryId'),
      status: formData.get('status') as ResourceStatus,
      difficultyTier: (formData.get('difficultyTier') as DifficultyTier) || undefined,
      seniorInsight: formData.get('seniorInsight') as string || undefined,
      timeRequired: formData.get('timeRequired') || undefined,
      prerequisites: formData.get('prerequisites') || undefined,
      visualizations: formData.get('visualizations') || undefined,
      publishedAt: formData.get('publishedAt') as string || undefined,
      authorOverride: formData.get('authorOverride') as string || undefined,
    });

    if (!validatedFields.success) {
      return { error: validatedFields.error.flatten().fieldErrors };
    }

    const { name, description, url, imageUrl, categoryId, status, difficultyTier, seniorInsight, timeRequired, prerequisites, visualizations, publishedAt, authorOverride } = validatedFields.data;

    const parsedPublishedAt = publishedAt ? new Date(publishedAt) : new Date();

    const parsedPrerequisites = prerequisites ? prerequisites.split('\n').map(s => s.trim()).filter(Boolean) : [];
    const parsedVisualizations = visualizations ? [{ type: 'mermaid', content: visualizations }] : undefined;

    // Check if resource with same URL already exists
    const existingResource = await prisma.resource.findFirst({
      where: { url },
    });

    if (existingResource) {
      return { error: { url: ['A resource with this URL already exists'] } };
    }

    const resource = await prisma.resource.create({
      data: {
        name,
        description,
        url,
        imageUrl: imageUrl || null,
        categoryId,
        status,
        difficultyTier: difficultyTier || "INTERMEDIATE",
        seniorInsight: seniorInsight || "Pending senior insight",
        timeRequired: timeRequired || "2-4 Hours",
        prerequisites: parsedPrerequisites.length > 0 ? parsedPrerequisites : undefined,
        visualizations: parsedVisualizations,
        publishedAt: parsedPublishedAt,
        authorOverride: authorOverride || null,
      },
    });

    revalidatePath('/admin/resources');
    revalidatePath('/resources');
    
    return { 
      message: `Resource "${resource.name}" created successfully`,
      error: null 
    };
  } catch (error: any) {
    console.error('createResource error:', error);
    
    if (error.message?.includes('Forbidden') || error.message?.includes('Unauthorized')) {
      return { error: { _form: [error.message] } };
    }
    
    return { error: { _form: ['Failed to create resource'] } };
  }
}

export async function updateResource(prevState: any, formData: FormData) {
  try {
    await requirePermission('EDITOR'); // UPDATED: EDITOR can update resources

    const validatedFields = UpdateResourceSchema.safeParse({
      id: formData.get('id'),
      name: formData.get('name'),
      description: formData.get('description'),
      url: formData.get('url'),
      imageUrl: formData.get('imageUrl'),
      categoryId: formData.get('categoryId'),
      status: formData.get('status') as ResourceStatus,
      difficultyTier: (formData.get('difficultyTier') as DifficultyTier) || undefined,
      seniorInsight: formData.get('seniorInsight') as string || undefined,
      timeRequired: formData.get('timeRequired') || undefined,
      prerequisites: formData.get('prerequisites') || undefined,
      visualizations: formData.get('visualizations') || undefined,
      publishedAt: formData.get('publishedAt') as string || undefined,
      authorOverride: formData.get('authorOverride') as string || undefined,
    });

    if (!validatedFields.success) {
      return { error: validatedFields.error.flatten().fieldErrors };
    }

    const { id, name, description, url, imageUrl, categoryId, status, difficultyTier, seniorInsight, timeRequired, prerequisites, visualizations, publishedAt, authorOverride } = validatedFields.data;

    const parsedPublishedAt = publishedAt ? new Date(publishedAt) : new Date();

    const parsedPrerequisites = prerequisites ? prerequisites.split('\n').map(s => s.trim()).filter(Boolean) : [];
    const parsedVisualizations = visualizations ? [{ type: 'mermaid', content: visualizations }] : undefined;

    // Check if another resource with same URL exists
    const existingResource = await prisma.resource.findFirst({
      where: {
        url,
        NOT: { id },
      },
    });

    if (existingResource) {
      return { error: { url: ['A resource with this URL already exists'] } };
    }

    const resource = await prisma.resource.update({
      where: { id },
      data: {
        name,
        description,
        url,
        imageUrl: imageUrl || null,
        categoryId,
        status,
        difficultyTier: difficultyTier || "INTERMEDIATE",
        seniorInsight: seniorInsight || "Pending senior insight",
        timeRequired: timeRequired || "2-4 Hours",
        prerequisites: parsedPrerequisites.length > 0 ? parsedPrerequisites : undefined,
        visualizations: parsedVisualizations,
        publishedAt: parsedPublishedAt,
        authorOverride: authorOverride || null,
      },
    });

    revalidatePath('/admin/resources');
    revalidatePath('/resources');
    
    return { 
      message: `Resource "${resource.name}" updated successfully`,
      error: null 
    };
  } catch (error: any) {
    console.error('updateResource error:', error);
    
    if (error.message?.includes('Forbidden') || error.message?.includes('Unauthorized')) {
      return { error: { _form: [error.message] } };
    }
    
    if (error.code === 'P2025') {
      return { error: { _form: ['Resource not found'] } };
    }
    
    return { error: { _form: ['Failed to update resource'] } };
  }
}

export async function deleteResource(prevState: any, formData: FormData) {
  try {
    await requirePermission('ADMIN'); // UPDATED: Only ADMIN can delete resources

    const id = formData.get('id') as string;
    if (!id) {
      return { error: { _form: ['Resource ID is required'] } };
    }

    const resource = await prisma.resource.delete({
      where: { id },
    });

    revalidatePath('/admin/resources');
    revalidatePath('/resources');
    
    return { 
      message: `Resource "${resource.name}" deleted successfully`,
      error: null 
    };
  } catch (error: any) {
    console.error('deleteResource error:', error);
    
    if (error.message?.includes('Forbidden') || error.message?.includes('Unauthorized')) {
      return { error: { _form: [error.message] } };
    }
    
    if (error.code === 'P2025') {
      return { error: { _form: ['Resource not found'] } };
    }
    
    return { error: { _form: ['Failed to delete resource'] } };
  }
}

// Public submission - no admin required
export async function submitResource(prevState: any, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Unauthorized: Please log in to submit resources");
    }

    const validatedFields = CreateResourceSchema.safeParse({
      name: formData.get('name'),
      description: formData.get('description'),
      url: formData.get('url'),
      imageUrl: formData.get('imageUrl'),
      categoryId: formData.get('categoryId'),
      status: ResourceStatus.PENDING, // Always PENDING for public submissions
    });

    if (!validatedFields.success) {
      return { error: validatedFields.error.flatten().fieldErrors };
    }

    const { name, description, url, imageUrl, categoryId, status } = validatedFields.data;

    // Check if resource with same URL already exists
    const existingResource = await prisma.resource.findFirst({
      where: { url },
    });

    if (existingResource) {
      return { error: { url: ['A resource with this URL already exists'] } };
    }

    const resource = await prisma.resource.create({
      data: {
        name,
        description,
        url,
        imageUrl: imageUrl || null,
        categoryId,
        status,
        submittedById: session.user.id,
      },
    });

    revalidatePath('/admin/resources');
    revalidatePath('/resources');
    
    return { 
      message: `Resource "${resource.name}" submitted for review`,
      error: null 
    };
  } catch (error: any) {
    console.error('submitResource error:', error);
    
    if (error.message?.includes('Unauthorized')) {
      return { error: { _form: [error.message] } };
    }
    
    return { error: { _form: ['Failed to submit resource'] } };
  }
}

// Other functions remain similar but with permission checks...
export async function toggleSaveResource(resourceId: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const existingSaved = await prisma.savedResource.findUnique({
      where: {
        userId_resourceId: {
          userId: session.user.id!,
          resourceId,
        },
      },
    });

    if (existingSaved) {
      await prisma.savedResource.delete({
        where: {
          userId_resourceId: {
            userId: session.user.id!,
            resourceId,
          },
        },
      });
      return { saved: false };
    } else {
      await prisma.savedResource.create({
        data: {
          userId: session.user.id!,
          resourceId,
        },
      });
      return { saved: true };
    }
  } catch (error) {
    console.error('toggleSaveResource error:', error);
    return { error: 'Failed to save resource' };
  }
}

export async function updateResourceStatus(id: string, status: ResourceStatus) {
  try {
    await requirePermission('EDITOR'); // UPDATED: EDITOR can moderate resources

    const resource = await prisma.resource.update({
      where: { id },
      data: { status },
    });

    revalidatePath('/admin/resources');
    revalidatePath('/resources');
    
    return { 
      message: `Resource status updated to ${status}`,
      error: null 
    };
  } catch (error: any) {
    console.error('updateResourceStatus error:', error);
    
    if (error.message?.includes('Forbidden') || error.message?.includes('Unauthorized')) {
      return { error: error.message };
    }
    
    return { error: 'Failed to update resource status' };
  }
}