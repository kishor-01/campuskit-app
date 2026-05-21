"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Code, Server, Lightbulb, ExternalLink } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface PortfolioReviewData {
  githubUrl: string;
  readabilityScore: number;
  architectureScore: number;
  securityScore: number;
  actionableRefactor?: string;
  feedback?: string;
}

interface PortfolioReviewCardProps {
  data: PortfolioReviewData;
}

export function PortfolioReviewCard({ data }: PortfolioReviewCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-emerald-500";
    if (score >= 5) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <Card className="w-full max-w-3xl mx-auto border-zinc-800 bg-zinc-950/50 backdrop-blur-md overflow-hidden">
        <CardHeader className="border-b border-zinc-800 bg-zinc-900/50 pb-6">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                Portfolio Audit Results
              </CardTitle>
              <CardDescription className="mt-2 text-zinc-400">
                Senior-level analysis of your codebase architecture and security posture.
              </CardDescription>
            </div>
            <a
              href={data.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1 text-sm bg-zinc-800 px-3 py-1.5 rounded-full"
            >
              Repository <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-8">
          {/* Metrics Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col items-center justify-center text-center">
              <Code className={`w-8 h-8 mb-2 ${getScoreColor(data.readabilityScore)}`} />
              <p className="text-sm text-zinc-400 font-medium">Readability</p>
              <p className={`text-2xl font-bold ${getScoreColor(data.readabilityScore)}`}>
                {data.readabilityScore}/10
              </p>
            </div>
            
            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col items-center justify-center text-center">
              <Server className={`w-8 h-8 mb-2 ${getScoreColor(data.architectureScore)}`} />
              <p className="text-sm text-zinc-400 font-medium">Architecture</p>
              <p className={`text-2xl font-bold ${getScoreColor(data.architectureScore)}`}>
                {data.architectureScore}/10
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col items-center justify-center text-center">
              <ShieldCheck className={`w-8 h-8 mb-2 ${getScoreColor(data.securityScore)}`} />
              <p className="text-sm text-zinc-400 font-medium">Security</p>
              <p className={`text-2xl font-bold ${getScoreColor(data.securityScore)}`}>
                {data.securityScore}/10
              </p>
            </div>
          </div>

          {/* Actionable Refactor Section */}
          {data.actionableRefactor && (
            <div className="rounded-xl border border-blue-900/50 bg-blue-950/20 overflow-hidden">
              <div className="bg-blue-900/30 px-4 py-3 flex items-center gap-2 border-b border-blue-900/50">
                <Lightbulb className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold text-blue-100">Actionable Refactor</h3>
                <Badge variant="outline" className="ml-auto bg-blue-500/10 text-blue-300 border-blue-500/30">
                  Senior Advice
                </Badge>
              </div>
              <div className="p-4 text-zinc-300 leading-relaxed text-sm">
                <div className="prose prose-invert max-w-none">
                  {/* Ideally this would parse markdown, using a simple pre format for now */}
                  <pre className="whitespace-pre-wrap font-mono text-xs bg-zinc-950 p-4 rounded-lg border border-zinc-800 text-emerald-400">
                    {data.actionableRefactor}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* General Feedback */}
          {data.feedback && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Overall Impression</h3>
              <p className="text-zinc-300 text-sm leading-relaxed bg-zinc-900/50 p-4 rounded-lg border border-zinc-800">
                {data.feedback}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
