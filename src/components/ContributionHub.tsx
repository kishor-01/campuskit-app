// src/components/ContributionHub.tsx

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, PlusCircle } from "lucide-react";

interface ContributionHubProps {
  submissionCount: number;
}

export default function ContributionHub({ submissionCount }: ContributionHubProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }} // Animate in after the first row
      className="bg-muted/50 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
          <PlusCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-foreground">
            {submissionCount > 0 ? "Your Contributions" : "Become a Contributor"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {submissionCount > 0 
              ? `You've submitted ${submissionCount} resource${submissionCount > 1 ? 's' : ''}. Thank you!`
              : "Help the community by sharing useful resources."
            }
          </p>
        </div>
      </div>
      
      <Link 
        href={submissionCount > 0 ? "/my-submissions" : "/submit-resource"}
        className="inline-flex items-center bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-lg text-sm hover:bg-primary/90 transition-colors w-full md:w-auto justify-center"
      >
        {submissionCount > 0 ? "View My Submissions" : "Submit a Resource"}
        <ArrowRight className="w-4 h-4 ml-2" />
      </Link>
    </motion.div>
  );
}