import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // Check for authorization header if you want to secure this cron route
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== \`Bearer \${process.env.CRON_SECRET}\`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    console.log('Starting Opportunities Status check worker...');

    const now = new Date();

    // Move expired opportunities to PENDING. 
    // PENDING acts as a queue for Admins to update dates for the next annual cohort
    const result = await prisma.opportunity.updateMany({
      where: {
        status: 'PUBLISHED',
        endDate: {
          not: null,
          lt: now
        }
      },
      data: {
        status: 'PENDING'
      }
    });

    console.log(`Opportunities Status check completed. Updated ${result.count} to PENDING.`);

    return NextResponse.json({
      success: true,
      message: `Opportunities expiration check completed.`,
      stats: {
        updatedToPending: result.count
      }
    });

  } catch (error) {
    console.error('Error in Opportunities Status cron:', error);
    return NextResponse.json(
      { error: 'Internal server error during opportunities status check.' },
      { status: 500 }
    );
  }
}
