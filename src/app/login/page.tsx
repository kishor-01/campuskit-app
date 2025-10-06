// src/app/login/page.tsx

"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Lock, User as UserIcon, Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  // Capture NextAuth errors
  const error = searchParams.get("error");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (error === "CredentialsSignin") {
      setErrorMessage("Invalid credentials. Please try again.");
    } else if (error) {
      setErrorMessage("Login failed. Please try again.");
    }
  }, [error]);

  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    setErrorMessage("");

    const formData = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      redirect: false,
      ...Object.fromEntries(formData),
    });

    setIsPending(false);

    if (result?.ok) {
      window.location.href = callbackUrl;
    } else {
      setErrorMessage("Invalid credentials. Please try again.");
    }
  };

  const handleGoogleSignIn = async () => {
    await signIn("google", { callbackUrl });
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left Side */}
      <motion.div
        className="bg-primary text-primary-foreground p-12 flex flex-col justify-center"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.h1 variants={itemVariants} className="text-4xl font-bold">
            CampusKit
          </motion.h1>
          <motion.p variants={itemVariants} className="mt-4 text-lg opacity-80">
            Welcome back. Let's find what you need.
          </motion.p>
        </motion.div>
      </motion.div>

      {/* Right Side */}
      <div className="p-12 flex items-center justify-center">
        <motion.div
          className="w-full max-w-md"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2 variants={itemVariants} className="text-3xl font-bold text-foreground mb-2">
            Welcome Back!
          </motion.h2>
          <motion.p variants={itemVariants} className="text-muted-foreground mb-8">
            Log in to access your saved resources.
          </motion.p>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username / Email */}
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

            {/* Password */}
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
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </motion.div>

            {/* Error Message */}
            {errorMessage && (
              <motion.p variants={itemVariants} className="text-sm text-center text-red-500">
                {errorMessage}
              </motion.p>
            )}

            {/* Submit Button */}
            <motion.div variants={itemVariants} className="pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isPending ? "Logging In..." : "Log In"}
              </button>
            </motion.div>
          </form>

          {/* Divider */}
          <motion.div variants={itemVariants} className="flex items-center my-6">
            <div className="flex-grow h-px bg-muted"></div>
            <span className="px-3 text-sm text-muted-foreground">OR</span>
            <div className="flex-grow h-px bg-muted"></div>
          </motion.div>

          {/* Google Login Button */}
          <motion.button
            variants={itemVariants}
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 border border-muted py-3 rounded-lg hover:bg-muted/10 transition-colors"
          >
            <FcGoogle size={20} />
            <span className="font-medium text-foreground">Continue with Google</span>
          </motion.button>

          {/* Signup Link */}
          <motion.p variants={itemVariants} className="text-center text-sm text-muted-foreground mt-6">
            Don’t have an account?{" "}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              Sign Up
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
