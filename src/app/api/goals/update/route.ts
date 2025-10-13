// src/app/api/goals/update/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { id, title, targetDate } = body;

    if (!id || !title) return NextResponse.json({ error: 'id and title required' }, { status: 400 });

    const goal = await prisma.goal.findUnique({ where: { id }, select: { userId: true } });
    if (!goal) return NextResponse.json({ error: 'Goal not found' }, { status: 404 });

    if (goal.userId !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.goal.update({
      where: { id },
      data: {
        title,
        targetDate: targetDate ? new Date(targetDate) : null,
      },
    });

    revalidatePath('/my-goals');
    revalidatePath(`/my-goals/${id}`);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Update goal API error', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
