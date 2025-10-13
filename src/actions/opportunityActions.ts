// /src/actions/opportunityActions.ts
'use server'

import prisma from '@/lib/prisma'
// FIX: Combined OpportunityType and OpportunityStatus into a single import
import { OpportunityType, OpportunityStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { sendDiscordNotification } from '@/lib/discordNotifier'
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
const OpportunitySchema = z.object({
  id: z.string().optional(),
  title: z.string().min(5, "Title must be at least 5 characters."),
  organization: z.string().min(2, "Organization name is required."),
  applyUrl: z.string().url("Must be a valid URL."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  imageUrl: z.union([z.string().url().optional(), z.literal("")]).optional(),
  location: z.string().min(2, "Location is required."),
  type: z.enum(["INTERNSHIP", "FULL_TIME", "HACKATHON", "WORKSHOP", "SEMINAR", "SCHOLARSHIP", "COMPETITION", "DEAL"]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(["PUBLISHED", "PENDING"]).optional(),
});

// From public submission form (no auth required)
export async function submitOpportunity(formData: FormData) {
  // This function is correct
  const data = {
    title: formData.get('title') as string,
    organization: formData.get('organization') as string,
    location: formData.get('location') as string,
    type: formData.get('type') as OpportunityType,
    description: formData.get('description') as string,
    applyUrl: formData.get('applyUrl') as string,
  }

  if (!data.title || !data.organization || !data.applyUrl || !data.type) {
    throw new Error('Required fields are missing.')
  }

  await prisma.opportunity.create({
    data: { ...data, status: 'PENDING' },
  })

  redirect('/post-opportunity/thank-you')
}

// --- Admin Actions ---

export async function createOpportunity(prevState: any, formData: FormData) {
  try {
    await requireAdmin();
    const validatedFields = OpportunitySchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
      return { error: validatedFields.error.flatten().fieldErrors };
    }
    // FIX: Destructured 'status' so it can be used below
    const { startDate, endDate, status, ...data } = validatedFields.data;
    await prisma.opportunity.create({
      data: {
        ...data,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        // The 'status' variable from the form is now correctly used
        status: status || 'PUBLISHED',
      },
    });
    revalidatePath("/admin/opportunities");
    return { message: `Opportunity "${data.title}" created.` };
  } catch (error) {
    return { error: "Database error: Failed to create opportunity." };
  }
}

// ... update and delete functions are correct ...
export async function updateOpportunity(prevState: any, formData: FormData) {
  try {
    await requireAdmin();
    const validatedFields = OpportunitySchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
      return { error: validatedFields.error.flatten().fieldErrors };
    }
    const { id, startDate, endDate, ...data } = validatedFields.data;
    if (!id) return { error: "Opportunity ID is missing." };
    await prisma.opportunity.update({
      where: { id },
      data: {
        ...data,
        startDate: startDate && startDate !== '' ? new Date(startDate) : null,
        endDate: endDate && endDate !== '' ? new Date(endDate) : null,
      },
    });
    revalidatePath("/admin/opportunities");
    return { message: `Opportunity "${data.title}" updated.` };
  } catch (error) {
    return { error: "Database error: Failed to update opportunity." };
  }
}

export async function deleteOpportunity(prevState: any, formData: FormData) {
  try {
    await requireAdmin();
    const id = formData.get("id") as string;
    if (!id) return { error: "Opportunity's id is required." };

    await prisma.opportunity.delete({ where: { id } });
    revalidatePath("/admin/opportunities");
    return { message: 'Opportunity deleted.' };
  } catch (error) {
    return { error: "Failed to delete opportunity." };
  }
}


// This new function is correct
export async function updateOpportunityStatus(id: string, status: OpportunityStatus) {
  try {
    await requireAdmin();
    if (!id || !status) {
      return { error: "Opportunity ID and status are required." };
    }
    const updatedOpportunity = await prisma.opportunity.update({
      where: { id },
      data: { status },
    });
    if (status === 'PUBLISHED') {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      await sendDiscordNotification(process.env.DISCORD_OPPORTUNITIES_WEBHOOK_URL, {
        title: `💼 New Opportunity: ${updatedOpportunity.title}`,
        description: `**Company:** ${updatedOpportunity.organization}\n**Location:** ${updatedOpportunity.location}`,
        url: `${siteUrl}/opportunities`,
        color: 15105570,
        author: { name: 'A new opportunity was published!' },
      });
    }
    revalidatePath("/admin/opportunities");
    return { message: `Opportunity status updated to ${status.toLowerCase()}.` };
  } catch (error) {
    console.error("Failed to update opportunity status:", error);
    return { error: "Failed to update opportunity status." };
  }
}