// src/app/opportunities/page.tsx
import prisma from '@/lib/prisma';
import { OpportunityType, OpportunityStatus, OpportunityTier } from '@prisma/client';
import OpportunityList from '@/components/OpportunityList';
import React from 'react';

// Define how many opportunities to show per page
const OPPORTUNITIES_PER_PAGE = 12;

export const revalidate = 60;

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Ensure searchParams is awaited (Next.js can require awaiting dynamic APIs)
  const sp = await searchParams as { [key: string]: string | string[] | undefined };

  // Get current page, type, and tier from URL search parameters
  const page = parseInt((Array.isArray(sp?.page) ? sp?.page[0] : sp?.page) as string) || 1;
  const type = (Array.isArray(sp?.type) ? sp?.type[0] : sp?.type) as OpportunityType | undefined;
  const tier = (Array.isArray(sp?.tier) ? sp?.tier[0] : sp?.tier) as OpportunityTier | undefined;

  // Build the filter for our Prisma query
  const whereClause = {
    status: OpportunityStatus.PUBLISHED,
    publishedAt: { lte: new Date() },
    ...(type && { type: type }),
    ...(tier && { tier: tier }),
  };

  try {
    // Fetch all necessary data in parallel for maximum performance
    const [
      opportunities,
      totalOpportunities,
    ] = await Promise.all([
      // Fetch the paginated list of opportunities based on the filter
      prisma.opportunity.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * OPPORTUNITIES_PER_PAGE,
        take: OPPORTUNITIES_PER_PAGE,
      }),
      // Get the total count of opportunities that match the filter for pagination
      prisma.opportunity.count({ where: whereClause }),
    ]);

    // Get all possible enum values for the filter sidebar
    const allTypes = Object.values(OpportunityType);

    // Calculate the total number of pages needed for pagination
    const totalPages = Math.ceil(totalOpportunities / OPPORTUNITIES_PER_PAGE);

    // Pass all the fetched data to the client component for rendering
    return (
      <OpportunityList
        opportunities={opportunities}
        types={allTypes}
        totalPages={totalPages}
        currentPage={page}
        currentType={type}
        currentTier={tier}
      />
    );

  } catch (err) {
    // Graceful error handling in case the database is unavailable
    console.error('OpportunitiesPage server error:', err);
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Could Not Fetch Opportunities</h2>
          <p className="text-muted-foreground">
            There was an issue connecting to the database. Please try again later.
          </p>
        </div>
      </div>
    );
  }
}
