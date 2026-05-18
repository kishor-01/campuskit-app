import Link from 'next/link';
import { FileSearch, Lightbulb, Calendar, ShieldCheck, ArrowRight } from 'lucide-react';
import React from 'react';

const ToolCard = ({ 
  title, 
  description, 
  href, 
  icon,
  gradient
}: { 
  title: string, 
  description: string, 
  href: string, 
  icon: React.ReactNode,
  gradient: string
}) => {
  return (
    <Link href={href} className="block group">
      <div className="relative bg-card p-8 rounded-2xl h-full border border-border overflow-hidden
                      group-hover:border-primary/50 transition-all duration-500 shadow-sm hover:shadow-md">
        {/* Hover Background Gradient */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br ${gradient}`} />
        
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 bg-gradient-to-br ${gradient} text-white shadow-lg`}>
          {icon}
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">{title}</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          {description}
        </p>
        <div className="flex items-center text-primary font-medium text-sm group-hover:translate-x-1 transition-transform duration-300">
          Try it now <ArrowRight className="ml-2 w-4 h-4" />
        </div>
      </div>
    </Link>
  );
};

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-background py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold tracking-wide">
            Powered by AI
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6 tracking-tight">
            Intelligent <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Tools Suite</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A curated collection of industry-standard utilities designed to accelerate your career, streamline your studies, and ensure academic integrity.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <ToolCard 
            title="ATS Resume Matcher"
            description="Upload your PDF/Word resume and paste a job description. Our AI analyzes your fit, identifies missing keywords, and provides actionable feedback just like a real Applicant Tracking System."
            href="/tools/ats-resume-matcher"
            icon={<FileSearch size={28} />}
            gradient="from-blue-500 to-cyan-500"
          />
          <ToolCard 
            title="Project Idea Generator"
            description="Stuck on what to build next? Input your current skills and interests, and let our AI generate comprehensive, structured project blueprints complete with tech stacks and milestones."
            href="/tools/project-generator"
            icon={<Lightbulb size={28} />}
            gradient="from-purple-500 to-pink-500"
          />
          <ToolCard 
            title="Smart Study Planner"
            description="Input your upcoming exams and subjects. Generate an optimized, day-by-day spaced repetition study schedule tailored to your exact timeline and goals."
            href="/tools/study-planner"
            icon={<Calendar size={28} />}
            gradient="from-emerald-500 to-teal-500"
          />
          <ToolCard 
            title="Plagiarism Checker"
            description="Verify the authenticity of your assignments. Powered by the Dolos API to detect unoriginal content and ensure your academic submissions meet the highest integrity standards."
            href="/tools/plagiarism-checker"
            icon={<ShieldCheck size={28} />}
            gradient="from-orange-500 to-red-500"
          />
        </div>
      </div>
    </div>
  );
}