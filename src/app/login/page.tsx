// src/app/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Lock, User as UserIcon, Eye, EyeOff, MailCheck, CheckCircle } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.3 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

function LoginButton({ loading }: { loading: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
    >
      {loading ? "Logging In..." : "Log In"}
    </button>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const callbackParam = searchParams.get("callbackUrl");
  const verifiedParam = searchParams.get("verified");
  const newUserParam = searchParams.get("newUser");
  const resetParam = searchParams.get("reset");
  const callbackUrl = callbackParam || "/";

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (session?.user) {
      router.push(callbackUrl);
    }
  }, [session, callbackUrl, router]);

  // Show success messages
  useEffect(() => {
    if (verifiedParam === 'true') {
      setSuccessMessage('Email verified successfully! You can now log in.');
    }
    if (newUserParam === 'true') {
      setSuccessMessage('Account created successfully! Please log in to continue.');
    }
    if (resetParam === 'true') {
      setSuccessMessage('Password reset successfully! You can now log in with your new password.');
    }
  }, [verifiedParam, newUserParam, resetParam]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const login = (fd.get("login") as string) || "";
    const password = (fd.get("password") as string) || "";

    try {
      const result = await signIn("credentials", {
        redirect: false,
        login,
        password,
        callbackUrl,
      });

      // Fix: Check for error property directly
      if (result && !result.ok) {
        setErrorMessage(result.error || "Invalid credentials.");
        setLoading(false);
        return;
      }

      // Show success state before redirect
      setIsRedirecting(true);
      setTimeout(() => {
        const target = result?.url || callbackUrl || "/";
        router.push(target);
      }, 1500);

    } catch (err: any) {
      console.error("Login error:", err);
      setErrorMessage("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const handleGoogleSignIn = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    // Fix: Remove await since signIn returns void for OAuth
    signIn("google", { callbackUrl: "/dashboard" });
  };

  // Show loading state during redirect
  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Login Successful!</h2>
          <p className="text-muted-foreground">Redirecting you to the homepage...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <motion.div
        className="bg-primary text-primary-foreground p-12 flex flex-col justify-center"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.h1 variants={itemVariants} className="text-4xl font-bold">Seniofy</motion.h1>
          <motion.p variants={itemVariants} className="mt-4 text-lg opacity-80">
            Welcome back. Let's find what you need.
          </motion.p>
        </motion.div>
      </motion.div>

      <div className="p-12 flex items-center justify-center">
        <motion.div 
          className="w-full max-w-md" 
          variants={containerVariants} 
          initial="hidden" 
          animate="visible"
        >
          <motion.h2 variants={itemVariants} className="text-3xl font-bold mb-2">Welcome Back!</motion.h2>
          <motion.p variants={itemVariants} className="text-muted-foreground mb-8">
            Log in to access your saved resources and continue learning.
          </motion.p>

          {/* Success Message */}
          {successMessage && (
            <motion.div
              variants={itemVariants}
              className="mb-6 p-3 bg-green-500/10 text-green-600 border border-green-500/20 rounded-lg flex items-center space-x-2"
            >
              <MailCheck className="w-4 h-4" />
              <span className="text-sm">{successMessage}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="callbackUrl" value={callbackUrl} />

            <motion.div variants={itemVariants}>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  name="login" 
                  type="text" 
                  placeholder="Email or Username" 
                  required 
                  className="w-full p-3 pl-10 bg-background border border-muted rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" 
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  name="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Password" 
                  required 
                  className="w-full p-3 pl-10 pr-10 bg-background border border-muted rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword((s) => !s)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </motion.div>

            {errorMessage && (
              <motion.p 
                variants={itemVariants} 
                className="text-sm text-center text-red-500"
              >
                {errorMessage}
              </motion.p>
            )}

            <motion.div variants={itemVariants} className="pt-2">
              <LoginButton loading={loading} />
            </motion.div>
          </form>

          <motion.div variants={itemVariants} className="flex items-center my-6">
            <div className="flex-grow h-px bg-muted"></div>
            <span className="px-3 text-sm text-muted-foreground">OR</span>
            <div className="flex-grow h-px bg-muted"></div>
          </motion.div>

          <motion.button 
            variants={itemVariants} 
            type="button" 
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 border border-muted py-3 rounded-lg hover:bg-muted/10 transition-colors"
          >
            <FcGoogle size={20} />
            <span className="font-medium text-foreground">Continue with Google</span>
          </motion.button>

          <motion.div variants={itemVariants} className="text-center mt-6 space-y-2">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup" className="font-semibold text-primary hover:underline">
                Sign Up
              </Link>
            </p>
            <p className="text-xs text-muted-foreground">
              <Link href="/forgot-password" className="hover:underline">
                Forgot Password?
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
