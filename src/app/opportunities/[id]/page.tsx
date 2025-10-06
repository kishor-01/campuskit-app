// src/app/opportunities/[id]/page.tsx

import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Calendar, MapPin, Briefcase, ArrowUpRight } from "lucide-react";

// Helper to format dates
const formatDate = (date: Date | null | undefined) => {
    if (!date) return null;
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date(date));
};

export default async function OpportunityDetailPage({ params }: { params: { id: string } }) {
  const opportunity = await prisma.opportunity.findUnique({
    where: { id: params.id },
  });

  // If no opportunity is found with that ID, show a 404 page
  if (!opportunity) {
    notFound();
  }

  const startDate = formatDate(opportunity.startDate);
  const endDate = formatDate(opportunity.endDate);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-muted/50 rounded-lg p-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start gap-6 border-b border-muted pb-6">
          {opportunity.imageUrl && (
            <img src={opportunity.imageUrl} alt={`${opportunity.organization} logo`} className="w-20 h-20 rounded-lg object-contain bg-white p-2" />
          )}
          <div className="flex-grow">
            <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full uppercase">
              {opportunity.type.replace("_", " ")}
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mt-2">{opportunity.title}</h1>
            <p className="text-lg text-muted-foreground font-semibold">{opportunity.organization}</p>
          </div>
          <a href={opportunity.applyUrl} target="_blank" rel="noopener noreferrer" className="bg-primary text-primary-foreground font-bold py-3 px-6 rounded-lg hover:bg-primary/90 transition-colors w-full md:w-auto text-center">
            Apply Now <ArrowUpRight className="inline w-5 h-5 ml-1"/>
          </a>
        </div>
        
        {/* Meta Info Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6">
          <div className="flex items-center gap-3">
            <Briefcase className="w-5 h-5 text-muted-foreground"/>
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <p className="font-semibold text-foreground">{opportunity.type.replace("_", " ")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-muted-foreground"/>
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-semibold text-foreground">{opportunity.location}</p>
            </div>
          </div>
          {(startDate || endDate) && (
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground"/>
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-semibold text-foreground">
                  {startDate}{endDate && startDate !== endDate ? ` to ${endDate}` : ''}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Description Section */}
        <div className="prose prose-invert max-w-none prose-p:text-muted-foreground prose-headings:text-foreground">
            <h2 className="text-2xl font-bold text-foreground">Description</h2>
            <p>{opportunity.description}</p>
        </div>
      </div>
    </div>
  );
}