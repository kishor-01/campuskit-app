// /src/app/admin/roadmaps/[id]/page.tsx

import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import ManageStepsClientPage from "./ManageStepsClientPage";

export default async function ManageRoadmapStepsPage({ params }: { params: { id: string } }) {
  const [roadmap, allApprovedResources] = await Promise.all([
    prisma.roadmap.findUnique({
      where: { id: params.id },
      include: {
        steps: {
          orderBy: { order: 'asc' },
          include: {
            linkedResources: true,
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