// src/components/OpportunityCard.tsx

"use client";

import type { Opportunity } from "@prisma/client";
import { motion } from "framer-motion";
import { ArrowUpRight, Calendar, MapPin } from "lucide-react";

// Helper to format dates
const formatDate = (date: Date | null | undefined) => {
  if (!date) return null;
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(date));
};

export default function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  const startDate = formatDate(opportunity.startDate);
  const endDate = formatDate(opportunity.endDate);

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, type: "spring" }}
      className="relative p-6 bg-muted/50 rounded-xl overflow-hidden group border border-transparent hover:border-primary/50 transition-colors h-full flex flex-col"
    >
      <div className="flex-grow">
        <div className="flex items-start justify-between mb-3">
          <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full uppercase">
            {opportunity.type.replace("_", " ")}
          </span>
          {opportunity.imageUrl && (
            <img src={opportunity.imageUrl} alt={`${opportunity.organization} logo`} className="w-10 h-10 rounded-md object-contain bg-white p-1" />
          )}
        </div>
        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{opportunity.title}</h3>
        <p className="text-sm font-semibold text-muted-foreground mt-1">{opportunity.organization}</p>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3"/>
            <span>{opportunity.location}</span>
          </div>
          {(startDate || endDate) && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3"/>
              <span>{startDate}{endDate && startDate !== endDate ? ` - ${endDate}` : ''}</span>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground/80 mt-3 line-clamp-2">{opportunity.description}</p>
      </div>

      <a 
        href={`/opportunities/${opportunity.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-lg text-sm inline-flex items-center self-start"
      >
        View Details <ArrowUpRight className="w-4 h-4 ml-1" />
      </a>
    </motion.div>
  );
}