// /src/app/admin/roadmaps/page.tsx

import prisma from "@/lib/prisma";
import RoadmapsClientPage from "./RoadmapsClientPage";

export default async function RoadmapsAdminPage() {
  const roadmaps = await prisma.roadmap.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      steps: {
        select: { id: true }
      },
    },
  });

  return <RoadmapsClientPage roadmaps={roadmaps} />;
}