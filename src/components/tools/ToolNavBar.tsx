"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Wrench, ChevronRight } from "lucide-react";

interface ToolNavBarProps {
  toolName: string;
  accentColor?: string; // e.g., "blue", "purple", "emerald", "red"
}

const colorMap: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  blue:    { bg: "bg-blue-500/10",    text: "text-blue-500",    border: "border-blue-500/20",    glow: "hover:shadow-blue-500/10" },
  purple:  { bg: "bg-purple-500/10",  text: "text-purple-500",  border: "border-purple-500/20",  glow: "hover:shadow-purple-500/10" },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20", glow: "hover:shadow-emerald-500/10" },
  red:     { bg: "bg-red-500/10",     text: "text-red-500",     border: "border-red-500/20",     glow: "hover:shadow-red-500/10" },
};

export default function ToolNavBar({ toolName, accentColor = "blue" }: ToolNavBarProps) {
  const router = useRouter();
  const colors = colorMap[accentColor] || colorMap.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6"
    >
      <div className={`flex items-center justify-between bg-card/80 backdrop-blur-md border ${colors.border} rounded-2xl px-4 py-3 shadow-sm ${colors.glow} hover:shadow-md transition-all duration-300`}>
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${colors.bg} ${colors.text} text-sm font-medium transition-all duration-200 hover:scale-[1.03] active:scale-95`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Breadcrumb */}
        <nav className="hidden sm:flex items-center gap-1.5 text-sm">
          <Link
            href="/tools"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            <Wrench className="w-3.5 h-3.5" />
            Tools
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
          <span className={`font-semibold ${colors.text}`}>{toolName}</span>
        </nav>

        {/* All Tools Link */}
        <Link
          href="/tools"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${colors.border} text-sm font-medium text-muted-foreground hover:text-foreground hover:border-border transition-all duration-200`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">All Tools</span>
        </Link>
      </div>
    </motion.div>
  );
}
