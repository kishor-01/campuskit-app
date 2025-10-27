"use client";

import { motion } from 'framer-motion';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left Pane (Branding) */}
      <div className="hidden lg:flex lg:w-1/2 bg-muted/50 flex-col justify-center items-center p-12 text-center border-r border-muted">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center font-bold text-primary text-3xl mx-auto">
            C
          </div>
          <h1 className="mt-6 text-4xl font-bold text-foreground">EduLink</h1>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="mt-4 text-lg text-muted-foreground"
        >
          Your digital senior, curating the best for your success.
        </motion.p>
      </div>

      {/* Right Pane (Form) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        {children}
      </div>
    </div>
  );
}