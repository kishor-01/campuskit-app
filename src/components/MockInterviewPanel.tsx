// src/components/MockInterviewPanel.tsx
'use client';

import { useState } from 'react';
import { BrainCircuit, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MockInterviewPanelProps {
  opportunityId: string;
  title: string;
  organization: string;
}

export default function MockInterviewPanel({ opportunityId, title, organization }: MockInterviewPanelProps) {
  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const handleGenerate = async () => {
    if (questions.length > 0) {
      setExpanded(!expanded);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/tools/mock-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunityId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate questions.');
      }

      setQuestions(data.questions || []);
      setExpanded(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="flex items-center gap-3 p-4 bg-white dark:bg-card rounded-2xl border border-indigo-200/40 dark:border-indigo-700/30 hover:border-indigo-400 hover:shadow-md transition-all group/btn text-left"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shrink-0">
          {loading ? <Loader2 size={20} className="animate-spin" /> : <BrainCircuit size={20} />}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm text-foreground group-hover/btn:text-indigo-600 transition-colors">
            {loading ? 'Generating...' : questions.length > 0 ? 'Mock Interview Questions' : 'Generate Mock Interview'}
          </p>
          <p className="text-xs text-muted-foreground">
            {questions.length > 0 ? `${questions.length} questions for ${organization}` : `5 questions tailored to ${organization}`}
          </p>
        </div>
        {questions.length > 0 && (
          expanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />
        )}
      </button>

      {error && (
        <p className="text-xs text-red-500 mt-2 px-1">{error}</p>
      )}

      <AnimatePresence>
        {expanded && questions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 p-4 bg-white dark:bg-card rounded-2xl border border-indigo-200/30 dark:border-indigo-700/20 space-y-3">
              <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">
                Interview Questions for {organization}
              </p>
              {questions.map((q, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-foreground/90 leading-relaxed">{q}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
