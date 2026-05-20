"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const CYCLES = [
  {
    role: "Engineer",
    command: "analyze_bottleneck(api_route.ts)",
    action: "> Scanning execution graph...",
    result: "> ⚡ Status: Inefficient. Refactoring with Redis Pub/Sub. Latency dropped by 84%. Production ready.",
    resultColor: "text-green-600 dark:text-green-400"
  },
  {
    role: "Recruiter",
    command: 'audit_resume(student_upload.pdf, target="SWE II")',
    action: "> Parsing semantic keywords...",
    result: "> ⚠️ Match: 45%. Missing architectural context. Injecting Docker & PostgreSQL impact metrics into experience section.",
    resultColor: "text-yellow-600 dark:text-yellow-400"
  },
  {
    role: "Mentor",
    command: 'forge_blueprint("AI Reliability Engineer")',
    action: "> Compiling prerequisites...",
    result: "> 🗺️ Blueprint forged. 14 milestones generated. Branching skill tree ready. Clone to Goals? [Y/n]",
    resultColor: "text-blue-600 dark:text-blue-400"
  }
];

export default function ArchitectTerminal() {
  const [cycleIndex, setCycleIndex] = useState(0);
  const [typedCommand, setTypedCommand] = useState("");
  const [showAction, setShowAction] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const runCycle = async () => {
      const currentCycle = CYCLES[cycleIndex];
      
      // Reset state for new cycle
      setTypedCommand("");
      setShowAction(false);
      setShowResult(false);
      setCursorVisible(true);

      // 1. Type the command
      for (let i = 0; i <= currentCycle.command.length; i++) {
        if (!isMounted) return;
        setTypedCommand(currentCycle.command.substring(0, i));
        await new Promise(r => setTimeout(r, 40 + Math.random() * 40));
      }

      await new Promise(r => setTimeout(r, 300)); // Pause after typing completes

      // 2. Flash action message and pause cursor
      if (!isMounted) return;
      setCursorVisible(false); // Stop blinking cursor
      setShowAction(true);
      await new Promise(r => setTimeout(r, 1200)); // Simulate processing delay

      // 3. Show final result
      if (!isMounted) return;
      setShowAction(false);
      setShowResult(true);
      await new Promise(r => setTimeout(r, 3000)); // Pause to let user read the result

      // 4. Move to next cycle
      if (isMounted) {
        setCycleIndex((prev) => (prev + 1) % CYCLES.length);
      }
    };

    runCycle();

    return () => { isMounted = false; };
  }, [cycleIndex]);

  const currentCycle = CYCLES[cycleIndex];

  return (
    <div className="hidden md:flex w-full max-w-lg mx-auto bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex-col relative z-10 backdrop-blur-md bg-opacity-90 dark:bg-opacity-80">
      {/* macOS Style Window Header */}
      <div className="flex items-center px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
        </div>
        <div className="mx-auto text-xs font-mono text-muted-foreground flex items-center pr-8">
          seniofy-ai ~ {currentCycle.role.toLowerCase()}
        </div>
      </div>

      {/* Terminal Body */}
      <div className="p-5 font-mono text-sm min-h-[180px] flex flex-col space-y-3">
        {/* Command Line */}
        <div className="flex items-center text-foreground break-all">
          <span className="text-primary mr-2 shrink-0">~</span>
          <span>{typedCommand}</span>
          {cursorVisible && (
            <motion.div
              animate={{ opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="w-2 h-4 bg-foreground ml-1 shrink-0 inline-block align-middle"
            />
          )}
        </div>

        {/* Action (Scanning/Parsing state) */}
        {showAction && (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="text-muted-foreground break-words"
          >
            {currentCycle.action}
          </motion.div>
        )}

        {/* Result Message */}
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${currentCycle.resultColor} break-words`}
          >
            {currentCycle.result}
          </motion.div>
        )}
      </div>
    </div>
  );
}
