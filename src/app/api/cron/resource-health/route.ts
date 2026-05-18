import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ResourceHealth } from '@prisma/client';

export async function GET(request: Request) {
  try {
    // Check for authorization header if you want to secure this cron route
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== \`Bearer \${process.env.CRON_SECRET}\`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    console.log('Starting Resource Health check worker...');

    // Fetch resources that haven't been checked recently or are in WARNING state
    // For now, we check all ACTIVE/APPROVED resources
    const resources = await prisma.resource.findMany({
      where: {
        status: 'APPROVED'
      },
      select: {
        id: true,
        url: true,
        healthStatus: true
      }
    });

    let healthyCount = 0;
    let warningCount = 0;
    const updatePromises = [];

    for (const resource of resources) {
      try {
        // Simple HEAD request to verify URL existence without downloading full content
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(resource.url, { 
          method: 'HEAD',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        const isHealthy = response.ok;
        
        if (isHealthy && resource.healthStatus !== ResourceHealth.HEALTHY) {
          updatePromises.push(
            prisma.resource.update({
              where: { id: resource.id },
              data: { healthStatus: ResourceHealth.HEALTHY }
            })
          );
          healthyCount++;
        } else if (!isHealthy && resource.healthStatus !== ResourceHealth.WARNING) {
          // If a link fails, flag it for human review. Do not delete or set DEAD immediately.
          // "A Senior knows that temporary outages happen, and we don't want to lose elite content due to a 5-minute server hiccup."
          updatePromises.push(
            prisma.resource.update({
              where: { id: resource.id },
              data: { healthStatus: ResourceHealth.WARNING }
            })
          );
          warningCount++;
        }
      } catch (error) {
        // Network errors or timeouts should also result in a WARNING
        if (resource.healthStatus !== ResourceHealth.WARNING) {
          updatePromises.push(
            prisma.resource.update({
              where: { id: resource.id },
              data: { healthStatus: ResourceHealth.WARNING }
            })
          );
          warningCount++;
        }
      }
    }

    await Promise.all(updatePromises);

    console.log(`Resource Health check completed. Updated ${healthyCount} to HEALTHY, ${warningCount} to WARNING.`);

    return NextResponse.json({
      success: true,
      message: `Health check completed. Checked ${resources.length} resources.`,
      stats: {
        healthyUpdated: healthyCount,
        warningUpdated: warningCount
      }
    });

  } catch (error) {
    console.error('Error in Resource Health cron:', error);
    return NextResponse.json(
      { error: 'Internal server error during health check.' },
      { status: 500 }
    );
  }
}
