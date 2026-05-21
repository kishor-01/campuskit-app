'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { ResourceStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const submissionSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  url: z.string().url("Must be a valid URL"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  categoryId: z.string().min(1, "Category is required"),
});

export async function submitResource(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'You must be logged in to submit a resource.' };
    }

    const data = {
      title: formData.get('title') as string,
      url: formData.get('url') as string,
      description: formData.get('description') as string,
      categoryId: formData.get('categoryId') as string,
    };

    const validatedData = submissionSchema.parse(data);

    const submission = await prisma.resourceSubmission.create({
      data: {
        ...validatedData,
        userId: session.user.id,
      },
    });

    return { success: true, id: submission.id };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    console.error('Submission error:', error);
    return { error: 'Failed to submit resource. Please try again.' };
  }
}

export async function approveSubmission(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return { error: 'Unauthorized' };
    }

    const submission = await prisma.resourceSubmission.findUnique({
      where: { id },
    });

    if (!submission) {
      return { error: 'Submission not found' };
    }

    if (submission.status !== 'PENDING') {
      return { error: 'Submission is not pending' };
    }

    // Run in a transaction
    await prisma.$transaction(async (tx) => {
      // 1. Create the official Resource
      await tx.resource.create({
        data: {
          name: submission.title,
          url: submission.url,
          description: submission.description,
          categoryId: submission.categoryId,
          submittedById: submission.userId,
          status: 'APPROVED',
          difficultyTier: 'INTERMEDIATE', // default
          healthStatus: 'HEALTHY',
          seniorInsight: 'Community Contributed Resource',
        },
      });

      // 2. Update submission status
      await tx.resourceSubmission.update({
        where: { id },
        data: { status: 'APPROVED' },
      });

      // 3. Log AnalyticsEvent for the user's Heatmap
      await tx.analyticsEvent.create({
        data: {
          eventType: 'RESOURCE_CONTRIBUTED',
          userId: submission.userId,
          metadata: {
            submissionId: submission.id,
            resourceTitle: submission.title,
          },
        },
      });

      // 4. Automatically create a COMMUNITY notification for the user
      await tx.notification.create({
        data: {
          userId: submission.userId,
          title: 'Resource Approved',
          message: 'Your resource was approved and added to the platform!',
          type: 'COMMUNITY',
        },
      });
    });

    revalidatePath('/admin/submissions');
    revalidatePath('/profile');
    
    return { success: true };
  } catch (error) {
    console.error('Approval error:', error);
    return { error: 'Failed to approve submission' };
  }
}

export async function rejectSubmission(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return { error: 'Unauthorized' };
    }

    await prisma.resourceSubmission.update({
      where: { id },
      data: { status: 'REJECTED' },
    });

    revalidatePath('/admin/submissions');
    
    return { success: true };
  } catch (error) {
    console.error('Rejection error:', error);
    return { error: 'Failed to reject submission' };
  }
}
