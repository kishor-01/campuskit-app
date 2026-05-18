// src/components/goals/ProgressRing.tsx
'use client';

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useState } from 'react';

type ProgressRingProps = {
  percent: number; // 0 - 100
  size?: number; // px diameter
  strokeWidth?: number;
  label?: string; // center text (if empty, shows percent)
  showPercent?: boolean;
  animateDelayMs?: number;
};

/**
 * Color-Coded SVG Progress Ring with Framer Motion hue-shift.
 * Smoothly transitions through Red (0°) → Yellow (60°) → Green (120°)
 * as the completion percentage increases.
 * Uses Framer Motion for both the arc animation and the color transition.
 */
export default function ProgressRing({
  percent,
  size = 100,
  strokeWidth = 8,
  label,
  showPercent = true,
  animateDelayMs = 100,
}: ProgressRingProps) {
  const safePercent = Number.isFinite(percent) ? Math.max(0, Math.min(100, Math.round(percent))) : 0;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Motion values for smooth hue-shift animation
  const motionPercent = useMotionValue(0);
  const hue = useTransform(motionPercent, [0, 100], [0, 120]);
  const strokeColor = useTransform(hue, (h) => `hsl(${h} 85% 50%)`);
  const glowColor = useTransform(hue, (h) => `hsl(${h} 85% 50%)`);
  const dashOffset = useTransform(motionPercent, (p) => circumference - (p / 100) * circumference);

  // Animated display percent
  const [displayPercent, setDisplayPercent] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const controls = animate(motionPercent, safePercent, {
        duration: 1.2,
        ease: 'easeOut',
        onUpdate: (latest) => {
          setDisplayPercent(Math.round(latest));
        },
      });

      return () => controls.stop();
    }, animateDelayMs);

    return () => clearTimeout(timeout);
  }, [safePercent, animateDelayMs, motionPercent]);

  // Glow effect for high completion
  const glowOpacity = safePercent >= 80 ? 0.4 : safePercent >= 50 ? 0.2 : 0;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Glow backdrop */}
      {glowOpacity > 0 && (
        <motion.div
          className="absolute inset-0 rounded-full blur-lg"
          style={{
            background: glowColor,
            opacity: glowOpacity,
          }}
        />
      )}

      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        {/* Animated progress arc with hue-shifting stroke */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: dashOffset }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showPercent && (
          <motion.span
            className="text-foreground font-bold"
            style={{ fontSize: size * 0.22 }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            {displayPercent}%
          </motion.span>
        )}
        {label && (
          <span
            className="text-muted-foreground text-center leading-tight"
            style={{ fontSize: Math.max(9, size * 0.1), maxWidth: size * 0.7 }}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
