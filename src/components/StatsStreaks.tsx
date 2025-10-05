// src/components/StatsStreaks.tsx

"use client";

import { motion } from "framer-motion";
import { Bookmark, Upload, Calendar } from "lucide-react";

interface StatsStreaksProps {
  savedCount: number;
  submittedCount: number;
  joinDate: Date;
}

const StatCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) => (
  <div className="bg-background/50 border border-muted p-4 rounded-lg flex items-center gap-4">
    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
    </div>
  </div>
);

export default function StatsStreaks({ savedCount, submittedCount, joinDate }: StatsStreaksProps) {
  const formattedJoinDate = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(joinDate));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }} // Staggered delay
      className="h-full bg-muted/50 rounded-2xl p-6"
    >
      <h3 className="text-xl font-semibold text-foreground mb-4">Your Stats</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard 
          icon={<Bookmark className="w-5 h-5" />}
          label="Resources Saved"
          value={savedCount}
        />
        <StatCard 
          icon={<Upload className="w-5 h-5" />}
          label="Resources Submitted"
          value={submittedCount}
        />
        <StatCard 
          icon={<Calendar className="w-5 h-5" />}
          label="Member Since"
          value={formattedJoinDate}
        />
      </div>
    </motion.div>
  );
}