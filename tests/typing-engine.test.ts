import { describe, it, expect } from "vitest";
import {
  calculateWpm,
  calculateAccuracy,
  calculateRawCpm,
  calculateProgress,
  calculateConsistency,
} from "../src/lib/typing-engine/calculator";

describe("Typing Engine Calculator Core Logic", () => {
  describe("calculateWpm", () => {
    it("should calculate standard WPM correctly: (chars / 5) / minutes", () => {
      // 50 characters in 60 seconds = 10 words in 1 min = 10 WPM
      expect(calculateWpm(50, 60)).toBe(10);

      // 250 characters in 30 seconds = 50 words in 0.5 min = 100 WPM
      expect(calculateWpm(250, 30)).toBe(100);

      // 300 characters in 45 seconds = 60 words in 0.75 min = 80 WPM
      expect(calculateWpm(300, 45)).toBe(80);
    });

    it("should return 0 when elapsed time or correct chars is zero or negative", () => {
      expect(calculateWpm(0, 30)).toBe(0);
      expect(calculateWpm(100, 0)).toBe(0);
      expect(calculateWpm(-10, 30)).toBe(0);
    });
  });

  describe("calculateAccuracy", () => {
    it("should calculate accuracy percentage correctly", () => {
      expect(calculateAccuracy(100, 100)).toBe(100);
      expect(calculateAccuracy(95, 100)).toBe(95);
      expect(calculateAccuracy(49, 50)).toBe(98);
      expect(calculateAccuracy(0, 50)).toBe(0);
    });

    it("should handle empty or zero total typed inputs gracefully", () => {
      expect(calculateAccuracy(0, 0)).toBe(100);
    });
  });

  describe("calculateRawCpm", () => {
    it("should calculate Raw Characters Per Minute correctly", () => {
      // 300 characters in 60 seconds = 300 CPM
      expect(calculateRawCpm(300, 60)).toBe(300);

      // 150 characters in 30 seconds = 300 CPM
      expect(calculateRawCpm(150, 30)).toBe(300);
    });
  });

  describe("calculateProgress", () => {
    it("should calculate percentage progress clamped to 100%", () => {
      expect(calculateProgress(50, 100)).toBe(50);
      expect(calculateProgress(100, 100)).toBe(100);
      expect(calculateProgress(150, 100)).toBe(100);
      expect(calculateProgress(0, 100)).toBe(0);
    });
  });

  describe("calculateConsistency", () => {
    it("should calculate consistency score from timeline snapshots", () => {
      const stableTimeline = [
        { second: 1, wpm: 80, rawCpm: 400, accuracy: 100, errors: 0 },
        { second: 2, wpm: 81, rawCpm: 405, accuracy: 100, errors: 0 },
        { second: 3, wpm: 80, rawCpm: 400, accuracy: 100, errors: 0 },
        { second: 4, wpm: 82, rawCpm: 410, accuracy: 100, errors: 0 },
      ];

      const score = calculateConsistency(stableTimeline);
      expect(score).toBeGreaterThan(95);
    });
  });
});
