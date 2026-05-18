'use server';

import { Role } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized: not signed in");
  }
  
  const userRole = session.user.role;
  if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
    throw new Error("Forbidden: Admin access required");
  }
  
  return session;
}

async function requireSuperAdmin() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized: not signed in");
  }
  
  const userRole = session.user.role;
  if (userRole !== 'SUPER_ADMIN') {
    throw new Error("Forbidden: Super Admin access required");
  }
  
  return session;
}

const UpdateUserRoleSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  role: z.nativeEnum(Role),
});

export async function updateUserRole(prevState: any, formData: FormData) {
  try {
    const session = await requireAdmin();

    const validatedFields = UpdateUserRoleSchema.safeParse({
      userId: formData.get('userId'),
      role: formData.get('role'),
    });

    if (!validatedFields.success) {
      return { error: validatedFields.error.flatten().fieldErrors };
    }

    const { userId, role } = validatedFields.data;

    // Prevent changing your own role (to avoid locking yourself out)
    if (userId === session.user.id) {
      return { error: { _form: ["You cannot change your own role."] } };
    }

    // Only SUPER_ADMIN can assign another SUPER_ADMIN role
    if (role === 'SUPER_ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return { error: { _form: ["Only Super Admins can assign the Super Admin role."] } };
    }

    // Admins cannot change the role of a SUPER_ADMIN
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) return { error: { _form: ["User not found."] } };
    
    if (targetUser.role === 'SUPER_ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return { error: { _form: ["Admins cannot change a Super Admin's role."] } };
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    revalidatePath('/admin/users');
    
    return { 
      message: `User ${user.email || user.username} is now ${role}.`,
      error: null 
    };
  } catch (error: any) {
    console.error('updateUserRole error:', error);
    if (error.message?.includes('Forbidden') || error.message?.includes('Unauthorized')) {
      return { error: { _form: [error.message] } };
    }
    return { error: { _form: ['Failed to update user role.'] } };
  }
}

export async function deleteUser(prevState: any, formData: FormData) {
  try {
    const session = await requireSuperAdmin();

    const id = formData.get('id') as string;
    if (!id) {
      return { error: { _form: ['User ID is required'] } };
    }

    if (id === session.user.id) {
      return { error: { _form: ["You cannot delete yourself."] } };
    }

    const user = await prisma.user.delete({
      where: { id },
    });

    revalidatePath('/admin/users');
    
    return { 
      message: `User ${user.email || user.username} deleted successfully.`,
      error: null 
    };
  } catch (error: any) {
    console.error('deleteUser error:', error);
    if (error.message?.includes('Forbidden') || error.message?.includes('Unauthorized')) {
      return { error: { _form: [error.message] } };
    }
    return { error: { _form: ['Failed to delete user.'] } };
  }
}

const UpdateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  bio: z.string().optional(),
  githubUrl: z.union([z.literal(''), z.string().url('Invalid GitHub URL')]).optional(),
  portfolioUrl: z.union([z.literal(''), z.string().url('Invalid Portfolio URL')]).optional(),
});

export async function updateProfile(prevState: any, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: { _form: ["Unauthorized: not signed in"] } };
    }

    const validatedFields = UpdateProfileSchema.safeParse({
      name: formData.get('name'),
      bio: formData.get('bio'),
      githubUrl: formData.get('githubUrl'),
      portfolioUrl: formData.get('portfolioUrl'),
    });

    if (!validatedFields.success) {
      return { error: validatedFields.error.flatten().fieldErrors };
    }

    const { name, bio, githubUrl, portfolioUrl } = validatedFields.data;

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        bio: bio || null,
        githubUrl: githubUrl || null,
        portfolioUrl: portfolioUrl || null,
      },
    });

    revalidatePath('/profile');
    revalidatePath('/profile/edit');

    return { 
      message: 'Profile updated successfully.',
      error: null 
    };
  } catch (error: any) {
    console.error('updateProfile error:', error);
    return { error: { _form: ['Failed to update profile.'] } };
  }
}

const UpdatePrivacySettingsSchema = z.object({
  isPublicProfile: z.boolean(),
  showHeatmap: z.boolean(),
  allowEmails: z.boolean(),
});

export async function updatePrivacySettings(data: { isPublicProfile: boolean, showHeatmap: boolean, allowEmails: boolean }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized: not signed in");
    }

    const validatedFields = UpdatePrivacySettingsSchema.safeParse(data);

    if (!validatedFields.success) {
      throw new Error("Invalid input data");
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: validatedFields.data,
    });

    revalidatePath('/profile');
    revalidatePath('/profile/privacy');

    return { success: true };
  } catch (error: any) {
    console.error('updatePrivacySettings error:', error);
    throw new Error('Failed to update privacy settings.');
  }
}
