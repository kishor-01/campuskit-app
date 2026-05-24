// src/components/DealCard.tsx

"use client";

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
import { ArrowUpRight } from "lucide-react";

export default function DealCard({ deal }: { deal: Deal }) {
  return (
    <div
      className="relative p-6 bg-muted/50 rounded-xl overflow-hidden group border border-transparent hover:border-primary transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">{deal.company}</p>
          <h3 className="text-lg font-bold text-foreground mt-1">{deal.title}</h3>
        </div>
        {deal.imageUrl && (
          <img src={deal.imageUrl} alt={`${deal.company} logo`} className="w-12 h-12 rounded-md object-contain" />
        )}
      </div>
      <p className="text-sm text-muted-foreground mt-3">{deal.description}</p>
      
      {deal.affiliateUrl ? (
        <a
          href={deal.affiliateUrl ?? undefined}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-lg text-sm inline-flex items-center"
        >
          Get Deal <ArrowUpRight className="w-4 h-4 ml-1" />
        </a>
      ) : (
        <button
          disabled
          className="absolute bottom-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 bg-muted/40 text-muted-foreground font-semibold px-4 py-2 rounded-lg text-sm inline-flex items-center cursor-not-allowed"
        >
          Get Deal
          <ArrowUpRight className="w-4 h-4 ml-1 opacity-40" />
        </button>
      )}
    </div>
  );
}