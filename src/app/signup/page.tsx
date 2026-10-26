// src/app/signup/page.tsx

"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import {
  Lock,
  Mail,
  User,
  BookText,
  Eye,
  EyeOff,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  AtSign,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

import { FcGoogle } from "react-icons/fc";

import { signIn } from "next-auth/react";
import { registerUser } from "@/actions";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};


// Submit button
function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled;
  return (
    <button
      type="submit"
      disabled={isDisabled}
      className={`w-full relative flex items-center justify-center gap-2 font-bold py-3 rounded-xl transition-all duration-300
        ${isDisabled
          ? "bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed"
          : "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_0_24px_rgba(139,92,246,0.35)] hover:shadow-[0_0_36px_rgba(139,92,246,0.5)] hover:scale-[1.01] active:scale-[0.99]"
        }`}
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Creating Account...
        </>
      ) : (
        <>
          Create Account
          <ArrowRight className="w-4 h-4" />
        </>
      )}
    </button>
  );
}

// Username availability hook with debounce
type AvailabilityState = "idle" | "checking" | "available" | "taken" | "invalid";

function useUsernameAvailability() {
  const [state, setState] = useState<AvailabilityState>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const check = useCallback((value: string) => {
    clearTimeout(timerRef.current);
    const clean = value.replace(/^@/, "").trim().toLowerCase();
    if (!clean || clean.length < 3) { setState("idle"); return; }
    if (!/^[a-z0-9_]{3,30}$/.test(clean)) { setState("invalid"); return; }
    setState("checking");
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/check-username?username=${encodeURIComponent(clean)}`);
        if (!res.ok) { setState("idle"); return; }
        const data = await res.json();
        setState(data.available ? "available" : "taken");
      } catch {
        setState("idle");
      }
    }, 450);
  }, []);

  useEffect(() => () => clearTimeout(timerRef.current), []);
  return { state, check };
}

// Page
export default function SignupPage() {
  const initialState: {
    message: string;
    success: boolean;
    conflict?: "email" | "username";
    redirectToLogin?: boolean;
    redirectToOtp?: boolean;
    email?: string | null;
  } = { message: "", success: false };

  const [state, formAction] = useActionState<any, any>(registerUser as any, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [usernameFieldError, setUsernameFieldError] = useState("");

  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const { data: session } = useSession();
  const { state: usernameAvail, check: checkUsername } = useUsernameAvailability();

  // Redirect if already logged in
  useEffect(() => {
    if (session?.user) router.replace("/dashboard");
  }, [session, router]);

  // Handle action response
  useEffect(() => {
    if (!state?.message) return;
    setGeneralError("");
    setUsernameFieldError("");

    if (state.success) {
      if (state.redirectToOtp) {
        router.push(`/signup/verify-otp?email=${encodeURIComponent(state.email || "")}&newUser=true`);
        return;
      }
      setIsRedirecting(true);
      setTimeout(() => router.push("/"), 2000);
      return;
    }

    // Email conflict: redirect to login with pre-filled email + hint banner
    if (state.conflict === "email" && state.redirectToLogin) {
      const params = new URLSearchParams({ email: state.email || "", hint: "exists" });
      router.push(`/login?${params.toString()}`);
      return;
    }

    // Username conflict: inline field error only
    if (state.conflict === "username") {
      setUsernameFieldError(state.message);
      return;
    }

    // Generic error
    setGeneralError(state.message);
  }, [state, router]);

  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020817]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-100 mb-2">Account Created!</h2>
          <p className="text-slate-400">Redirecting you...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">

      {/* Left hero panel */}
      <motion.div
        className="bg-gradient-to-br from-violet-700 via-indigo-700 to-violet-900 text-white p-12 flex flex-col justify-center relative overflow-hidden"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-white/5 blur-[100px]" />
          <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-indigo-300/10 blur-[80px]" />
        </div>
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="relative z-10">
          <motion.div variants={itemVariants} className="mb-6">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-6 backdrop-blur-sm">
              <AtSign className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-black tracking-tight">Seniofy</h1>
            <p className="mt-3 text-lg text-white/70 leading-relaxed">
              Your digital senior — curating the best resources for your success.
            </p>
          </motion.div>
          {["Curated learning roadmaps", "AI-powered co-pilot", "Real opportunities, zero noise"].map((feat) => (
            <motion.div key={feat} variants={itemVariants} className="flex items-center gap-2.5 mt-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />
              <span className="text-sm text-white/80">{feat}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Right form panel */}
      <div className="bg-[#020817] p-8 sm:p-12 flex items-center justify-center">
        <motion.div className="w-full max-w-md" variants={containerVariants} initial="hidden" animate="visible">
          <motion.h2 variants={itemVariants} className="text-2xl font-black text-slate-100 mb-1">
            Create Your Account
          </motion.h2>
          <motion.p variants={itemVariants} className="text-slate-500 text-sm mb-8">
            Join the constellation. Free forever.
          </motion.p>

          <form ref={formRef} action={formAction} className="space-y-4">

            {/* Name */}
            <motion.div variants={itemVariants}>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  name="name" type="text" placeholder="Full Name" required autoComplete="name"
                  className="w-full py-3 pl-10 pr-4 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
              </div>
            </motion.div>

            {/* Username with live availability */}
            <motion.div variants={itemVariants}>
              <div className={`relative flex items-center rounded-xl border bg-slate-900/60 transition-all
                ${usernameFieldError || usernameAvail === "taken"
                  ? "border-red-500/60 ring-2 ring-red-500/20"
                  : usernameAvail === "available"
                    ? "border-emerald-500/50 ring-2 ring-emerald-500/15"
                    : "border-slate-800 focus-within:border-violet-500/60 focus-within:ring-2 focus-within:ring-violet-500/20"
                }`}
              >
                <AtSign className="absolute left-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  name="username" type="text" placeholder="username" required
                  autoComplete="username" autoCapitalize="none" spellCheck={false}
                  onChange={(e) => { setUsernameFieldError(""); checkUsername(e.target.value); }}
                  className="flex-1 py-3 pl-10 pr-10 bg-transparent text-slate-100 text-sm placeholder-slate-600 font-mono focus:outline-none"
                />
                <div className="absolute right-3.5">
                  {usernameAvail === "checking" && <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />}
                  {usernameAvail === "available" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {(usernameAvail === "taken" || usernameFieldError) && <XCircle className="w-4 h-4 text-red-400" />}
                </div>
              </div>
              {usernameFieldError ? (
                <p className="text-[11px] text-red-400 mt-1.5 pl-1 flex items-center gap-1"><XCircle className="w-3 h-3" />{usernameFieldError}</p>
              ) : usernameAvail === "taken" ? (
                <p className="text-[11px] text-red-400 mt-1.5 pl-1 flex items-center gap-1"><XCircle className="w-3 h-3" />Username not available — try another.</p>
              ) : usernameAvail === "available" ? (
                <p className="text-[11px] text-emerald-400 mt-1.5 pl-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Username is available!</p>
              ) : usernameAvail === "invalid" ? (
                <p className="text-[11px] text-amber-400 mt-1.5 pl-1">Only lowercase letters, numbers, underscores (3-30 chars).</p>
              ) : null}
            </motion.div>

            {/* Education */}
            <motion.div variants={itemVariants}>
              <div className="relative">
                <BookText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  name="education" type="text" placeholder="Education (e.g. B.Tech CSE)" required
                  className="w-full py-3 pl-10 pr-4 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
              </div>
            </motion.div>

            {/* Email */}
            <motion.div variants={itemVariants}>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  name="email" type="email" placeholder="Email address" required autoComplete="email"
                  className="w-full py-3 pl-10 pr-4 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div variants={itemVariants}>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  name="password" type={showPassword ? "text" : "password"} placeholder="Password (min. 6 chars)"
                  required minLength={6} autoComplete="new-password"
                  className="w-full py-3 pl-10 pr-11 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
                <button
                  type="button" onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </motion.div>

            {/* General error */}
            {generalError && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3"
              >
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{generalError}</p>
              </motion.div>
            )}

            {/* Submit */}
            <motion.div variants={itemVariants} className="pt-1">
              <SubmitButton disabled={usernameAvail === "taken"} />
            </motion.div>
          </form>

          {/* Divider */}
          <motion.div variants={itemVariants} className="flex items-center my-6">
            <div className="flex-grow h-px bg-slate-800" />
            <span className="px-3 text-xs text-slate-600 uppercase tracking-widest">or</span>
            <div className="flex-grow h-px bg-slate-800" />
          </motion.div>

          {/* Google */}
          <motion.button
            variants={itemVariants} type="button"
            onClick={async () => {
              try { await signIn("google", { callbackUrl: "/dashboard" }); }
              catch { setGeneralError("Unable to start Google sign-up. Please try again."); }
            }}
            className="w-full flex items-center justify-center gap-3 border border-slate-800 bg-slate-900/40 hover:bg-slate-800/60 py-3 rounded-xl transition-all text-slate-300 hover:text-slate-100"
          >
            <FcGoogle size={20} />
            <span className="font-medium text-sm">Continue with Google</span>
          </motion.button>

          {/* Footer */}
          <motion.p variants={itemVariants} className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-violet-400 hover:text-violet-300 transition-colors">
              Log In
            </Link>
          </motion.p>
          <motion.p variants={itemVariants} className="text-center text-xs text-slate-700 mt-2">
            <Link href="/forgot-password" className="hover:text-slate-500 transition-colors">Forgot Password?</Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
