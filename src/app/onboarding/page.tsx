'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layout,
  Server,
  Layers,
  Brain,
  Database,
  Shield,
  Loader2,
  AtSign,
  GraduationCap,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Cpu,
} from 'lucide-react';
import { completeOnboardingAction } from '@/actions/userActions';
import toast from 'react-hot-toast';

// ─── Objective Cards Config ───────────────────────────────────────────────────
const OBJECTIVES = [
  {
    id: 'Frontend Systems',
    label: 'Frontend Systems',
    description: 'UI architecture, animations, and performance-obsessed web apps.',
    icon: Layout,
    color: 'from-violet-500/20 to-indigo-500/20',
    border: 'border-violet-500/40',
    iconColor: 'text-violet-400',
    glowColor: 'shadow-violet-500/20',
  },
  {
    id: 'Backend Architecture',
    label: 'Backend Architecture',
    description: 'Distributed systems, APIs, databases, and scalability patterns.',
    icon: Server,
    color: 'from-cyan-500/20 to-blue-500/20',
    border: 'border-cyan-500/40',
    iconColor: 'text-cyan-400',
    glowColor: 'shadow-cyan-500/20',
  },
  {
    id: 'AI & Data',
    label: 'AI & Data',
    description: 'Machine learning pipelines, analytics, and AI-powered products.',
    icon: Brain,
    color: 'from-emerald-500/20 to-teal-500/20',
    border: 'border-emerald-500/40',
    iconColor: 'text-emerald-400',
    glowColor: 'shadow-emerald-500/20',
  },
  {
    id: 'Full-Stack',
    label: 'Full-Stack',
    description: 'End-to-end ownership — from pixel to cloud.',
    icon: Layers,
    color: 'from-amber-500/20 to-orange-500/20',
    border: 'border-amber-500/40',
    iconColor: 'text-amber-400',
    glowColor: 'shadow-amber-500/20',
  },
  {
    id: 'DevOps & Platform',
    label: 'DevOps & Platform',
    description: 'Infrastructure as code, CI/CD, and reliability engineering.',
    icon: Shield,
    color: 'from-rose-500/20 to-red-500/20',
    border: 'border-rose-500/40',
    iconColor: 'text-rose-400',
    glowColor: 'shadow-rose-500/20',
  },
  {
    id: 'Systems & Low-Level',
    label: 'Systems & Low-Level',
    description: 'Compilers, OS internals, embedded, and performance engineering.',
    icon: Cpu,
    color: 'from-slate-400/20 to-slate-500/20',
    border: 'border-slate-500/40',
    iconColor: 'text-slate-300',
    glowColor: 'shadow-slate-500/20',
  },
];

const EDUCATION_OPTIONS = [
  { value: '1st Year', label: '1st Year — Just started the journey.' },
  { value: '2nd Year', label: '2nd Year — Building foundations.' },
  { value: '3rd Year', label: '3rd Year — Hitting my stride.' },
  { value: '4th Year', label: '4th Year — Final approach.' },
  { value: 'Graduated', label: 'Graduated — In the field.' },
  { value: 'Self-Taught', label: 'Self-Taught — No institution, just grit.' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();
  const { update } = useSession();

  const [username, setUsername] = useState('');
  const [education, setEducation] = useState('');
  const [objective, setObjective] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateUsername = useCallback((val: string) => {
    const clean = val.replace(/^@/, '').trim().toLowerCase();
    if (!clean) { setUsernameError(''); return; }
    if (clean.length < 3) { setUsernameError('At least 3 characters required.'); return; }
    if (!/^[a-z0-9_]+$/.test(clean)) { setUsernameError('Only lowercase letters, numbers, underscores.'); return; }
    setUsernameError('');
  }, []);

  const canSubmit =
    username.replace(/^@/, '').trim().length >= 3 &&
    !usernameError &&
    education !== '' &&
    objective !== '';

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const result = await completeOnboardingAction({ username, education, objective });
      if (result.error) {
        toast.error(result.error);
        if (result.error.includes('username')) setUsernameError(result.error);
        setIsSubmitting(false);
        return;
      }
      toast.success('Profile initialized. Welcome to the Constellation.');
      // Refresh NextAuth JWT so onboarded flag is updated client-side
      await update();
      router.push('/dashboard');
    } catch {
      toast.error('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#020817] text-slate-100 overflow-hidden">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute top-0 left-1/4 w-[700px] h-[400px] rounded-full bg-violet-600/8 blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[400px] rounded-full bg-indigo-600/6 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-cyan-600/4 blur-[100px]" />
      </div>

      {/* Constellation dot grid background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
        aria-hidden
      />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Logo / Header */}
        <header className="flex-shrink-0 flex items-center justify-between px-6 sm:px-10 py-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-black tracking-[0.15em] text-slate-200 uppercase">Seniofy</span>
          </div>
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Initialization Sequence</p>
        </header>

        {/* Main content */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8">
          <div className="w-full max-w-2xl">

            {/* Hero heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="text-center mb-10"
            >
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-3">
                New Engineer Detected
              </p>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-100 tracking-tight mb-3">
                Initialize Your Profile.
              </h1>
              <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                Before you enter the constellation, declare your identity and your mission. This takes 30 seconds.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
              className="space-y-7"
            >
              {/* ── Username field ── */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Username
                </label>
                <div className={`flex items-center gap-2 rounded-xl border bg-slate-900/60 px-4 py-3 transition-all
                  ${usernameError
                    ? 'border-red-500/50 ring-2 ring-red-500/20'
                    : username.length >= 3 && !usernameError
                      ? 'border-emerald-500/40 ring-2 ring-emerald-500/10'
                      : 'border-slate-800/60 focus-within:border-violet-500/50 focus-within:ring-2 focus-within:ring-violet-500/10'
                  }`}
                >
                  <AtSign className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <input
                    id="onboarding-username"
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      validateUsername(e.target.value);
                    }}
                    placeholder="your_handle"
                    autoComplete="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-600 outline-none font-mono"
                  />
                  {username.length >= 3 && !usernameError && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  )}
                </div>
                <AnimatePresence>
                  {usernameError && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-[11px] text-red-400 mt-1.5 pl-1"
                    >
                      {usernameError}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Education dropdown ── */}
              <div>
                <label htmlFor="onboarding-education" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Education
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <select
                    id="onboarding-education"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    className={`w-full rounded-xl border bg-slate-900/60 pl-10 pr-4 py-3 text-sm outline-none transition-all appearance-none cursor-pointer
                      ${education
                        ? 'border-violet-500/40 text-slate-100'
                        : 'border-slate-800/60 text-slate-500'
                      }
                      focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10`}
                  >
                    <option value="" disabled>Select your current status…</option>
                    {EDUCATION_OPTIONS.map((opt) => (
                      <option
                        key={opt.value}
                        value={opt.value}
                        className="bg-slate-900 text-slate-100"
                      >
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {/* Custom dropdown chevron */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* ── Objective Grid ── */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  Primary Objective — Select One
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {OBJECTIVES.map((obj) => {
                    const Icon = obj.icon;
                    const isSelected = objective === obj.id;
                    return (
                      <button
                        key={obj.id}
                        type="button"
                        onClick={() => setObjective(obj.id)}
                        className={`relative group flex items-start gap-3.5 p-4 rounded-2xl border transition-all duration-200 text-left
                          ${isSelected
                            ? `bg-gradient-to-br ${obj.color} ${obj.border} shadow-lg ${obj.glowColor}`
                            : 'border-slate-800/60 bg-slate-900/40 hover:border-slate-700/60 hover:bg-slate-900/70'
                          }`}
                      >
                        {/* Selected indicator */}
                        {isSelected && (
                          <div className="absolute top-3 right-3">
                            <CheckCircle2 className={`w-3.5 h-3.5 ${obj.iconColor}`} />
                          </div>
                        )}
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all
                          ${isSelected
                            ? `bg-gradient-to-br ${obj.color} border ${obj.border}`
                            : 'bg-slate-800 border border-slate-700/60 group-hover:border-slate-600'
                          }`}
                        >
                          <Icon className={`w-4.5 h-4.5 ${isSelected ? obj.iconColor : 'text-slate-500 group-hover:text-slate-300'} transition-colors`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold leading-tight ${isSelected ? 'text-slate-100' : 'text-slate-300 group-hover:text-slate-100'} transition-colors`}>
                            {obj.label}
                          </p>
                          <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5 line-clamp-2">
                            {obj.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Submit CTA ── */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canSubmit || isSubmitting}
                  className={`relative w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-bold text-sm transition-all duration-300
                    ${canSubmit && !isSubmitting
                      ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 bg-[length:200%_100%] hover:bg-[position:100%] text-white shadow-[0_0_30px_rgba(139,92,246,0.35)] hover:shadow-[0_0_45px_rgba(139,92,246,0.5)] active:scale-[0.98]'
                      : 'bg-slate-900 border border-slate-800/60 text-slate-600 cursor-not-allowed'
                    }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Initializing…
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Enter the Constellation
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}

                  {/* Animated glow border when ready */}
                  {canSubmit && !isSubmitting && (
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500/20 to-indigo-500/20 blur-xl -z-10" />
                  )}
                </button>

                {!canSubmit && (
                  <p className="text-center text-[11px] text-slate-600 mt-3">
                    {!username.replace(/^@/, '').trim()
                      ? 'Enter a username to continue.'
                      : !education
                        ? 'Select your education status.'
                        : !objective
                          ? 'Choose your primary objective.'
                          : ''}
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </main>

        {/* Footer */}
        <footer className="flex-shrink-0 py-6 text-center">
          <p className="text-[10px] text-slate-700">
            Your data stays with you. No spam. No noise. Just the work.
          </p>
        </footer>
      </div>
    </div>
  );
}
