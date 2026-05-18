// src/components/ResourceStack.tsx

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Bookmark } from "lucide-react";
import type { Prisma } from "@prisma/client";

type SavedResourceWithDetails = Prisma.SavedResourceGetPayload<{
  include: {
    resource: { include: { category: true } }
  }
}>;

interface ResourceStackProps {
  savedResources: SavedResourceWithDetails[];
}

const containerVariants = {
  stacked: {},
  fanned: {
    transition: {
      staggerChildren: 0.1,
    }
  }
};

const cardVariants: any = {
  stacked: (index: number) => ({
    opacity: 1,
    y: 0,
    x: index * 10,
    rotate: index * 2 - 2,
    transition: { type: "spring", stiffness: 300, damping: 20 }
  }),
  fanned: (index: number) => ({
    opacity: 1,
    y: -15,
    x: index * 50,
    rotate: index * 5 - 5,
    transition: { type: "spring", stiffness: 300, damping: 20 }
  }),
  initial: {
    opacity: 0,
    y: 40,
  }
};


export default function ResourceStack({ savedResources }: ResourceStackProps) {

  if (savedResources.length === 0) {
    return (
      <div className="h-full bg-muted/50 border border-dashed border-muted-foreground/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Bookmark className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground">Your Resource Stack is Empty</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Start exploring and save resources to see them here.
        </p>
        <Link href="/resources" className="inline-flex items-center bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-lg text-sm hover:bg-primary/90 transition-colors">
          Explore Resources <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    );
  }
  
  return (
    <motion.div 
      className="h-full bg-muted/50 rounded-2xl p-6 relative flex flex-col justify-between"
      initial="stacked"
      whileHover="fanned"
      variants={containerVariants}
    >
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-4">Recently Saved</h3>
        <div className="relative h-28">
          {savedResources.map((item, index) => (
            <motion.div
              key={item.resourceId}
              custom={index}
              variants={cardVariants}
              initial="initial"
              // THE FIX: The 'animate' prop has been REMOVED from this line.
              // The card will now inherit its state ('stacked' or 'fanned') from the parent container.
              className="absolute top-0 left-0 w-[85%] h-24 bg-background rounded-lg border border-muted shadow-md p-3 flex flex-col justify-between"
              style={{
                zIndex: savedResources.length - index,
              }}
            >
              <div>
                <span className="text-xs bg-primary/10 text-primary font-medium px-2 py-0.5 rounded-full">
                  {item.resource.category.name}
                </span>
                <h4 className="font-semibold text-sm truncate mt-1">{item.resource.name}</h4>
              </div>
              <p className="text-xs text-muted-foreground truncate">{item.resource.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
      <Link href="/my-resources" className="inline-flex items-center text-primary font-semibold text-sm mt-4 self-start">
        View All Saved <ArrowRight className="w-4 h-4 ml-1" />
      </Link>
    </motion.div>
  );
}