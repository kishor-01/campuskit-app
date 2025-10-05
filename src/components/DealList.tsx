// src/components/DealList.tsx

"use client";

import { useState, useMemo } from "react";
import type { Deal } from "@prisma/client";
import { motion, AnimatePresence } from "framer-motion";
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

      {/* Animated Grid */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {filteredDeals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}