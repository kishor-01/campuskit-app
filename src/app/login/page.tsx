// src/app/login/page.tsx

"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail } from 'lucide-react';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.3 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [errorMessage, setErrorMessage] = useState('');
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    setErrorMessage('');

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const result = await signIn('credentials', {
      redirect: false,
      email: email,
      password: password,
    });

    setIsPending(false);

    if (result?.ok) {
      // THE FIX: Use a full page redirect instead of the Next.js router.
      window.location.href = callbackUrl;
    } else {
      setErrorMessage('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <motion.div className="bg-primary text-primary-foreground p-12 flex flex-col justify-center" initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.7, ease: "easeOut" }}>
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.h1 variants={itemVariants} className="text-4xl font-bold">CampusKit</motion.h1>
          <motion.p variants={itemVariants} className="mt-4 text-lg opacity-80">
            Welcome back. Let's find what you need.
          </motion.p>
        </motion.div>
      </motion.div>

      <div className="p-12 flex items-center justify-center">
        <motion.div className="w-full max-w-md" variants={containerVariants} initial="hidden" animate="visible">
          <motion.h2 variants={itemVariants} className="text-3xl font-bold text-foreground mb-2">Welcome Back!</motion.h2>
          <motion.p variants={itemVariants} className="text-muted-foreground mb-8">
            Log in to access your saved resources.
          </motion.p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div variants={itemVariants}>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input name="email" type="email" placeholder="Email" required className="w-full p-3 pl-10 bg-background border border-muted rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
            </motion.div>
            <motion.div variants={itemVariants}>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input name="password" type="password" placeholder="Password" required className="w-full p-3 pl-10 bg-background border border-muted rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
            </motion.div>
            
            {errorMessage && (
              <p className="text-sm text-center text-red-500">{errorMessage}</p>
            )}

            <motion.div variants={itemVariants} className="pt-2">
              <button type="submit" disabled={isPending} className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50">
                {isPending ? "Logging In..." : "Log In"}
              </button>
            </motion.div>
          </form>
          <motion.p variants={itemVariants} className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account? <Link href="/signup" className="font-semibold text-primary hover:underline">Sign Up</Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}