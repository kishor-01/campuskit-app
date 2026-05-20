"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { trackEvent } from "@/actions/analyticsActions";

const LEARN_PLACEHOLDERS = [
  "Distributed Systems...",
  "Rust & WebAssembly...",
  "Quantitative Finance...",
  "LLMOps & Vector Databases...",
];

const BUILD_PLACEHOLDERS = [
  "a Redis clone in Go...",
  "a Real-Time Chat App...",
  "an AI Code Reviewer...",
  "a Next.js SaaS Boilerplate...",
];

export default function ActionSearchBar() {
  const [mode, setMode] = useState<"learn" | "build">("learn");
  const [input, setInput] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholderText, setPlaceholderText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  // Reset typewriter when mode changes
  useEffect(() => {
    setPlaceholderText("");
    setPlaceholderIndex(0);
    setIsDeleting(false);
  }, [mode]);

  // Typewriter effect for placeholder
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const currentPlaceholders = mode === "learn" ? LEARN_PLACEHOLDERS : BUILD_PLACEHOLDERS;
    const safeIndex = placeholderIndex % currentPlaceholders.length;
    const currentFullText = currentPlaceholders[safeIndex];

    if (isDeleting) {
      if (placeholderText === "") {
        setIsDeleting(false);
        setPlaceholderIndex((prev) => prev + 1);
        timer = setTimeout(() => {}, 500); // Pause before typing next
      } else {
        timer = setTimeout(() => {
          setPlaceholderText(currentFullText.substring(0, placeholderText.length - 1));
        }, 50);
      }
    } else {
      if (placeholderText === currentFullText) {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2000); // Pause before deleting
      } else {
        timer = setTimeout(() => {
          setPlaceholderText(currentFullText.substring(0, placeholderText.length + 1));
        }, 100);
      }
    }

    return () => clearTimeout(timer);
  }, [placeholderText, isDeleting, placeholderIndex]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Non-blocking telemetry
    trackEvent("HERO_SEARCH", { mode, input }).catch(console.error);

    if (mode === "learn") {
      router.push(`/roadmaps?search=${encodeURIComponent(input)}`);
    } else {
      router.push(`/tools/project-generator?skills=${encodeURIComponent(input)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative mt-8 max-w-full lg:max-w-xl xl:max-w-2xl mx-auto md:mx-0 w-full group z-[100]">
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-blue-500/30 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 pointer-events-none -z-10"></div>
      
      <div className="relative flex flex-col md:flex-row items-stretch bg-card border border-border rounded-xl shadow-lg overflow-hidden">
        
        {/* Inline Context Toggle */}
        <div className="flex md:border-r border-b md:border-b-0 border-border p-1 bg-muted/50 w-full md:w-auto shrink-0">
          <button
            type="button"
            onClick={() => setMode("learn")}
            className={`flex-1 md:w-24 py-3 md:py-2 px-3 text-sm font-semibold rounded-lg transition-all ${
              mode === "learn"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Learn
          </button>
          <button
            type="button"
            onClick={() => setMode("build")}
            className={`flex-1 md:w-24 py-3 md:py-2 px-3 text-sm font-semibold rounded-lg transition-all ${
              mode === "build"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Build
          </button>
        </div>

        {/* Input Area (Clickable Hitbox) */}
        <div 
          className="flex-1 flex items-center px-4 py-3 w-full cursor-text"
          onClick={() => document.getElementById("hero-search-input")?.focus()}
        >
          <Search className="w-5 h-5 text-muted-foreground mr-3 shrink-0" />
          <div className="flex-1 flex items-center overflow-hidden">
            {!input && (
              <span className="text-foreground whitespace-nowrap hidden sm:inline shrink-0">
                {mode === "learn" ? "I want to master " : "I want to build "}
              </span>
            )}
            <div className="relative flex-1 ml-1 h-6">
              {!input && (
                <span className="absolute inset-0 text-muted-foreground pointer-events-none whitespace-nowrap overflow-hidden">
                  {placeholderText}
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="inline-block w-[2px] h-[1em] bg-muted-foreground ml-[1px] align-middle"
                  />
                </span>
              )}
              <input
                id="hero-search-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full h-full bg-transparent border-none outline-none text-foreground placeholder:text-transparent focus:ring-0"
                placeholder=" "
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-2 w-full md:w-auto border-t md:border-t-0 border-border md:border-none shrink-0 flex items-stretch">
          <button
            type="submit"
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            Forge Path <Zap className="w-4 h-4" />
          </button>
        </div>
        
      </div>
    </form>
  );
}
