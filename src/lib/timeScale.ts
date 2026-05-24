// src/lib/timeScale.ts

export const PIXELS_PER_DAY = 240;
export const EPOCH = new Date('2020-01-01T00:00:00Z');

/**
 * Converts a target date to an X coordinate relative to the absolute EPOCH.
 * Calculates the delta in days and multiplies by PIXELS_PER_DAY.
 */
export function dateToX(date: Date | string | number): number {
  const d = new Date(date);
  const diffTime = d.getTime() - EPOCH.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays * PIXELS_PER_DAY;
}

/**
 * Converts an X coordinate back to a target date relative to the absolute EPOCH.
 */
export function xToDate(x: number): Date {
  const diffDays = x / PIXELS_PER_DAY;
  const diffTime = diffDays * (1000 * 60 * 60 * 24);
  return new Date(EPOCH.getTime() + diffTime);
}
