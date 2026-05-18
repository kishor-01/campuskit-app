// src/app/opportunities/[id]/page.tsx

import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import {
  Calendar, MapPin, Briefcase, ArrowUpRight,
  Building2, Clock, CheckCircle2, Sparkles, Network,
  Globe, DollarSign, Lightbulb, BookOpen, FileSearch,
  BrainCircuit, ExternalLink
} from "lucide-react";
import MermaidRenderer from "@/components/MermaidRenderer";
import Link from "next/link";
import MockInterviewPanel from "@/components/MockInterviewPanel";

const formatDate = (date: Date | null | undefined) => {
  if (!date) return null;
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date(date));
};

type Visualization = { type: string; content: string };

// Tier badge configurations
const tierDisplayConfig: Record<string, { label: string; badgeClass: string; description: string }> = {
  TIER_1: {
    label: '🥇 Tier 1 — Elite Global',
    badgeClass: 'bg-gradient-to-r from-amber-500 to-yellow-400 text-white',
    description: 'FAANG, Top Research Labs, Global Scholarships',
  },
  TIER_2: {
    label: '🥈 Tier 2 — High Growth',
    badgeClass: 'bg-gradient-to-r from-slate-400 to-slate-300 text-slate-800',
    description: 'High-growth Startups, National Competitions',
  },
  TIER_3: {
    label: '🥉 Tier 3 — General',
    badgeClass: 'bg-muted text-muted-foreground',
    description: 'General Internships, Workshops',
  },
};

const difficultyLabels: Record<string, string> = {
  BEGINNER: '🟢 Beginner',
  INTERMEDIATE: '🟡 Intermediate',
  SENIOR: '🔴 Senior',
};

// Calculate deadline urgency
function getDeadlineStatus(endDate: Date | null | undefined): { text: string; isUrgent: boolean; isExpired: boolean } | null {
  if (!endDate) return null;
  const now = new Date();
  const end = new Date(endDate);
  const daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) return { text: 'Applications Closed', isUrgent: false, isExpired: true };
  if (daysLeft === 0) return { text: '⏰ Last Day to Apply!', isUrgent: true, isExpired: false };
  if (daysLeft <= 7) return { text: `⏰ ${daysLeft} days left to apply`, isUrgent: true, isExpired: false };
  return { text: `${daysLeft} days remaining`, isUrgent: false, isExpired: false };
}

export default async function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const opportunity = await prisma.opportunity.findUnique({
    where: { id },
  });

  if (!opportunity) notFound();

  const visualizations = (opportunity.visualizations as unknown as Visualization[]) || [];
  const mermaidChart = visualizations.find(v => v.type === 'mermaid')?.content;
  const tierInfo = tierDisplayConfig[opportunity.tier] || tierDisplayConfig.TIER_3;
  const deadline = getDeadlineStatus(opportunity.endDate);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Header */}
      <div className="bg-primary text-primary-foreground py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-3xl shadow-2xl flex items-center justify-center shrink-0 overflow-hidden">
              {opportunity.imageUrl ? (
                <img src={opportunity.imageUrl} alt={opportunity.organization} className="w-full h-full object-cover" />
              ) : (
                <Building2 size={48} className="text-primary" />
              )}
            </div>
            <div className="text-center md:text-left flex-1">
              {/* Tier + Type badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4 justify-center md:justify-start">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${tierInfo.badgeClass}`}>
                  {tierInfo.label}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-widest">
                  <Sparkles size={12} />
                  {opportunity.type.replace(/_/g, ' ')}
                </span>
                {opportunity.isRemote && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/30 backdrop-blur-md text-white text-xs font-bold uppercase tracking-widest">
                    <Globe size={12} /> Remote
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold mb-3">{opportunity.title}</h1>
              <p className="text-xl text-primary-foreground/80 font-medium">{opportunity.organization}</p>
            </div>
            <div className="w-full md:w-auto space-y-3">
              <a
                href={opportunity.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-8 py-4 bg-white text-primary font-extrabold rounded-2xl hover:bg-secondary transition-all text-lg shadow-xl"
              >
                Apply Now <ArrowUpRight size={20} />
              </a>
              {/* Deadline status */}
              {deadline && (
                <div className={`text-center text-sm font-semibold rounded-xl py-2 px-4 ${
                  deadline.isExpired
                    ? 'bg-white/10 text-white/60'
                    : deadline.isUrgent
                      ? 'bg-red-500/20 text-red-100 opp-deadline-pulse-detail'
                      : 'bg-white/10 text-white/80'
                }`}>
                  {deadline.text}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Briefcase className="text-primary" /> About the Opportunity
              </h2>
              <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed">
                {opportunity.description.split('\n').map((para, i) => (
                  <p key={i} className="mb-4">{para}</p>
                ))}
              </div>
            </div>

            {/* Senior Insight Card */}
            {opportunity.seniorInsight && opportunity.seniorInsight !== "Focus on building a strong portfolio to stand out." && (
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/20 border border-amber-200/60 dark:border-amber-800/40 rounded-3xl p-8 shadow-sm">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-amber-800 dark:text-amber-200">
                  <Lightbulb className="text-amber-500" /> Senior Insight
                </h2>
                <p className="text-amber-900/80 dark:text-amber-100/80 leading-relaxed text-[15px] italic">
                  &ldquo;{opportunity.seniorInsight}&rdquo;
                </p>
              </div>
            )}

            {/* Skills Required */}
            {opportunity.skillsRequired && opportunity.skillsRequired.length > 0 && (
              <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <CheckCircle2 className="text-primary" /> Skills Required
                </h2>
                <div className="flex flex-wrap gap-2">
                  {opportunity.skillsRequired.map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium text-foreground/80 backdrop-blur-sm bg-primary/5 border border-primary/15"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Mermaid Visualizations */}
            {mermaidChart && (
              <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Network className="text-primary" /> Opportunity Process & Map
                </h2>
                <MermaidRenderer chart={mermaidChart} />
              </div>
            )}

            {/* AI Prep Action Panel */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/20 border border-indigo-200/60 dark:border-indigo-800/40 rounded-3xl p-8 shadow-sm">
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2 text-indigo-800 dark:text-indigo-200">
                <BrainCircuit className="text-indigo-500" /> AI Prep Station
              </h2>
              <p className="text-sm text-indigo-600/70 dark:text-indigo-300/60 mb-6">
                Use Seniofy&apos;s AI tools to prepare your application for this specific role.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* ATS Deep Link */}
                <Link
                  href={`/tools/ats-resume-matcher?prefill=${opportunity.id}`}
                  className="flex items-center gap-3 p-4 bg-white dark:bg-card rounded-2xl border border-indigo-200/40 dark:border-indigo-700/30 hover:border-indigo-400 hover:shadow-md transition-all group/btn"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shrink-0">
                    <FileSearch size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground group-hover/btn:text-indigo-600 transition-colors">Optimize My Resume</p>
                    <p className="text-xs text-muted-foreground">Pre-filled with this role&apos;s description</p>
                  </div>
                </Link>

                {/* Mock Interview — Client Component */}
                <MockInterviewPanel
                  opportunityId={opportunity.id}
                  title={opportunity.title}
                  organization={opportunity.organization}
                />
              </div>
            </div>
          </div>

          {/* Sidebar: The Essentials */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm sticky top-24">
              <h3 className="text-lg font-bold mb-6">Key Details</h3>

              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-muted rounded-lg text-primary">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Location</p>
                    <p className="text-sm font-semibold text-foreground">{opportunity.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-muted rounded-lg text-primary">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Timeline</p>
                    <p className="text-sm font-semibold text-foreground">
                      {formatDate(opportunity.startDate)}
                      {opportunity.endDate && ` — ${formatDate(opportunity.endDate)}`}
                      {!opportunity.startDate && !opportunity.endDate && 'Rolling Applications'}
                    </p>
                  </div>
                </div>

                {opportunity.duration && (
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-muted rounded-lg text-primary">
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Duration</p>
                      <p className="text-sm font-semibold text-foreground">{opportunity.duration}</p>
                    </div>
                  </div>
                )}

                {opportunity.stipendRange && (
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-muted rounded-lg text-emerald-600">
                      <DollarSign size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Stipend</p>
                      <p className="text-sm font-semibold text-foreground">{opportunity.stipendRange}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-muted rounded-lg text-primary">
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Type</p>
                    <p className="text-sm font-semibold text-foreground capitalize">
                      {opportunity.type.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-muted rounded-lg text-primary">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Difficulty</p>
                    <p className="text-sm font-semibold text-foreground">
                      {difficultyLabels[opportunity.difficulty] || opportunity.difficulty}
                    </p>
                  </div>
                </div>
              </div>

              {/* Prep Resources */}
              {opportunity.prepResources && opportunity.prepResources.length > 0 && (
                <div className="mt-6 pt-5 border-t border-border">
                  <h4 className="text-sm font-bold mb-3 flex items-center gap-1.5">
                    <BookOpen size={14} className="text-primary" /> Prep Resources
                  </h4>
                  <div className="space-y-2">
                    {opportunity.prepResources.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors group/link"
                      >
                        <ExternalLink size={12} className="shrink-0" />
                        <span className="truncate group-hover/link:underline">{url.replace(/^https?:\/\//, '').split('/')[0]}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 pt-5 border-t border-border">
                <div className="bg-primary/5 rounded-2xl p-4 flex items-center gap-3">
                  <CheckCircle2 className="text-primary shrink-0" size={20} />
                  <p className="text-xs text-primary font-medium leading-tight">
                    Make sure your profile is updated before applying.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        .opp-deadline-pulse-detail {
          animation: deadlinePulseDetail 2.5s ease-in-out infinite;
        }
        @keyframes deadlinePulseDetail {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}