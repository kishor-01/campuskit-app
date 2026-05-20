// src/components/OpportunityCard.tsx
'use client';

import { motion } from 'framer-motion';
import { Opportunity } from '@prisma/client';
import { MapPin, ArrowRight, Building2, Globe, Clock, DollarSign, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import ReportContentModal from './ReportContentModal';

interface OpportunityCardProps {
  opportunity: Opportunity;
}

const formatTypeLabel = (type: string) => {
  return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Calculate days until deadline
function getDaysUntilDeadline(endDate: Date | null | undefined): number | null {
  if (!endDate) return null;
  const now = new Date();
  const end = new Date(endDate);
  const diffMs = end.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

// Tier configuration
const tierConfig: Record<string, { label: string; borderClass: string; badgeClass: string; glowClass: string }> = {
  TIER_1: {
    label: '🥇 Tier 1',
    borderClass: 'border-amber-400/60',
    badgeClass: 'bg-gradient-to-r from-amber-500 to-yellow-400 text-white shadow-lg shadow-amber-500/25',
    glowClass: 'shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)]',
  },
  TIER_2: {
    label: '🥈 Tier 2',
    borderClass: 'border-slate-400/40',
    badgeClass: 'bg-gradient-to-r from-slate-400 to-slate-300 text-slate-800',
    glowClass: '',
  },
  TIER_3: {
    label: '🥉 Tier 3',
    borderClass: 'border-border',
    badgeClass: 'bg-muted text-muted-foreground',
    glowClass: '',
  },
};

export default function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const daysLeft = useMemo(() => getDaysUntilDeadline(opportunity.endDate), [opportunity.endDate]);
  const isUrgent = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7;
  const isExpired = daysLeft !== null && daysLeft < 0;
  const tier = tierConfig[opportunity.tier] || tierConfig.TIER_3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`group relative h-full bg-card border ${tier.borderClass} rounded-2xl overflow-hidden flex flex-col transition-all duration-300 ${tier.glowClass}`}
    >
      {/* Top Accent Bar — color based on tier */}
      <div className={`h-1 w-full transition-all duration-300 ${
        opportunity.tier === 'TIER_1'
          ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500'
          : opportunity.tier === 'TIER_2'
            ? 'bg-gradient-to-r from-slate-300 to-slate-400'
            : 'bg-primary/20 group-hover:bg-primary'
      }`} />

      <div className="absolute top-4 right-4 z-20">
        <ReportContentModal contentType="OPPORTUNITY" contentId={opportunity.id} />
      </div>

      <div className="p-5 flex flex-col h-full mt-4">
        {/* Header: Tier Badge + Type Badge + Urgency */}
        <div className="flex items-center justify-between mb-3 gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Tier Badge */}
            {opportunity.tier !== 'TIER_3' && (
              <span className={`text-[10px] uppercase tracking-widest font-extrabold px-2.5 py-1 rounded-md ${tier.badgeClass}`}>
                {tier.label}
              </span>
            )}
            {/* Type Badge — Glassmorphism */}
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-primary backdrop-blur-md bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-md">
              {formatTypeLabel(opportunity.type)}
            </span>
          </div>

          {/* Deadline Urgency Badge */}
          {isUrgent && !isExpired && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/50 px-2 py-0.5 rounded-full opp-deadline-pulse">
              <Clock size={10} /> {daysLeft === 0 ? 'Last Day!' : `${daysLeft}d left`}
            </span>
          )}
          {isExpired && (
            <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              Closed
            </span>
          )}
        </div>

        {/* Organization & Remote */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Building2 size={13} className="text-primary/50" />
            <span className="font-medium">{opportunity.organization}</span>
          </div>
          {opportunity.isRemote && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/50 px-2 py-0.5 rounded-full">
              <Globe size={10} /> Remote
            </span>
          )}
        </div>

        {/* Title & Description */}
        <div className="flex-grow">
          <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
            {opportunity.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-3">
            {opportunity.description}
          </p>
        </div>

        {/* Skills Tags — Glassmorphism */}
        {opportunity.skillsRequired && opportunity.skillsRequired.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {opportunity.skillsRequired.slice(0, 4).map((skill, i) => (
              <span
                key={i}
                className="text-[11px] font-medium text-foreground/80 backdrop-blur-sm bg-foreground/5 border border-foreground/10 px-2 py-0.5 rounded-md"
              >
                {skill}
              </span>
            ))}
            {opportunity.skillsRequired.length > 4 && (
              <span className="text-[11px] font-medium text-muted-foreground px-1">
                +{opportunity.skillsRequired.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Meta Info: Location, Stipend, Duration */}
        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground border-t border-border pt-3 mb-4">
          <div className="flex items-center gap-1">
            <MapPin size={12} className="text-primary/50" />
            <span>{opportunity.location}</span>
          </div>
          {opportunity.stipendRange && (
            <div className="flex items-center gap-1">
              <DollarSign size={12} className="text-emerald-500/70" />
              <span>{opportunity.stipendRange}</span>
            </div>
          )}
          {opportunity.duration && (
            <div className="flex items-center gap-1">
              <Clock size={12} className="text-blue-500/70" />
              <span>{opportunity.duration}</span>
            </div>
          )}
        </div>

        {/* Senior Insight Preview — on hover */}
        {isHovered && opportunity.seniorInsight && opportunity.seniorInsight !== "Focus on building a strong portfolio to stand out." && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 p-2.5 rounded-lg bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/30"
          >
            <div className="flex items-start gap-1.5">
              <Lightbulb size={12} className="text-amber-500 mt-0.5 shrink-0" />
              <p className="text-[11px] text-amber-800 dark:text-amber-200 leading-relaxed line-clamp-2">
                {opportunity.seniorInsight}
              </p>
            </div>
          </motion.div>
        )}

        {/* Action Button */}
        <Link
          href={`/opportunities/${opportunity.id}`}
          className="w-full py-2.5 px-4 bg-secondary text-secondary-foreground group-hover:bg-primary group-hover:text-primary-foreground rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2"
        >
          View Opportunity <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Custom styles for subtle pulse animation */}
      <style jsx>{`
        .opp-deadline-pulse {
          animation: deadlinePulse 2s ease-in-out infinite;
        }
        @keyframes deadlinePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.65; }
        }
      `}</style>
    </motion.div>
  );
}
