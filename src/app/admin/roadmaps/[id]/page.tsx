
//src/app/admin/roadmaps/[id]/page.tsx

import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import ManageStepsClientPage from "./ManageStepsClientPage"; // This is the interactive component we are creating next

// This Server Component's only job is to fetch data.
export default async function ManageRoadmapStepsPage({ params }: { params: { id: string } }) {
  // Fetch the specific roadmap and all approved resources in parallel.
  const [roadmap, allApprovedResources] = await Promise.all([
    prisma.roadmap.findUnique({
      where: { id: params.id },
      include: {
        steps: {
          orderBy: { order: 'asc' },
          include: {
            linkedResources: true, // Include linked resources for each step
          },
        },
      },
    }),
    prisma.resource.findMany({
      where: { status: 'APPROVED' },
      orderBy: { name: 'asc' },
    })
  ]);

  // If the roadmap isn't found, show a 404 page.
  if (!roadmap) {
    notFound();
  }

  // Pass the fetched data as props to the Client Component.
  return (
    <ManageStepsClientPage
      roadmap={roadmap}
      allApprovedResources={allApprovedResources}
    />
  );
}
