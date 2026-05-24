// src/components/DealList.tsx

"use client";

import { useState, useMemo } from "react";
// Local Deal type (Prisma model was removed or not present) — keep typing local to avoid TS errors
type Deal = {
  id: string;
  category: string;
  company?: string;
  title: string;
  imageUrl?: string | null;
  description?: string | null;
  affiliateUrl?: string | null;
};
import DealCard from "./DealCard";


export default function DealList({ deals }: { deals: Deal[] }) {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(deals.map(d => d.category)))];

  const filteredDeals = useMemo(() => {
    if (selectedCategory === "All") return deals;
    return deals.filter(deal => deal.category === selectedCategory);
  }, [deals, selectedCategory]);

  return (
    <div>
      {/* Category Filter Buttons */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {categories.map((category) => (
          <button 
            key={category} 
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${selectedCategory === category ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted text-muted-foreground"}`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredDeals.map((deal) => (
          <DealCard key={deal.id} deal={deal} />
        ))}
      </div>
    </div>
  );
}