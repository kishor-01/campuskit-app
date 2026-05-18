"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { UploadCloud, FileText, Briefcase, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import ToolNavBar from '@/components/tools/ToolNavBar';

type ATSResult = {
  matchScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  summary: string;
  actionableTips: string[];
};

type PrefillData = {
  title: string;
  organization: string;
  description: string;
} | null;

function ATSMatcherContent() {
  const searchParams = useSearchParams();
  const prefillId = searchParams?.get('prefill') || null;

  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ATSResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [prefillData, setPrefillData] = useState<PrefillData>(null);
  const [prefillLoading, setPrefillLoading] = useState(false);

  // Pre-fill from opportunity ID
  useEffect(() => {
    if (!prefillId) return;

    const fetchOpportunity = async () => {
      setPrefillLoading(true);
      try {
        const res = await fetch(`/api/opportunities/${encodeURIComponent(prefillId)}`);
        if (!res.ok) throw new Error('Failed to fetch opportunity');
        const data = await res.json();
        setPrefillData({ title: data.title, organization: data.organization, description: data.description });
        setJobDescription(data.description);
      } catch (err) {
        console.error('Pre-fill failed:', err);
      } finally {
        setPrefillLoading(false);
      }
    };

    fetchOpportunity();
  }, [prefillId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !jobDescription.trim()) {
      setError("Please provide both a resume file and a job description.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobDescription", jobDescription);

    try {
      const res = await fetch("/api/tools/ats", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze resume.");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <ToolNavBar toolName="ATS Resume Matcher" accentColor="blue" />
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            ATS Resume <span className="text-blue-500">Matcher</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Optimize your resume for Applicant Tracking Systems. Upload your CV and a Job Description to get an instant match score.
          </p>
        </div>

        {/* Pre-fill Banner */}
        {prefillData && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40 rounded-2xl flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white shrink-0">
              <Briefcase size={16} />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                📋 Pre-filled from: {prefillData.title}
              </p>
              <p className="text-xs text-blue-600/70 dark:text-blue-300/60">
                at {prefillData.organization} — Job description loaded automatically
              </p>
            </div>
          </motion.div>
        )}

        {prefillLoading && (
          <div className="mb-6 p-4 bg-muted rounded-2xl flex items-center gap-3 animate-pulse">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            <p className="text-sm text-muted-foreground">Loading opportunity details...</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2 flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-blue-500" />
                  Upload Resume (PDF/DOCX)
                </label>
                <label
                  htmlFor="resume-upload"
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-200
                    ${file ? 'border-blue-500 bg-blue-500/5' : 'border-muted-foreground/30 hover:bg-muted/50 hover:border-muted-foreground/50'}
                  `}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {file ? (
                      <>
                        <CheckCircle className="w-8 h-8 text-blue-500 mb-2" />
                        <p className="text-sm font-semibold text-foreground">{file.name}</p>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-8 h-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                        <p className="text-xs text-muted-foreground mt-1">PDF or DOCX (MAX. 5MB)</p>
                      </>
                    )}
                  </div>
                  <input id="resume-upload" type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
                </label>
              </div>

              {/* Job Description Textarea */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2 flex items-center">
                  <Briefcase className="w-4 h-4 mr-2 text-blue-500" />
                  Paste Job Description
                </label>
                <textarea
                  className="w-full h-48 p-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Paste the full job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !file || !jobDescription.trim()}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors duration-200 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  "Scan Resume"
                )}
              </button>
            </form>
          </div>

          {/* Results Section */}
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col">
            <AnimatePresence mode="wait">
              {!result && !loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center text-center p-8"
                >
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <FileSearchIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Ready to Analyze</h3>
                  <p className="text-muted-foreground text-sm">
                    Upload your resume and the job description to see how well you match the role.
                  </p>
                </motion.div>
              )}

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4"
                >
                  <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                  <p className="text-foreground font-medium animate-pulse">Running AI Semantic Analysis...</p>
                  <p className="text-muted-foreground text-sm">Comparing skills, experience, and context.</p>
                </motion.div>
              )}

              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex-1 overflow-y-auto pr-2 custom-scrollbar"
                >
                  {/* Score */}
                  <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">ATS Match Score</h2>
                      <p className="text-sm text-muted-foreground mt-1">Based on semantic keyword matching</p>
                    </div>
                    <div className="relative w-20 h-20 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted" />
                        <circle
                          cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent"
                          strokeDasharray={226}
                          strokeDashoffset={226 - (226 * result.matchScore) / 100}
                          className={`${result.matchScore >= 75 ? 'text-green-500' : result.matchScore >= 50 ? 'text-yellow-500' : 'text-red-500'} transition-all duration-1000 ease-out`}
                        />
                      </svg>
                      <span className="absolute text-xl font-bold text-foreground">{result.matchScore}%</span>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-foreground mb-2">AI Summary</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{result.summary}</p>
                  </div>

                  {/* Missing Keywords */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center">
                      <XCircle className="w-4 h-4 mr-2 text-red-500" />
                      Missing Keywords
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.missingKeywords.length > 0 ? (
                        result.missingKeywords.map((kw, i) => (
                          <span key={i} className="px-3 py-1 rounded-full bg-red-500/10 text-red-600 text-xs font-medium border border-red-500/20">
                            {kw}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">Great job! No major keywords missing.</span>
                      )}
                    </div>
                  </div>

                  {/* Matched Keywords */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      Matched Keywords
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.matchedKeywords.length > 0 ? (
                        result.matchedKeywords.map((kw, i) => (
                          <span key={i} className="px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-medium border border-green-500/20">
                            {kw}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">No matches found. Check your resume format.</span>
                      )}
                    </div>
                  </div>

                  {/* Tips */}
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Actionable Tips</h3>
                    <ul className="space-y-2">
                      {result.actionableTips.map((tip, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start">
                          <span className="text-blue-500 mr-2 mt-1">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

// FileSearch icon
function FileSearchIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="m18 19-3.5-3.5" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  )
}

// Wrap in Suspense for useSearchParams
export default function ATSMatcherPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    }>
      <ATSMatcherContent />
    </Suspense>
  );
}
