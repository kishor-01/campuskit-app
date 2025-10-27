// /src/actions/categoryActions.ts
'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { z } from 'zod'

// Helper to check for admin session - UPDATED FOR RBAC
async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized: Please log in.');
  }
  
  // Check if user has ADMIN or SUPER_ADMIN role
  const userRole = session.user.role;
  if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
    throw new Error('Forbidden: Admin access required.');
  }
  
  return session;
}

// Zod Schema for validation
const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required.')
    .max(50, 'Category name must be less than 50 characters.'),
});

const UpdateCategorySchema = z.object({
  id: z.string().min(1, 'Category ID is required.'),
  name: z.string().min(1, 'Category name is required.')
    .max(50, 'Category name must be less than 50 characters.'),
});

export async function createCategory(prevState: any, formData: FormData) {
  try {
    await requireAdmin();

    const validatedFields = CreateCategorySchema.safeParse({ 
      name: formData.get('name') 
    });

    if (!validatedFields.success) {
      return { 
        error: validatedFields.error.flatten().fieldErrors,
        message: null 
      };
    }

    const { name } = validatedFields.data;
    
    // Check if category already exists
    const existingCategory = await prisma.category.findUnique({
      where: { name }
    });

    if (existingCategory) {
      return { 
        error: { name: ['A category with this name already exists.'] },
        message: null
      };
    }

    const created = await prisma.category.create({ 
      data: { name } 
    });

    revalidatePath('/admin/resources');
    revalidatePath('/admin/categories');
    return { 
      message: `Category "${created.name}" created successfully.`,
      error: null 
    };
  } catch (err: any) {
    console.error('Create category error:', err);
    
    if (err.message?.includes('Forbidden') || err.message?.includes('Unauthorized')) {
      return { 
        error: { _form: [err.message] },
        message: null 
      };
    }
    
    if (err.code === 'P2002') {
      return { 
        error: { name: ['A category with this name already exists.'] },
        message: null 
      };
    }
    
    return { 
      error: { _form: ['Something went wrong while creating the category.'] },
      message: null 
    };
  }
}

export async function updateCategory(prevState: any, formData: FormData) {
  try {
    await requireAdmin();

    const validatedFields = UpdateCategorySchema.safeParse({
      id: formData.get('id'),
      name: formData.get('name')
    });

    if (!validatedFields.success) {
      return { 
        error: validatedFields.error.flatten().fieldErrors,
        message: null 
      };
    }

    const { id, name } = validatedFields.data;
    
    // Check if another category with the same name exists
    const existingCategory = await prisma.category.findFirst({
      where: {
        name,
        NOT: { id }
      }
    });

    if (existingCategory) {
      return { 
        error: { name: ['A category with this name already exists.'] },
        message: null 
      };
    }

    const updated = await prisma.category.update({
      where: { id },
      data: { name },
    });

    revalidatePath('/admin/resources');
    revalidatePath('/admin/categories');
    return { 
      message: `Category "${updated.name}" updated successfully.`,
      error: null 
    };
  } catch (err: any) {
    console.error('Update category error:', err);
    
    if (err.message?.includes('Forbidden') || err.message?.includes('Unauthorized')) {
      return { 
        error: { _form: [err.message] },
        message: null 
      };
    }
    
    if (err.code === 'P2025') {
      return { 
        error: { _form: ['Category not found.'] },
        message: null 
      };
    }
    
    return { 
      error: { _form: ['Something went wrong while updating the category.'] },
      message: null 
    };
  }
}

export async function deleteCategory(prevState: any, formData: FormData) {
  try {
    await requireAdmin();

    const id = formData.get('id') as string;
    if (!id) {
      return { 
        error: { _form: ['Category ID is required.'] },
        message: null 
      };
    }

    // Check if category has resources
    const resourcesCount = await prisma.resource.count({
      where: { categoryId: id }
    });

    if (resourcesCount > 0) {
      return { 
        error: { _form: [`Cannot delete category. It has ${resourcesCount} resource(s) associated with it.`] },
        message: null 
      };
    }

    const deleted = await prisma.category.delete({ 
      where: { id } 
    });
    
    revalidatePath('/admin/resources');
    revalidatePath('/admin/categories');
    return { 
      message: `Category "${deleted.name}" deleted successfully.`,
      error: null 
    };
  } catch (err: any) {
    console.error('Delete category error:', err);
    
    if (err.message?.includes('Forbidden') || err.message?.includes('Unauthorized')) {
      return { 
        error: { _form: [err.message] },
        message: null 
      };
    }
    
    if (err.code === 'P2025') {
      return { 
        error: { _form: ['Category not found.'] },
        message: null 
      };
    }
    
    return { 
      error: { _form: ['Failed to delete category.'] },
      message: null 
    };
  }
}