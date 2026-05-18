// /src/app/admin/roadmaps/page.tsx

import prisma from "@/lib/prisma";
import RoadmapsClientPage from "./RoadmapsClientPage";
import SearchControl from "@/components/admin/SearchControl";

export default async function RoadmapsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const sp = await searchParams;
  const search = sp.search || "";

  const roadmaps = await prisma.roadmap.findMany({
    where: search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }
      : {},
    orderBy: { createdAt: "desc" },
    include: {
      steps: true,
    },
  });

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-2">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">Manage Roadmaps</h1>
          <SearchControl placeholder="Search roadmaps..." paramName="search" />
        </div>
      </div>
      <RoadmapsClientPage roadmaps={roadmaps} />
    </div>
  );
}