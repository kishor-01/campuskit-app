// /src/app/admin/roadmaps/[id]/page.tsx

import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import ManageStepsClientPage from "./ManageStepsClientPage";

export default async function ManageRoadmapStepsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const [roadmap, allApprovedResources] = await Promise.all([
    prisma.roadmap.findUnique({
      where: { id: resolvedParams.id },
      include: {
        branches: {
          orderBy: { order: 'asc' },
        },
        steps: {
          orderBy: { order: 'asc' },
          include: {
            linkedResources: true,
            branch: true,
          },
        },
      },
    }),
    prisma.resource.findMany({
      where: { status: 'APPROVED' },
      orderBy: { name: 'asc' },
    })
  ]);

  if (!roadmap) {
    notFound();
  }

  return (
    <ManageStepsClientPage
      roadmap={roadmap}
      allApprovedResources={allApprovedResources}
    />
  );
}