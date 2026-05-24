'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layout, 
  Server, 
  Layers, 
  Brain, 
  GraduationCap, 
  Terminal, 
  Zap, 
  Briefcase, 
  Compass, 
  FolderGit2, 
  ChevronRight, 
  ChevronLeft, 
  Loader2 
} from 'lucide-react';
import { completeOnboarding } from '@/actions/userActions';
import toast from 'react-hot-toast';

// Types for options
interface OnboardingOption {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
}

// Step Data Configs
const DOMAIN_OPTIONS: OnboardingOption[] = [
  { id: 'Frontend', label: 'Frontend', description: 'User Interfaces, Animations, Web Apps', icon: Layout },
  { id: 'Backend', label: 'Backend', description: 'APIs, Databases, Scalability, Systems', icon: Server },
  { id: 'Full Stack', label: 'Full Stack', description: 'End-to-end applications, devops', icon: Layers },
  { id: 'AI/Data', label: 'AI/Data', description: 'Machine Learning, Analytics, Big Data', icon: Brain },
];

const LEVEL_OPTIONS: OnboardingOption[] = [
  { id: 'Student/Initiate', label: 'Student / Initiate', description: 'Starting out, learning fundamentals', icon: GraduationCap },
  { id: 'Junior', label: 'Junior', description: 'Some building experience, seeking growth', icon: Terminal },
  { id: 'Mid-Level', label: 'Mid-Level', description: 'Refining patterns, architecting projects', icon: Zap },
];

const OBJECTIVE_OPTIONS: OnboardingOption[] = [
  { id: 'Land a Job', label: 'Land a Job', description: 'Succeed in interviews, build resume-boosters', icon: Briefcase },
  { id: 'Master Skills', label: 'Master Skills', description: 'Learn advanced concepts, deep dive topics', icon: Compass },
  { id: 'Build Portfolio', label: 'Build Portfolio', description: 'Create production-ready projects', icon: FolderGit2 },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  
  // Onboarding Selection States
  const [step, setStep] = useState(1);
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedObjective, setSelectedObjective] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground text-sm tracking-wider">Syncing secure connection...</p>
      </div>
    );
  }

  // Next / Back handlers
  const handleNext = () => {
    if (step < 3) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  // Submit action handler
  const handleSubmit = async () => {
    if (!selectedDomain || !selectedLevel || !selectedObjective) {
      toast.error('Please complete all selections.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await completeOnboarding({
        domain: selectedDomain,
        level: selectedLevel,
        objective: selectedObjective,
      });

      if (res.error) {
        toast.error(res.error);
        setIsSubmitting(false);
      } else {
        toast.success('Onboarding complete!');
        // Refresh NextAuth token/session client-side before redirect
        await update();
        router.push('/profile');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong during onboarding.');
      setIsSubmitting(false);
    }
  };

  // Check if current step has a valid selection
  const canProceed = () => {
    if (step === 1) return !!selectedDomain;
    if (step === 2) return !!selectedLevel;
    if (step === 3) return !!selectedObjective;
    return false;
  };

  // Get current step details
  const getStepConfig = () => {
    switch (step) {
      case 1:
        return {
          title: 'What is your primary focus?',
          subtitle: 'We will personalize your recommended roadmaps and career opportunities.',
          options: DOMAIN_OPTIONS,
          selected: selectedDomain,
          setSelected: setSelectedDomain,
        };
      case 2:
        return {
          title: 'What is your current experience level?',
          subtitle: 'This adjusts the difficulty of resources and sets your starting passport rank.',
          options: LEVEL_OPTIONS,
          selected: selectedLevel,
          setSelected: setSelectedLevel,
        };
      case 3:
      default:
        return {
          title: 'What is your main goal?',
          subtitle: 'Define your ultimate objective to customize your daily desk targets.',
          options: OBJECTIVE_OPTIONS,
          selected: selectedObjective,
          setSelected: setSelectedObjective,
        };
    }
  };

  const currentStep = getStepConfig();
  const progressPercent = (step / 3) * 100;

  // Animation variants for horizontal snapping slide transitions
  const stepVariants = {
    initial: { x: 50, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 },
  };

  const springTransition = {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-white flex flex-col justify-between overflow-hidden">
      {/* Decorative premium gradient background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header & Progress Bar */}
      <header className="w-full max-w-4xl mx-auto px-6 pt-8 md:pt-12 relative z-10">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-bold tracking-widest text-primary bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
            SENIOFY
          </span>
          <span className="text-xs font-semibold text-slate-500 tracking-wider">
            STEP {step} OF 3
          </span>
        </div>
        {/* Progress Bar Container */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
            initial={{ width: '33.33%' }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </header>

      {/* Main Flow Form Container */}
      <main className="flex-grow flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={springTransition}
              className="flex flex-col text-center"
            >
              {/* Question Headings */}
              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-3 text-slate-100">
                {currentStep.title}
              </h2>
              <p className="text-sm md:text-base text-slate-400 mb-10 max-w-lg mx-auto">
                {currentStep.subtitle}
              </p>

              {/* Grid Options Cards */}
              <div className={`grid gap-4 w-full max-w-2xl mx-auto ${
                currentStep.options.length === 4 
                  ? 'grid-cols-1 sm:grid-cols-2' 
                  : 'grid-cols-1 sm:grid-cols-3'
              }`}>
                {currentStep.options.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = currentStep.selected === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => currentStep.setSelected(opt.id)}
                      className={`relative flex flex-col items-center sm:items-start text-center sm:text-left p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 cursor-pointer group select-none ${
                        isSelected 
                          ? 'border-primary ring-2 ring-primary/40 bg-primary/10 text-white shadow-[0_0_20px_rgba(59,130,246,0.15)]' 
                          : 'border-slate-800/80 bg-slate-900/40 backdrop-blur-md text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {/* Icon Circle */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 ${
                        isSelected 
                          ? 'bg-primary text-white scale-110' 
                          : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700/60 group-hover:text-slate-200'
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      
                      {/* Labels */}
                      <h3 className={`font-bold text-lg mb-1 ${
                        isSelected ? 'text-white' : 'text-slate-200 group-hover:text-white'
                      }`}>
                        {opt.label}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-[200px] sm:max-w-none">
                        {opt.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Bottom Actions Bar */}
      <footer className="w-full max-w-4xl mx-auto px-6 pb-8 md:pb-12 flex justify-between items-center relative z-10">
        {/* Back Button */}
        {step > 1 ? (
          <button
            onClick={handleBack}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-800 bg-slate-900/50 hover:bg-slate-900 text-slate-400 hover:text-white transition-all cursor-pointer text-sm font-semibold disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
        ) : (
          <div /> // Spacer
        )}

        {/* Next / Submit Button */}
        {step < 3 ? (
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-white transition-all cursor-pointer text-sm font-semibold shadow-lg shadow-primary/20 disabled:opacity-30 disabled:pointer-events-none"
          >
            Continue
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!canProceed() || isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white transition-all cursor-pointer text-sm font-semibold shadow-lg shadow-blue-500/20 disabled:opacity-30 disabled:pointer-events-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Finalizing...
              </>
            ) : (
              <>
                Complete Profile
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </footer>
    </div>
  );
}
