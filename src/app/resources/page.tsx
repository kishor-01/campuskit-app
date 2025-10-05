// src/app/resources/page.tsx

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import ResourceList from "@/components/ResourceList"; // Import our new Client Component

// This page is now a pure Server Component. No "use client" here.
export default async function ResourcesPage() {
  const session = await auth();
  const userId = session?.user?.id;

  // Fetch all the initial data on the server
  const [resources, savedResources] = await Promise.all([
    prisma.resource.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    userId ? prisma.savedResource.findMany({ where: { userId } }) : [],
  ]);

  const savedResourceIds = new Set(savedResources.map((s) => s.resourceId));

  const allResources = resources.map(resource => ({
    ...resource,
    isInitiallySaved: savedResourceIds.has(resource.id)
  }));

  // Render the Client Component and pass the data to it as props
  return <ResourceList resources={allResources} />;
}