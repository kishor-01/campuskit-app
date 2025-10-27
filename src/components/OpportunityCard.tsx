// src/components/OpportunityCard.tsx
'use client';

import { motion } from 'framer-motion';
import { Opportunity } from '@prisma/client';
import { ArrowUpRight, Briefcase, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface OpportunityCardProps {
  opportunity: Opportunity;
}

// Helper to format enum values for display (e.g., FULL_TIME -> Full Time)
const formatTypeLabel = (type: string) => {
  return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export default function OpportunityCard({ opportunity }: OpportunityCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0 10px 20px -5px rgba(0,0,0,0.07)" }}
      className="h-full bg-card border border-border rounded-xl overflow-hidden flex flex-col group"
    >
      {/* Image Section */}
      <div className="relative aspect-video overflow-hidden">
        {opportunity.imageUrl ? (
          <Image
            src={opportunity.imageUrl}
            alt={opportunity.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          // Elegant placeholder for missing images
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Briefcase className="w-10 h-10 text-muted-foreground/50" />
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 flex-grow flex flex-col">
        <span className="text-xs bg-primary/10 text-primary font-bold px-2 py-1 rounded-full self-start">
          {formatTypeLabel(opportunity.type)}
        </span>

        <h3 className="text-lg font-bold text-foreground mt-3 group-hover:text-primary transition-colors">
          {opportunity.title}
        </h3>
        <p className="text-sm font-semibold text-muted-foreground">
          {opportunity.organization}
        </p>
        
        <div className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
          <MapPin size={14} />
          <span>{opportunity.location}</span>
        </div>

        <div className="flex-grow" /> 

        <Link
          href={`/opportunities/${opportunity.id}`}
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary self-start"
        >
          View Details <ArrowUpRight size={16} />
        </Link>
      </div>
    </motion.div>
  );
}
