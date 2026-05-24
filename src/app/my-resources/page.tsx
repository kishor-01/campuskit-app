// src/app/my-resources/page.tsx

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import SavedResourceList from "@/components/SavedResourceList"; // We will create this next

export default async function MyResourcesPage() {
  const session = await auth();
  const userId = session?.user?.id;

  // Protect the route: if no user, redirect to login
  if (!userId) {
    redirect('/login');
  }

  // Fetch ALL of the user's saved resources
  const savedResources = await prisma.savedResource.findMany({
    where: { userId },
    include: {
      resource: { // Include the full resource data for each saved item
        include: {
          category: true, // Also include the category for filtering
          _count: {
            select: { savedByUsers: true }
          }
        }
      },
    },
    orderBy: {
      createdAt: 'desc', // Show the most recently saved items first
    },
  });

  // Extract just the resource data and add the saved date
  const resources = savedResources.map(item => ({
    ...item.resource,
    isInitiallySaved: true,
    savedAt: item.createdAt
  }));

  // Pass the data to our interactive client component
  return <SavedResourceList resources={resources} />;
}