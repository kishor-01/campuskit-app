// src/app/perks/page.tsx

import prisma from "@/lib/prisma";
import DealList from "@/components/DealList";

export default async function PerksPage() {
  const deals = await prisma.deal.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-extrabold text-foreground">
          Exclusive Perks,{" "}
          <span className="bg-gradient-to-r from-primary to-yellow-400 text-transparent bg-clip-text">
            Unlocked
          </span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          A curated collection of the best deals and discounts for students to help you save money.
        </p>
      </div>

      <DealList deals={deals} />
    </div>
  );
}