// src/app/my-goals/[id]/page.tsx

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { notFound, redirect } from 'next/navigation';
import GoalDetailClientPage from './GoalDetailClientPage'; // The new client component

type Params = { params: { id: string } };

export default async function GoalDetailPage({ params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  // Fetch all necessary data in parallel
  const [goal, allApprovedResources] = await Promise.all([
    prisma.goal.findUnique({
      where: { id: params.id, userId: session.user.id },
      include: {
        milestones: {
          orderBy: { order: 'asc' },
          include: {
            topics: {
              orderBy: { order: 'asc' },
              include: {
                subTopics: {
                  orderBy: { order: 'asc' },
                  include: {
                    linkedResources: {
                      include: {
                        resource: {
                          select: { id: true, name: true, url: true }
                        }
                      }
                    }
                  }
                },
                linkedResources: {
                  include: {
                    resource: {
                      select: { id: true, name: true, url: true }
                    }
                  }
                }
              },
            },
          },
        },
      },
    }),
    prisma.resource.findMany({
      where: { status: 'APPROVED' },
      orderBy: { name: 'asc' },
    })
  ]);

  if (!goal) {
    notFound();
  }

  return (
    <GoalDetailClientPage goal={goal} allResources={allApprovedResources} />
  );
}