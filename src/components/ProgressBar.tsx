// src/components/ProgressBar.tsx
'use client'

import React, { useEffect, useState } from 'react';

type ProgressBarProps = {
  percent: number; // 0 - 100
  height?: number; // px
  label?: string;
  animateDelayMs?: number;
};

export default function ProgressBar({ percent, height = 10, label, animateDelayMs = 60 }: ProgressBarProps) {
  const safePercent = Number.isFinite(percent) ? Math.max(0, Math.min(100, Math.round(percent))) : 0;
  const [width, setWidth] = useState<number>(0);

  // compute a hue 0 (red) -> 120 (green)
  const hue = Math.round((safePercent / 100) * 120);

  useEffect(() => {
    // slight delay so the CSS transition shows a "load-in" animation
    const t = setTimeout(() => setWidth(safePercent), animateDelayMs);
    return () => clearTimeout(t);
  }, [safePercent, animateDelayMs]);

  return (
    <div className="w-full">
      {label && <div className="flex items-center justify-between text-xs mb-1"><span>{label}</span><span className="font-medium">{safePercent}%</span></div>}
      <div
        className="w-full bg-muted rounded-full overflow-hidden"
        style={{ height }}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={safePercent}
        aria-label={label ?? 'Progress'}
      >
        <div
          className="h-full transition-[width,background-color] duration-700 ease-out"
          style={{
            width: `${width}%`,
            background: `hsl(${hue} 85% 50%)`,
          }}
        />
      </div>
    </div>
  );
}
