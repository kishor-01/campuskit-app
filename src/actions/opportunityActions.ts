// /src/actions/opportunityActions.ts

'use server'

import prisma from '@/lib/prisma'
import { OpportunityType, OpportunityStatus, OpportunityTier, DifficultyTier } from '@prisma/client'
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

// Zod Schema for validation — Phase 2 with strategic fields
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
  visualizations: z.string().optional(),

  // Phase 2: Strategic fields
  tier: z.enum(["TIER_1", "TIER_2", "TIER_3"]).optional(),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "SENIOR"]).optional(),
  stipendRange: z.union([z.string().optional(), z.literal("")]).optional(),
  duration: z.union([z.string().optional(), z.literal("")]).optional(),
  skillsRequired: z.string().optional(), // Comma-separated, parsed into array
  seniorInsight: z.string().optional(),
  prepResources: z.string().optional(),   // Newline-separated URLs, parsed into array
  isRemote: z.string().optional(),        // "on" or undefined from checkbox
  publishedAt: z.string().optional(),
  authorOverride: z.string().optional(),
});

// Parse comma-separated string into trimmed array, filtering empties
function parseCommaSeparated(value: string | undefined | null): string[] {
  if (!value || value.trim() === '') return [];
  return value.split(',').map(s => s.trim()).filter(Boolean);
}

// Parse newline-separated string into trimmed array, filtering empties
function parseNewlineSeparated(value: string | undefined | null): string[] {
  if (!value || value.trim() === '') return [];
  return value.split('\n').map(s => s.trim()).filter(Boolean);
}

// Validate endDate is not in the past (soft warning — returns null if invalid for new entries)
function validateEndDate(endDateStr: string | undefined): Date | null {
  if (!endDateStr || endDateStr === '') return null;
  const date = new Date(endDateStr);
  if (isNaN(date.getTime())) return null;
  return date;
}

// Tier-1 audit logging + Discord notification
async function auditTier1Opportunity(title: string, organization: string, action: string) {
  console.log(`🏆 [TIER-1 AUDIT] ${action}: "${title}" by ${organization} at ${new Date().toISOString()}`);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  await sendDiscordNotification(process.env.DISCORD_OPPORTUNITIES_WEBHOOK_URL, {
    title: `🏆 Tier-1 Alert: ${title}`,
    description: `**Organization:** ${organization}\n**Action:** ${action}\n**Tier:** TIER_1 — Elite Global Program`,
    url: `${siteUrl}/opportunities`,
    color: 16766720, // Gold color
    author: { name: 'Seniofy Competitive Intelligence Hub' },
  });
}

// Extract the common data preparation logic
function prepareOpportunityData(validatedData: z.infer<typeof OpportunitySchema>) {
  const {
    id, startDate, endDate, status, visualizations,
    tier, difficulty, stipendRange, duration,
    skillsRequired, seniorInsight, prepResources, isRemote,
    publishedAt, authorOverride,
    ...coreData
  } = validatedData;

  const parsedVisualizations = visualizations ? [{ type: 'mermaid', content: visualizations }] : undefined;
  const parsedPublishedAt = publishedAt ? new Date(publishedAt) : new Date();

  return {
    ...coreData,
    startDate: startDate ? new Date(startDate) : null,
    endDate: validateEndDate(endDate),
    status: status || 'PUBLISHED',
    visualizations: parsedVisualizations,
    tier: (tier as OpportunityTier) || 'TIER_3',
    difficulty: (difficulty as DifficultyTier) || 'INTERMEDIATE',
    stipendRange: stipendRange || null,
    duration: duration || null,
    skillsRequired: parseCommaSeparated(skillsRequired),
    seniorInsight: seniorInsight || "Focus on building a strong portfolio to stand out.",
    prepResources: parseNewlineSeparated(prepResources),
    isRemote: isRemote === 'on' || isRemote === 'true',
    publishedAt: parsedPublishedAt,
    authorOverride: authorOverride || null,
  };
}

// From public submission form (no auth required)
export async function submitOpportunity(formData: FormData) {
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
    data: { ...data, status: 'PENDING' } as any,
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

    const preparedData = prepareOpportunityData(validatedFields.data);
    const { status, ...createData } = preparedData;

    await prisma.opportunity.create({
      data: {
        ...createData,
        status: status as OpportunityStatus,
      } as any,
    });

    // Tier-1 audit: fire when a Tier-1 opportunity is created as PUBLISHED
    if (preparedData.tier === 'TIER_1' && preparedData.status === 'PUBLISHED') {
      await auditTier1Opportunity(createData.title, createData.organization, 'CREATED & PUBLISHED');
    }

    revalidatePath("/admin/opportunities");
    return { message: `Opportunity "${createData.title}" created.` };
  } catch (error) {
    console.error("Failed to create opportunity:", error);
    return { error: "Database error: Failed to create opportunity." };
  }
}

export async function updateOpportunity(prevState: any, formData: FormData) {
  try {
    await requireAdmin();

    const validatedFields = OpportunitySchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
      return { error: validatedFields.error.flatten().fieldErrors };
    }

    const { id } = validatedFields.data;
    if (!id) return { error: "Opportunity ID is missing." };

    const preparedData = prepareOpportunityData(validatedFields.data);
    const { status, ...updateData } = preparedData;

    await prisma.opportunity.update({
      where: { id },
      data: {
        ...updateData,
        status: status as OpportunityStatus,
      },
    });

    revalidatePath("/admin/opportunities");
    return { message: `Opportunity "${updateData.title}" updated.` };
  } catch (error) {
    console.error("Failed to update opportunity:", error);
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

    // Tier-1 audit: fire only when a TIER_1 opportunity transitions to PUBLISHED
    if (updatedOpportunity.tier === 'TIER_1' && status === 'PUBLISHED') {
      await auditTier1Opportunity(
        updatedOpportunity.title,
        updatedOpportunity.organization,
        'STATUS → PUBLISHED'
      );
    } else if (status === 'PUBLISHED') {
      // Standard Discord notification for non-Tier-1 published opportunities
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