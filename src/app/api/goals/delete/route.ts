// src/app/api/goals/delete/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { id } = body;

    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const goal = await prisma.goal.findUnique({ where: { id }, select: { userId: true } });
    if (!goal) return NextResponse.json({ error: 'Goal not found' }, { status: 404 });

    if (goal.userId !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.goal.delete({ where: { id } });

    revalidatePath('/my-goals');

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Delete goal API error', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
