"use client";

import React, { useState } from 'react';
import { Calendar, Clock, BookOpen, Target, Loader2, AlertCircle, CalendarDays, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ToolNavBar from '@/components/tools/ToolNavBar';

type StudyPlan = {
  summary: string;
  weeklyRoutine: {
    day: string;
    focus: string;
    tasks: string[];
  }[];
  milestones: {
    title: string;
    timing: string;
  }[];
  tips: string[];
};

export default function StudyPlannerPage() {
  const [subjects, setSubjects] = useState("");
  const [examDate, setExamDate] = useState("");
  const [studyHours, setStudyHours] = useState("4");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjects.trim() || !examDate) {
      setError("Please provide subjects and target exam date.");
      return;
    }

    setLoading(true);
    setError(null);
    setPlan(null);

    try {
      const res = await fetch("/api/tools/study-planner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subjects, examDate, studyHours }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate study plan.");
      }

      setPlan(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <ToolNavBar toolName="Smart Study Planner" accentColor="emerald" />
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            Smart Study <span className="text-emerald-500">Planner</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Generate an optimized, spaced-repetition study schedule tailored to your exams and available time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-4 bg-card border border-border p-6 rounded-2xl shadow-sm h-fit">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2 flex items-center">
                  <BookOpen className="w-4 h-4 mr-2 text-emerald-500" />
                  Subjects / Topics
                </label>
                <textarea
                  className="w-full h-24 p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  placeholder="e.g. Calculus, Physics, Computer Architecture"
                  value={subjects}
                  onChange={(e) => setSubjects(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2 flex items-center">
                  <Target className="w-4 h-4 mr-2 text-emerald-500" />
                  Target Exam Date
                </label>
                <input
                  type="date"
                  className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2 flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-emerald-500" />
                  Daily Study Hours
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="1"
                    max="12"
                    step="0.5"
                    value={studyHours}
                    onChange={(e) => setStudyHours(e.target.value)}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <span className="font-bold text-foreground w-12 text-center">{studyHours}h</span>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !subjects.trim() || !examDate}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors duration-200 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Synthesizing...
                  </>
                ) : (
                  "Create Study Plan"
                )}
              </button>
            </form>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {!plan && !loading && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="h-full min-h-[400px] bg-card border border-border rounded-2xl flex flex-col items-center justify-center text-center p-8 shadow-sm"
                >
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Calendar className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Awaiting Parameters</h3>
                  <p className="text-muted-foreground text-sm max-w-sm">
                    Enter your subjects and exam date to generate a highly optimized study schedule.
                  </p>
                </motion.div>
              )}

              {loading && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="h-full min-h-[400px] bg-card border border-border rounded-2xl flex flex-col items-center justify-center text-center p-8 shadow-sm space-y-4"
                >
                  <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                  <p className="text-foreground font-medium animate-pulse">Calculating Spaced Repetition Intervals...</p>
                </motion.div>
              )}

              {plan && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="space-y-6"
                >
                  {/* Summary Card */}
                  <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
                    <h2 className="text-xl font-bold text-foreground mb-2 flex items-center">
                      <Target className="w-5 h-5 mr-2 text-emerald-500" />
                      Plan Overview
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">{plan.summary}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Weekly Routine */}
                    <div className="md:col-span-2 space-y-4">
                      <h3 className="text-lg font-bold text-foreground flex items-center">
                        <CalendarDays className="w-5 h-5 mr-2 text-emerald-500" />
                        Weekly Routine
                      </h3>
                      {plan.weeklyRoutine.map((dayPlan, i) => (
                        <div key={i} className="bg-card border border-border p-4 rounded-xl shadow-sm">
                          <div className="flex justify-between items-center mb-3">
                            <span className="font-bold text-foreground">{dayPlan.day}</span>
                            <span className="px-2 py-1 bg-emerald-500/10 text-emerald-600 text-xs font-semibold rounded-md border border-emerald-500/20">
                              Focus: {dayPlan.focus}
                            </span>
                          </div>
                          <ul className="space-y-2">
                            {dayPlan.tasks.map((task, j) => (
                              <li key={j} className="text-sm text-muted-foreground flex items-start">
                                <span className="text-emerald-500 mr-2 mt-1">•</span>
                                {task}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    {/* Sidebar: Milestones & Tips */}
                    <div className="space-y-6">
                      <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
                        <h3 className="text-md font-bold text-foreground mb-4">Milestones</h3>
                        <ul className="space-y-4">
                          {plan.milestones.map((milestone, i) => (
                            <li key={i} className="flex flex-col">
                              <span className="text-sm font-semibold text-foreground flex items-center">
                                <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />
                                {milestone.title}
                              </span>
                              <span className="text-xs text-muted-foreground ml-6 mt-1">{milestone.timing}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
                        <h3 className="text-md font-bold text-foreground mb-4">Study Tips</h3>
                        <ul className="space-y-3">
                          {plan.tips.map((tip, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start">
                              <span className="text-emerald-500 mr-2 font-bold">{i + 1}.</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
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
