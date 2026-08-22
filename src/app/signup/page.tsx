// src/app/signup/page.tsx

"use client";

import {
  useEffect,
  useRef,
  useState,
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
} from "lucide-react";

import { FcGoogle } from "react-icons/fc";

import { signIn } from "next-auth/react";
import { registerUser } from "@/actions";

const containerVariants = {
  hidden: {
    opacity: 0,
  },

  visible: {
    opacity: 1,

    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },

  visible: {
    opacity: 1,
    y: 0,
  },
};

function SubmitButton() {
  const { pending } =
    useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
    >
      {pending
        ? "Creating Account..."
        : "Create Account"}
    </button>
  );
}

export default function SignupPage() {
  const initialState: {
    message: string;
    success: boolean;
    redirectToOtp?: boolean;
    email?: string | null;
  } = {
    message: "",
    success: false,
  };

  const [
    state,
    formAction,
  ] = useActionState<any, any>(
    registerUser as any,
    initialState
  );

  const [
    displayMessage,
    setDisplayMessage,
  ] = useState({
    text: "",
    success: false,
  });

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    isRedirecting,
    setIsRedirecting,
  ] = useState(false);

  const formRef =
    useRef<HTMLFormElement>(null);

  const router = useRouter();

  const { data: session } =
    useSession();

  // ------------------------------------------------------------
  // Registration result
  // ------------------------------------------------------------
  useEffect(() => {
    if (state?.success) {
      if (state.redirectToOtp) {
        router.push(
          `/signup/verify-otp?email=${encodeURIComponent(
            state.email || ""
          )}&newUser=true`
        );

        return;
      }

      setDisplayMessage({
        text: state.message,
        success: true,
      });

      formRef.current?.reset();

      setIsRedirecting(true);

      const timer = setTimeout(() => {
        router.push("/");
      }, 2000);

      return () =>
        clearTimeout(timer);
    }

    if (state?.message) {
      setDisplayMessage({
        text: state.message,
        success: false,
      });
    }
  }, [
    state,
    router,
  ]);

  // ------------------------------------------------------------
  // Google signup
  // ------------------------------------------------------------
  async function handleGoogleSignIn() {
    setDisplayMessage({
      text: "",
      success: false,
    });

    try {
      await signIn("google", {
        callbackUrl: "/dashboard",
      });
    } catch (error) {
      console.error(
        "Google signup error:",
        error
      );

      setDisplayMessage({
        text:
          "Unable to start Google sign-up. Please try again.",
        success: false,
      });
    }
  }

  // ------------------------------------------------------------
  // Client-side safety net
  // ------------------------------------------------------------
  useEffect(() => {
    if (session?.user) {
      router.replace("/dashboard");
    }
  }, [
    session,
    router,
  ]);

  // ------------------------------------------------------------
  // Registration success screen
  // ------------------------------------------------------------
  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="text-center"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />

          <h2 className="text-2xl font-bold text-foreground mb-2">
            Account Created Successfully!
          </h2>

          <p className="text-muted-foreground">
            Redirecting you to the homepage...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left */}
      <motion.div
        className="bg-primary text-primary-foreground p-12 flex flex-col justify-center"
        initial={{
          x: -50,
          opacity: 0,
        }}
        animate={{
          x: 0,
          opacity: 1,
        }}
        transition={{
          duration: 0.7,
          ease: "easeOut",
        }}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            variants={itemVariants}
            className="text-4xl font-bold"
          >
            Seniofy
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-4 text-lg opacity-80"
          >
            Your digital senior — curating
            the best resources for your success.
          </motion.p>
        </motion.div>
      </motion.div>

      {/* Right */}
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

          {/* Signup form */}
          <form
            ref={formRef}
            action={formAction}
            className="space-y-4"
          >
            {/* Name */}
            <motion.div
              variants={itemVariants}
            >
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                <input
                  name="name"
                  type="text"
                  placeholder="Full Name"
                  required
                  autoComplete="name"
                  className="w-full p-3 pl-10 bg-background border border-muted rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </motion.div>

            {/* Username */}
            <motion.div
              variants={itemVariants}
            >
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                <input
                  name="username"
                  type="text"
                  placeholder="Username"
                  required
                  autoComplete="username"
                  className="w-full p-3 pl-10 bg-background border border-muted rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </motion.div>

            {/* Education */}
            <motion.div
              variants={itemVariants}
            >
              <div className="relative">
                <BookText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                <input
                  name="education"
                  type="text"
                  placeholder="Education (e.g., B.Tech CSE)"
                  required
                  className="w-full p-3 pl-10 bg-background border border-muted rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </motion.div>

            {/* Email */}
            <motion.div
              variants={itemVariants}
            >
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  required
                  autoComplete="email"
                  className="w-full p-3 pl-10 bg-background border border-muted rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div
              variants={itemVariants}
            >
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                <input
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="w-full p-3 pl-10 pr-10 bg-background border border-muted rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (prev) => !prev
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </motion.div>

            {/* Message */}
            {displayMessage.text && (
              <motion.p
                variants={itemVariants}
                className={`text-sm text-center ${
                  displayMessage.success
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {displayMessage.text}
              </motion.p>
            )}

            {/* Submit */}
            <motion.div
              variants={itemVariants}
              className="pt-2"
            >
              <SubmitButton />
            </motion.div>
          </form>

          {/* Divider */}
          <motion.div
            variants={itemVariants}
            className="flex items-center my-6"
          >
            <div className="flex-grow h-px bg-muted" />

            <span className="px-3 text-sm text-muted-foreground">
              OR
            </span>

            <div className="flex-grow h-px bg-muted" />
          </motion.div>

          {/* Google */}
          <motion.button
            variants={itemVariants}
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 border border-muted py-3 rounded-lg hover:bg-muted/10 transition-colors"
          >
            <FcGoogle size={20} />

            <span className="font-medium text-foreground">
              Sign Up with Google
            </span>
          </motion.button>

          {/* Footer */}
          <motion.div
            variants={itemVariants}
            className="text-center mt-6 space-y-2"
          >
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-primary hover:underline"
              >
                Log In
              </Link>
            </p>

            <p className="text-xs text-muted-foreground">
              <Link
                href="/forgot-password"
                className="hover:underline"
              >
                Forgot Password?
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
