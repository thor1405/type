import { TypingTimelinePoint } from "./types";

/**
 * Standard typing WPM calculation:
 * 1 Word = 5 characters.
 * WPM = (correct characters / 5) / (elapsed time in minutes)
 */
export function calculateWpm(correctChars: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0 || correctChars <= 0) return 0;
  const minutes = elapsedSeconds / 60;
  const words = correctChars / 5;
  const wpm = words / minutes;
  return Math.max(0, Math.round(wpm * 10) / 10);
}

/**
 * Raw CPM (Characters Per Minute):
 * Total characters typed (including mistakes) normalized to a minute
 */
export function calculateRawCpm(totalTypedChars: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0 || totalTypedChars <= 0) return 0;
  const minutes = elapsedSeconds / 60;
  const cpm = totalTypedChars / minutes;
  return Math.max(0, Math.round(cpm * 10) / 10);
}

/**
 * Accuracy percentage:
 * Accuracy = (correct characters / total typed characters) * 100
 */
export function calculateAccuracy(correctChars: number, totalTypedChars: number): number {
  if (totalTypedChars <= 0) return 100;
  if (correctChars <= 0) return 0;
  const acc = (correctChars / totalTypedChars) * 100;
  return Math.min(100, Math.max(0, Math.round(acc * 10) / 10));
}

/**
 * Progress percentage across the passage text:
 * Progress = (currentIndex / totalPassageLength) * 100
 */
export function calculateProgress(currentIndex: number, totalLength: number): number {
  if (totalLength <= 0) return 0;
  const progress = (currentIndex / totalLength) * 100;
  return Math.min(100, Math.max(0, Math.round(progress * 10) / 10));
}

/**
 * Consistency calculation:
 * Measures speed stability across second-by-second timeline snapshots.
 * Returns percentage (0 - 100). Higher = more consistent.
 */
export function calculateConsistency(timeline: TypingTimelinePoint[]): number {
  if (timeline.length < 3) return 95;
  const wpms = timeline.map((t) => t.wpm).filter((w) => w > 0);
  if (wpms.length < 2) return 95;

  const mean = wpms.reduce((a, b) => a + b, 0) / wpms.length;
  if (mean === 0) return 100;

  const variance =
    wpms.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / wpms.length;
  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation = stdDev / mean;

  // Consistency = 100 - (CoV * 100)
  const consistency = Math.max(10, Math.min(100, 100 - coefficientOfVariation * 100));
  return Math.round(consistency * 10) / 10;
}
