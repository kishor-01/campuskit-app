// src/app/api/admin/resources/[id]/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

// Validation schema
const updateSchema = z.object({
  name: z.string().min(3).max(200).optional(),
  url: z.string().url().max(1000).optional(),
  description: z.string().min(0).max(5000).optional(),
  categoryId: z.string().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional()
});

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!session.user.isAdmin) {
    return NextResponse.json({ error: 'Forbidden: admins only' }, { status: 403 });
  }
  return session;
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    if (admin instanceof Response) return admin;

    const id = params.id;
    if (!id) return NextResponse.json({ error: 'Resource ID missing' }, { status: 400 });

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.format() }, { status: 400 });
    }

    const updated = await prisma.resource.update({
      where: { id },
      data: parsed.data
    });

    revalidatePath('/admin/resources');
    revalidatePath('/resources');

    return NextResponse.json({ success: true, resource: updated });
  } catch (err: any) {
    console.error('PATCH /api/admin/resources/[id] error', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    if (admin instanceof Response) return admin;

    const id = params.id;
    if (!id) return NextResponse.json({ error: 'Resource ID missing' }, { status: 400 });

    await prisma.resource.delete({ where: { id } });

    revalidatePath('/admin/resources');
    revalidatePath('/resources');

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('DELETE /api/admin/resources/[id] error', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
