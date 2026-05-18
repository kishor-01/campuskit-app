"use client";

import React, { useState } from 'react';
import { ShieldCheck, FileText, UploadCloud, CheckCircle, AlertCircle, Loader2, Search, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ToolNavBar from '@/components/tools/ToolNavBar';

type PlagiarismResult = {
  originalityScore: number;
  aiProbabilityScore: number;
  verdict: string;
  flaggedPassages: { text: string; reason: string }[];
  recommendations: string[];
};

export default function PlagiarismCheckerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlagiarismResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setTextContent(""); // clear text if file is uploaded
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !textContent.trim()) {
      setError("Please upload a document or paste text to analyze.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    if (file) {
      formData.append("document", file);
    }
    if (textContent.trim()) {
      formData.append("textContent", textContent);
    }

    try {
      const res = await fetch("/api/tools/plagiarism-checker", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze document.");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <ToolNavBar toolName="AI Content & Plagiarism Detector" accentColor="red" />
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            AI Content & Plagiarism <span className="text-red-500">Detector</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Ensure your academic integrity. Upload your essay (PDF/Word) or paste your text to check for AI-generated content and potential plagiarism.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm h-fit">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2 flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-2 text-red-500" />
                  Upload Document (PDF/DOCX)
                </label>
                <label
                  htmlFor="doc-upload"
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-200
                    ${file ? 'border-red-500 bg-red-500/5' : 'border-muted-foreground/30 hover:bg-muted/50 hover:border-muted-foreground/50'}
                  `}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {file ? (
                      <>
                        <CheckCircle className="w-8 h-8 text-red-500 mb-2" />
                        <p className="text-sm font-semibold text-foreground">{file.name}</p>
                        <button 
                          type="button" 
                          onClick={(e) => { e.preventDefault(); setFile(null); }}
                          className="text-xs text-red-500 mt-2 hover:underline"
                        >
                          Remove file
                        </button>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-8 h-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                        <p className="text-xs text-muted-foreground mt-1">PDF or DOCX (MAX. 5MB)</p>
                      </>
                    )}
                  </div>
                  <input id="doc-upload" type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
                </label>
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-border"></div>
                <span className="flex-shrink-0 mx-4 text-muted-foreground text-sm font-medium">OR</span>
                <div className="flex-grow border-t border-border"></div>
              </div>

              {/* Textarea */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2 flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-red-500" />
                  Paste Text
                </label>
                <textarea
                  className="w-full h-48 p-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  placeholder="Paste your essay or assignment text here..."
                  value={textContent}
                  onChange={(e) => { setTextContent(e.target.value); setFile(null); }}
                  disabled={file !== null}
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
                disabled={loading || (!file && !textContent.trim())}
                className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors duration-200 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Scanning Document...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Analyze Content
                  </>
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
                    <ShieldCheck className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Ready to Scan</h3>
                  <p className="text-muted-foreground text-sm">
                    Upload your document or paste text to receive an originality and AI probability score.
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
                  <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
                  <p className="text-foreground font-medium animate-pulse">Running Deep Analysis...</p>
                  <p className="text-muted-foreground text-sm">Checking for AI patterns and common phrasing.</p>
                </motion.div>
              )}

              {result && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="flex-1 overflow-y-auto pr-2 custom-scrollbar"
                >
                  {/* Scores Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-muted/50 border border-border rounded-xl p-4 flex flex-col items-center justify-center text-center">
                      <p className="text-sm text-muted-foreground font-medium mb-2">Originality Score</p>
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted" />
                          <circle 
                            cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" 
                            strokeDasharray={226} 
                            strokeDashoffset={226 - (226 * result.originalityScore) / 100}
                            className={`${result.originalityScore >= 80 ? 'text-green-500' : result.originalityScore >= 50 ? 'text-yellow-500' : 'text-red-500'} transition-all duration-1000 ease-out`} 
                          />
                        </svg>
                        <span className="absolute text-xl font-bold text-foreground">{result.originalityScore}%</span>
                      </div>
                    </div>
                    
                    <div className="bg-muted/50 border border-border rounded-xl p-4 flex flex-col items-center justify-center text-center">
                      <p className="text-sm text-muted-foreground font-medium mb-2">AI Probability</p>
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted" />
                          <circle 
                            cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" 
                            strokeDasharray={226} 
                            strokeDashoffset={226 - (226 * result.aiProbabilityScore) / 100}
                            className={`${result.aiProbabilityScore <= 20 ? 'text-green-500' : result.aiProbabilityScore <= 60 ? 'text-yellow-500' : 'text-red-500'} transition-all duration-1000 ease-out`} 
                          />
                        </svg>
                        <span className="absolute text-xl font-bold text-foreground">{result.aiProbabilityScore}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Verdict */}
                  <div className="mb-6 bg-card border border-border p-4 rounded-xl shadow-sm">
                    <h3 className="font-bold text-foreground mb-2 flex items-center">
                      {result.originalityScore > 70 ? (
                        <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 mr-2 text-yellow-500" />
                      )}
                      Final Verdict
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{result.verdict}</p>
                  </div>

                  {/* Flagged Passages */}
                  {result.flaggedPassages.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-bold text-foreground mb-3 flex items-center">
                        <XCircle className="w-4 h-4 mr-2 text-red-500" />
                        Flagged Passages
                      </h3>
                      <div className="space-y-3">
                        {result.flaggedPassages.map((passage, i) => (
                          <div key={i} className="bg-red-500/5 border border-red-500/10 p-3 rounded-lg">
                            <p className="text-sm text-foreground mb-2 font-serif italic">"{passage.text}"</p>
                            <p className="text-xs text-red-600 font-medium bg-red-500/10 inline-block px-2 py-1 rounded">
                              {passage.reason}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  <div>
                    <h3 className="font-bold text-foreground mb-3">Recommendations</h3>
                    <ul className="space-y-2">
                      {result.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start">
                          <span className="text-red-500 mr-2 mt-1">•</span>
                          {rec}
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
