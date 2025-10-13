// /src/actions/affiliateActions.ts
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

// Zod Schema for Affiliate Partner
const PartnerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Partner name is required."),
  website: z.string().url("Must be a valid URL."),
  description: z.string().optional(),
});

// Zod Schema for Affiliate Link
const LinkSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Link name is required."),
  url: z.string().url("Must be a valid URL."),
  slug: z.string().min(3, "Slug is required.").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens."),
  partnerId: z.string().min(1, "A partner must be selected."),
});


// --- Affiliate Partner Actions ---

export async function createAffiliatePartner(prevState: any, formData: FormData) {
  try {
    await requireAdmin();
    const validatedFields = PartnerSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
      return { error: validatedFields.error.flatten().fieldErrors };
    }
    const { name, website, description } = validatedFields.data;
    await prisma.affiliatePartner.create({ data: { name, website, description } });
    revalidatePath('/admin/affiliates');
    return { message: 'Partner created successfully.' };
  } catch (e: any) {
    return { error: e.message || 'Failed to create partner.' };
  }
}

export async function updateAffiliatePartner(prevState: any, formData: FormData) {
  try {
    await requireAdmin();
    const validatedFields = PartnerSchema.extend({ id: z.string().min(1) }).safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
      return { error: validatedFields.error.flatten().fieldErrors };
    }
    const { id, ...data } = validatedFields.data;
    await prisma.affiliatePartner.update({ where: { id }, data });
    revalidatePath('/admin/affiliates');
    return { message: 'Partner updated successfully.' };
  } catch (e: any) {
    return { error: e.message || 'Failed to update partner.' };
  }
}

export async function deleteAffiliatePartner(prevState: any, formData: FormData) {
  try {
    await requireAdmin();
    const id = formData.get('id') as string;
    if (!id) return { error: 'Partner ID is required.' };
    await prisma.affiliatePartner.delete({ where: { id } });
    revalidatePath('/admin/affiliates');
    return { message: 'Partner deleted successfully.' };
  } catch (e: any) {
    return { error: e.message || 'Failed to delete partner.' };
  }
}


// --- Affiliate Link Actions ---

export async function createAffiliateLink(prevState: any, formData: FormData) {
  try {
    await requireAdmin();
    const validatedFields = LinkSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
      return { error: validatedFields.error.flatten().fieldErrors };
    }
    await prisma.affiliateLink.create({ data: validatedFields.data });
    revalidatePath('/admin/affiliates');
    return { message: 'Link created successfully.' };
  } catch (e: any) {
    return { error: e.message || 'Failed to create link.' };
  }
}

export async function updateAffiliateLink(prevState: any, formData: FormData) {
  try {
    await requireAdmin();
    const validatedFields = LinkSchema.extend({ id: z.string().min(1) }).safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
      return { error: validatedFields.error.flatten().fieldErrors };
    }
    const { id, ...data } = validatedFields.data;
    await prisma.affiliateLink.update({ where: { id }, data });
    revalidatePath('/admin/affiliates');
    return { message: 'Link updated successfully.' };
  } catch (e: any) {
    return { error: e.message || 'Failed to update link.' };
  }
}

export async function deleteAffiliateLink(prevState: any, formData: FormData) {
  try {
    await requireAdmin();
    const id = formData.get('id') as string;
    if (!id) return { error: 'Link ID is required.' };
    await prisma.affiliateLink.delete({ where: { id } });
    revalidatePath('/admin/affiliates');
    return { message: 'Link deleted successfully.' };
  } catch (e: any) {
    return { error: e.message || 'Failed to delete link.' };
  }
}