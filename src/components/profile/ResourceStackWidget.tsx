// src/components/profile/ResourceStackWidget.tsx
'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Bookmark } from "lucide-react";
import type { Prisma } from "@prisma/client";

type SavedResourceWithDetails = Prisma.SavedResourceGetPayload<{
  include: { resource: { include: { category: true } } }
}>;

export default function ResourceStackWidget({ savedResources }: { savedResources: SavedResourceWithDetails[] }) {

  if (savedResources.length === 0) {
    return (
      <div className="h-full bg-card border border-border rounded-xl p-6 flex flex-col items-center justify-center text-center">
        <Bookmark className="w-8 h-8 text-muted-foreground mb-4" />
        <h3 className="font-semibold text-foreground">Your Stack is Empty</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Save resources to see them here.
        </p>
        <Link href="/resources" className="inline-flex items-center bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-lg text-sm hover:bg-primary/90">
          Explore Resources
        </Link>
      </div>
    );
  }
  
  return (
    <motion.div 
      className="h-full bg-card border border-border rounded-xl p-6 relative flex flex-col justify-between"
    >
      <div>
        <h3 className="text-lg font-semibold mb-4">My Stack</h3>
        <div className="grid grid-cols-2 gap-4">
          {savedResources.map((item) => (
             <Link href={item.resource.url} target="_blank" key={item.resourceId} className="block p-3 bg-background border border-border rounded-md hover:border-primary">
                <span className="text-xs bg-primary/10 text-primary font-medium px-2 py-0.5 rounded-full">
                  {item.resource.category.name}
                </span>
                <h4 className="font-semibold text-sm truncate mt-2">{item.resource.name}</h4>
             </Link>
          ))}
        </div>
      </div>
      <Link href="/my-resources" className="mt-4 inline-flex items-center text-primary font-semibold text-sm self-start">
        View All Saved <ArrowRight className="w-4 h-4 ml-1" />
      </Link>
    </motion.div>
  );
}
