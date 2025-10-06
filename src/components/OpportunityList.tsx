// src/components/OpportunityList.tsx

"use client";

import { useState, useMemo } from "react";
import type { Opportunity } from "@prisma/client";
import { motion, AnimatePresence } from "framer-motion";
import OpportunityCard from "./OpportunityCard";

export default function OpportunityList({ opportunities }: { opportunities: Opportunity[] }) {
  const [selectedType, setSelectedType] = useState("All");

  const types = ["All", ...Array.from(new Set(opportunities.map(o => o.type)))];

  const filteredOpportunities = useMemo(() => {
    if (selectedType === "All") return opportunities;
    return opportunities.filter(op => op.type === selectedType);
  }, [opportunities, selectedType]);

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {types.map((type) => (
          <button 
            key={type} 
            onClick={() => setSelectedType(type)}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${selectedType === type ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted text-muted-foreground"}`}
          >
            {type.replace("_", " ")}
          </button>
        ))}
      </div>

      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {filteredOpportunities.map((opportunity) => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
