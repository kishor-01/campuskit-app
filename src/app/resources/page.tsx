// src/app/resources/page.tsx
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import ResourceList from '@/components/ResourceList';
import React from 'react';
import { ResourceStatus, type Resource, type Category } from '@prisma/client';

// Define how many resources to show per page
const RESOURCES_PER_PAGE = 12;

// Define the proper type that matches what ResourceList expects
type ResourceWithCategory = Resource & {
  category: Category;
  isInitiallySaved: boolean;
};

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await auth();
  const userId = session?.user?.id;

  // Ensure searchParams is awaited (Next.js can require awaiting dynamic APIs)
  const sp = await searchParams as { [key: string]: string | string[] | undefined };

  // Get current page and category from URL search parameters
  const page = parseInt((Array.isArray(sp?.page) ? sp?.page[0] : sp?.page) as string) || 1;
  const category = (Array.isArray(sp?.category) ? sp?.category[0] : sp?.category) as string | undefined;

  // Build the filter for our Prisma query - use ResourceStatus enum
  const whereClause = {
    status: ResourceStatus.APPROVED, // Use enum instead of string
    ...(category && { category: { name: category } }),
  };

  try {
    // Fetch all necessary data in parallel for maximum performance
    const [
      resources,
      totalResources,
      allCategories,
      savedResources,
    ] = await Promise.all([
      // Fetch the paginated list of resources based on the filter
      prisma.resource.findMany({
        where: whereClause,
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * RESOURCES_PER_PAGE,
        take: RESOURCES_PER_PAGE,
      }),
      // Get the total count of resources that match the filter for pagination
      prisma.resource.count({ where: whereClause }),
      // Fetch all unique categories to build our filter sidebar
      prisma.category.findMany({ orderBy: { name: 'asc' } }),
      // If the user is logged in, fetch their saved resources to mark cards correctly
      userId ? prisma.savedResource.findMany({ where: { userId } }) : [],
    ]);

    // Create a Set for quick lookups of saved resource IDs
    const savedResourceIds = new Set(savedResources.map((s) => s.resourceId));
    
    // Combine resource data with its saved status for the client
    const resourcesWithSaveStatus: ResourceWithCategory[] = resources.map((resource) => ({
      ...resource,
      isInitiallySaved: savedResourceIds.has(resource.id),
    }));

    // Calculate the total number of pages needed for pagination
    const totalPages = Math.ceil(totalResources / RESOURCES_PER_PAGE);

    // Pass all the fetched and processed data to the client component for rendering
    return (
      <ResourceList
        resources={resourcesWithSaveStatus}
        categories={allCategories}
        totalPages={totalPages}
        currentPage={page}
        currentCategory={category}
      />
    );

  } catch (err) {
    // Graceful error handling in case the database is unavailable
    console.error('ResourcesPage server error:', err);
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Could Not Fetch Resources</h2>
          <p className="text-muted-foreground">
            There was an issue connecting to the database. Please try again later.
          </p>
        </div>
      </div>
    );
  }
}