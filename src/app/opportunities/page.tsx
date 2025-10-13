
// src/app/opportunities/page.tsx

import prisma from "@/lib/prisma";
import OpportunityList from "@/components/OpportunityList";

export default async function OpportunitiesPage() {
  const opportunities = await prisma.opportunity.findMany({
    where: {
      status: 'PUBLISHED', // CHANGED: 'APPROVED' → 'PUBLISHED'
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-extrabold text-foreground">
          Discover Your Next{" "}
          <span className="bg-gradient-to-r from-primary to-yellow-400 text-transparent bg-clip-text animate-gradient">
            Opportunity
          </span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          From internships and hackathons to workshops and scholarships, your next big move starts here.
        </p>
      </div>

      <OpportunityList opportunities={opportunities} />
    </div>
  );
}