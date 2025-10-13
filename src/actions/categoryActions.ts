// /src/actions/categoryActions.ts
'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { z } from 'zod'

// Helper to check for admin session
async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    throw new Error('Forbidden: Admins only');
  }
  return session;
}

// Zod Schema for validation
const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required.'),
});

const UpdateCategorySchema = z.object({
  id: z.string().min(1, 'Category ID is required.'),
  name: z.string().min(1, 'Category name is required.'),
});


export async function createCategory(prevState: any, formData: FormData) {
  try {
    await requireAdmin();
    const validatedFields = CreateCategorySchema.safeParse({ name: formData.get('name') });
    if (!validatedFields.success) {
      return { error: validatedFields.error.flatten().fieldErrors };
    }
    const { name } = validatedFields.data;
    const created = await prisma.category.create({ data: { name } });
    revalidatePath('/admin/resources'); // Revalidate the page where it's used
    return { message: `Category "${created.name}" created.` };
  } catch (err: any) {
    if (err.code === 'P2002') { // Handle unique constraint violation
        return { error: { name: ['A category with this name already exists.'] }};
    }
    return { error: 'Something went wrong.' };
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
      return { error: validatedFields.error.flatten().fieldErrors };
    }
    const { id, name } = validatedFields.data;
    const updated = await prisma.category.update({
      where: { id },
      data: { name },
    });
    revalidatePath('/admin/resources');
    return { message: `Category "${updated.name}" updated.` };
  } catch (err: any) {
    return { error: 'Something went wrong.' };
  }
}

export async function deleteCategory(prevState: any, formData: FormData) {
  try {
    await requireAdmin();
    const id = formData.get('id') as string;
    if (!id) return { error: 'Category ID is required.' };

    const deleted = await prisma.category.delete({ where: { id } });
    revalidatePath('/admin/resources');
    return { message: `Category "${deleted.name}" deleted.` };
  } catch (err: any) {
    if (err instanceof Error && err.message.includes('P2025')) { // More specific error check
      return { error: 'Category not found.' };
    }
    return { error: 'Failed to delete category. Make sure no resources are using it.' };
  }
}