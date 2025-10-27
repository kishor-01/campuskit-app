// src/app/about/error.tsx
"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Frown } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        <div className="w-24 h-24 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
          <Frown className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-extrabold text-foreground mb-4">
          Something went wrong here.
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-8">
          We couldn't load the 'About' page correctly. This might be a temporary issue.
        </p>
        <button
          onClick={() => reset()}
          className="inline-block bg-primary text-primary-foreground font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </motion.div>
    </div>
  );
}
