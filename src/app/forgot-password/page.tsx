// src/app/forgot-password/page.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ 
          text: "Password reset instructions sent to your email!", 
          type: "success" 
        });
        setEmailSent(true);
      } else {
        setMessage({ 
          text: data.error || "Failed to send reset email", 
          type: "error" 
        });
      }
    } catch (error) {
      setMessage({ 
        text: "Something went wrong. Please try again.", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Check Your Email
          </h1>
          <p className="text-muted-foreground mb-6">
            We've sent password reset instructions to <strong>{email}</strong>
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            The reset link will expire in 1 hour.
          </p>
          <div className="space-y-3">
            <Link
              href="/login"
              className="block w-full bg-primary text-primary-foreground font-medium py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Back to Login
            </Link>
            <button
              onClick={() => {
                setEmailSent(false);
                setMessage({ text: "", type: "" });
              }}
              className="block w-full border border-muted py-3 rounded-lg hover:bg-muted/10 transition-colors"
            >
              Send Again
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

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
          <Link href="/login" className="inline-flex items-center text-sm opacity-80 hover:opacity-100 mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Link>
          <motion.h1 variants={itemVariants} className="text-4xl font-bold">
            EduLink
          </motion.h1>
          <motion.p variants={itemVariants} className="mt-4 text-lg opacity-80">
            Reset your password and get back to learning.
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
          <motion.h2 variants={itemVariants} className="text-3xl font-bold text-foreground mb-2">
            Forgot Password?
          </motion.h2>
          <motion.p variants={itemVariants} className="text-muted-foreground mb-8">
            Enter your email address and we'll send you instructions to reset your password.
          </motion.p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div variants={itemVariants}>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full p-3 pl-10 bg-background border border-muted rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </motion.div>

            {/* Message Display */}
            {message.text && (
              <motion.div
                variants={itemVariants}
                className={`p-3 rounded-lg text-sm ${
                  message.type === "success"
                    ? "bg-green-500/10 text-green-600 border border-green-500/20"
                    : "bg-red-500/10 text-red-600 border border-red-500/20"
                }`}
              >
                {message.text}
              </motion.div>
            )}

            <motion.div variants={itemVariants}>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Reset Instructions"}
              </button>
            </motion.div>
          </form>

          <motion.div variants={itemVariants} className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              Remember your password?{" "}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Back to Login
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}