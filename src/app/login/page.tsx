// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Lock, User as UserIcon, Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

// motion variants kept as-is...
const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.3 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

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
  const callbackParam = searchParams.get("callbackUrl");
  const callbackUrl = callbackParam || "/";

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const login = (fd.get("login") as string) || "";
    const password = (fd.get("password") as string) || "";

    try {
      // Use client-side signIn with redirect: false to get predictable cookie behavior
      const res = await signIn("credentials", {
        redirect: false,
        // next-auth client expects fields; keep these exact names depending on your credentials authorize
        login,
        password,
        callbackUrl,
      } as any);

      // res can be undefined in some versions — check carefully
      if (res && (res as any).error) {
        setErrorMessage((res as any).error || "Invalid credentials.");
        setLoading(false);
        return;
      }

      // If ok, navigate to callbackUrl ourselves.
      // If NextAuth returned a URL, prefer that.
      const target = (res as any)?.url || callbackUrl || "/";
      // router.push triggers a client navigation where the session cookie will exist
      router.push(target);
    } catch (err: any) {
      console.error("Login error:", err);
      setErrorMessage("Something went wrong. Please try again.");
      setLoading(false);
    }
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
          <motion.h1 variants={itemVariants} className="text-4xl font-bold">CampusKit</motion.h1>
          <motion.p variants={itemVariants} className="mt-4 text-lg opacity-80">Welcome back. Let’s find what you need.</motion.p>
        </motion.div>
      </motion.div>

      <div className="p-12 flex items-center justify-center">
        <motion.div className="w-full max-w-md" variants={containerVariants} initial="hidden" animate="visible">
          <motion.h2 variants={itemVariants} className="text-3xl font-bold mb-2">Welcome Back!</motion.h2>
          <motion.p variants={itemVariants} className="text-muted-foreground mb-8">Log in to access your saved resources.</motion.p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="callbackUrl" value={callbackUrl} />

            <motion.div variants={itemVariants}>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input name="login" type="text" placeholder="Email or Username" required className="w-full p-3 pl-10 bg-background border border-muted rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input name="password" type={showPassword ? "text" : "password"} placeholder="Password" required className="w-full p-3 pl-10 pr-10 bg-background border border-muted rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </motion.div>

            {errorMessage && <motion.p variants={itemVariants} className="text-sm text-center text-red-500">{errorMessage}</motion.p>}

            <motion.div variants={itemVariants} className="pt-2">
              <LoginButton loading={loading} />
            </motion.div>
          </form>

          <motion.div variants={itemVariants} className="flex items-center my-6">
            <div className="flex-grow h-px bg-muted"></div>
            <span className="px-3 text-sm text-muted-foreground">OR</span>
            <div className="flex-grow h-px bg-muted"></div>
          </motion.div>

          <motion.button variants={itemVariants} type="button" onClick={() => signIn("google", { callbackUrl })} className="w-full flex items-center justify-center gap-3 border border-muted py-3 rounded-lg hover:bg-muted/10 transition-colors">
            <FcGoogle size={20} />
            <span className="font-medium text-foreground">Continue with Google</span>
          </motion.button>

          <motion.p variants={itemVariants} className="text-center text-sm text-muted-foreground mt-6">
            Don’t have an account?{" "}
            <Link href="/signup" className="font-semibold text-primary hover:underline">Sign Up</Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
