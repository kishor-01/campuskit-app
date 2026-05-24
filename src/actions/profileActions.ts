// src/actions/profileActions.ts
'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function updateProfileNameAction(name: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: 'Not authenticated' };

  const trimmed = name.trim();
  if (!trimmed || trimmed.length < 2) return { error: 'Name must be at least 2 characters' };
  if (trimmed.length > 60) return { error: 'Name too long (max 60 chars)' };

  await prisma.user.update({
    where: { id: userId },
    data: { name: trimmed },
  });

  revalidatePath('/profile');
  return { success: true };
}

export async function deleteAccountAction() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: 'Not authenticated' };

  await prisma.user.delete({ where: { id: userId } });
  redirect('/');
}
