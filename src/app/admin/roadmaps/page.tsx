
//src/app/admin/roadmaps/page.tsx

import prisma from "@/lib/prisma";
// FIX: The import should be for 'RoadmapsClientPage' from the same directory
import RoadmapsClientPage from "./RoadmapsClientPage"; 

// This Server Component fetches all roadmaps
export default async function RoadmapsAdminPage() {
  const roadmaps = await prisma.roadmap.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      steps: {
        // We only need the count here, not the full step details
        select: { id: true }
      },
    },
  });

  // It then passes the fetched data to the Client Component
  return <RoadmapsClientPage roadmaps={roadmaps} />;
}

