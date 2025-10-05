// src/app/signup/page.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Lock, Mail, User, BookText } from "lucide-react";
import { registerUser } from "@/app/actions";

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

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
    >
      {pending ? "Creating Account..." : "Create Account"}
    </button>
  );
}

export default function SignupPage() {
  const initialState = { message: "", success: false };
  const [state, formAction] = useFormState(registerUser, initialState);
  const [displayMessage, setDisplayMessage] = useState({
    text: "",
    success: false,
  });
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const { data: session } = useSession();

  // ✅ Redirect if user already logged in
  useEffect(() => {
    if (session?.user) router.push("/");
  }, [session, router]);

  // ✅ Redirect to login after successful signup
  useEffect(() => {
    if (state.success) {
      setDisplayMessage({ text: state.message, success: true });
      formRef.current?.reset();
      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } else if (state.message) {
      setDisplayMessage({ text: state.message, success: false });
    }
  }, [state, router]);

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left Section */}
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
            Your digital senior, curating the best resources for your success.
          </motion.p>
        </motion.div>
      </motion.div>

      {/* Right Section */}
      <div className="p-12 flex items-center justify-center">
        <motion.div
          className="w-full max-w-md"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl font-bold text-foreground mb-2"
          >
            Create Your Account
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-muted-foreground mb-8"
          >
            Join the community and unlock all features.
          </motion.p>

          <form ref={formRef} action={formAction} className="space-y-4">
            <motion.div variants={itemVariants}>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  name="name"
                  type="text"
                  placeholder="Full Name"
                  required
                  className="w-full p-3 pl-10 bg-muted/50 border border-muted rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  name="username"
                  type="text"
                  placeholder="Username"
                  required
                  className="w-full p-3 pl-10 bg-muted/50 border border-muted rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="relative">
                <BookText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  name="education"
                  type="text"
                  placeholder="Education (e.g., B.Tech CSE)"
                  required
                  className="w-full p-3 pl-10 bg-muted/50 border border-muted rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  required
                  className="w-full p-3 pl-10 bg-muted/50 border border-muted rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  required
                  className="w-full p-3 pl-10 bg-muted/50 border border-muted rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </motion.div>

            {displayMessage.text && (
              <p
                className={`text-sm text-center ${
                  displayMessage.success ? "text-green-500" : "text-red-500"
                }`}
              >
                {displayMessage.text}
              </p>
            )}

            <motion.div variants={itemVariants} className="pt-2">
              <SubmitButton />
            </motion.div>
          </form>

          <motion.p
            variants={itemVariants}
            className="text-center text-sm text-muted-foreground mt-6"
          >
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary hover:underline"
            >
              Log In
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
