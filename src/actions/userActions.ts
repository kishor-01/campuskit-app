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

const CompleteOnboardingSchema = z.object({
  domain: z.string().min(1, 'Domain is required'),
  level: z.string().min(1, 'Experience level is required'),
  objective: z.string().min(1, 'Objective is required'),
});

export async function completeOnboarding(data: { domain: string; level: string; objective: string }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'Unauthorized: not signed in' };
    }

    const validatedFields = CompleteOnboardingSchema.safeParse(data);
    if (!validatedFields.success) {
      return { error: 'Invalid onboarding data provided' };
    }

    const { domain, level, objective } = validatedFields.data;

    // Map experience level to developer title if applicable
    let developerTitle = undefined;
    if (level === 'Junior') {
      developerTitle = 'Junior Engineer';
    } else if (level === 'Mid-Level') {
      developerTitle = 'Senior Developer';
    } else if (level === 'Student/Initiate') {
      developerTitle = 'Initiate';
    }

    await prisma.$transaction(async (tx) => {
      // 1. Update the User record
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          onboarded: true,
          domain,
          objective,
          ...(developerTitle ? { developerTitle } : {}),
        },
      });

      // 2. Dispatch achievement notification
      await tx.notification.create({
        data: {
          userId: session.user.id,
          title: 'Achievement Unlocked!',
          message: 'Welcome to the Command Center.',
          type: 'ACHIEVEMENT',
        },
      });
    });

    revalidatePath('/profile');
    return { success: true };
  } catch (error: any) {
    console.error('completeOnboarding error:', error);
    return { error: 'Failed to complete onboarding. Please try again.' };
  }
}

// ─── Phase 20: Initialization Sequence ───────────────────────────────────────
export async function completeOnboardingAction(data: {
  username: string;
  education: string;
  objective: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized: not signed in' };
  }

  const { username, education, objective } = data;

  // Validate username format
  const usernameClean = username.replace(/^@/, '').trim().toLowerCase();
  if (!usernameClean || usernameClean.length < 3) {
    return { error: 'Username must be at least 3 characters.' };
  }
  if (!/^[a-z0-9_]+$/.test(usernameClean)) {
    return { error: 'Username may only contain lowercase letters, numbers, and underscores.' };
  }
  if (!education || !objective) {
    return { error: 'All fields are required.' };
  }

  // Check uniqueness — exclude current user (in case they reload and re-submit)
  const existing = await prisma.user.findFirst({
    where: { username: usernameClean, NOT: { id: session.user.id } },
    select: { id: true },
  });
  if (existing) {
    return { error: 'That username is already taken. Choose another.' };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          username: usernameClean,
          education,
          objective,
          onboarded: true,
        },
      });

      // Achievement notification
      await tx.notification.create({
        data: {
          userId: session.user.id,
          title: 'Profile Initialized',
          message: `Welcome to the Constellation, @${usernameClean}. Your mission begins now.`,
          type: 'ACHIEVEMENT',
        },
      });
    });

    revalidatePath('/dashboard');
    revalidatePath('/profile');
    return { success: true };
  } catch (error: any) {
    console.error('[completeOnboardingAction]', error);
    return { error: 'Failed to initialize profile. Please try again.' };
  }
}
