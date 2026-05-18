"use client";

import React, { useState } from 'react';
import { Lightbulb, Code2, Target, Zap, CheckCircle2, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ToolNavBar from '@/components/tools/ToolNavBar';

type ProjectIdea = {
  title: string;
  description: string;
  techStack: string[];
  milestones: string[];
};

export default function ProjectGeneratorPage() {
  const [skills, setSkills] = useState("");
  const [interests, setInterests] = useState("");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<ProjectIdea[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skills.trim() || !interests.trim()) {
      setError("Please provide your skills and interests.");
      return;
    }

    setLoading(true);
    setError(null);
    setProjects(null);

    try {
      const res = await fetch("/api/tools/project-generator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ skills, interests, difficulty }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate projects.");
      }

      setProjects(data.projects);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <ToolNavBar toolName="Project Idea Generator" accentColor="purple" />
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            AI Project <span className="text-purple-500">Generator</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Overcome tutorial hell. Get personalized, resume-worthy project blueprints based on your tech stack and passions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-4 bg-card border border-border p-6 rounded-2xl shadow-sm h-fit">
            <form onSubmit={handleSubmit} className="space-y-6">

              <div>
                <label className="block text-sm font-medium text-foreground mb-2 flex items-center">
                  <Code2 className="w-4 h-4 mr-2 text-purple-500" />
                  Your Tech Stack
                </label>
                <input
                  type="text"
                  className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g. React, Node.js, Python"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2 flex items-center">
                  <Target className="w-4 h-4 mr-2 text-purple-500" />
                  Domains / Interests
                </label>
                <input
                  type="text"
                  className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g. Finance, AI, E-commerce"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2 flex items-center">
                  <Zap className="w-4 h-4 mr-2 text-purple-500" />
                  Difficulty Level
                </label>
                <select
                  className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !skills.trim() || !interests.trim()}
                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors duration-200 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Brainstorming...
                  </>
                ) : (
                  "Generate Ideas"
                )}
              </button>
            </form>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {!projects && !loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full min-h-[400px] bg-card border border-border rounded-2xl flex flex-col items-center justify-center text-center p-8 shadow-sm"
                >
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Lightbulb className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Awaiting Inspiration</h3>
                  <p className="text-muted-foreground text-sm max-w-sm">
                    Enter your skills and interests, and we'll generate three incredible project ideas tailored just for you.
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
                  <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
                  <p className="text-foreground font-medium animate-pulse">Architecting Blueprints...</p>
                </motion.div>
              )}

              {projects && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {projects.map((project, index) => (
                    <div key={index} className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <h2 className="text-xl font-bold text-foreground">{project.title}</h2>
                        <span className="px-3 py-1 bg-purple-500/10 text-purple-600 rounded-full text-xs font-bold border border-purple-500/20">
                          Idea {index + 1}
                        </span>
                      </div>

                      <p className="text-muted-foreground mb-6 leading-relaxed">
                        {project.description}
                      </p>

                      <div className="mb-6">
                        <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3 text-muted-foreground">Recommended Tech Stack</h4>
                        <div className="flex flex-wrap gap-2">
                          {project.techStack.map((tech, i) => (
                            <span key={i} className="px-3 py-1 bg-muted text-foreground text-xs font-medium rounded-md border border-border">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3 text-muted-foreground">Implementation Milestones</h4>
                        <ul className="space-y-3">
                          {project.milestones.map((milestone, i) => (
                            <li key={i} className="flex items-start">
                              <CheckCircle2 className="w-5 h-5 text-purple-500 mr-3 shrink-0 mt-0.5" />
                              <span className="text-sm text-foreground">{milestone}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
