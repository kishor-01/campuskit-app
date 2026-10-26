// src/app/admin/moderation/page.tsx
import prisma from "@/lib/prisma";
import ModerationClient from "./ModerationClient";

export const dynamic = "force-dynamic";

export default async function ModerationPage() {
  const reports = await prisma.contentReport.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-foreground mb-2">Moderation Queue</h1>
        <p className="text-muted-foreground">Review user reports for inappropriate content across the platform.</p>
      </div>
      <ModerationClient reports={reports} />
    </div>
  );
}
