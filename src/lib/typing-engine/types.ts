export type Difficulty = "EASY" | "MEDIUM" | "HARD" | "EXPERT";

export type TestMode = "SOLO" | "MULTIPLAYER" | "CHALLENGE";

export type TestDuration = 15 | 30 | 60 | 120 | "custom" | "passage";

export type CharStatus = "untyped" | "correct" | "incorrect" | "extra";

export interface CharState {
  char: string;
  expected: string;
  status: CharStatus;
}

export interface WordToken {
  word: string;
  startIndex: number;
  chars: CharState[];
  isCompleted: boolean;
  hasError: boolean;
}

export interface TypingMetrics {
  wpm: number;
  rawCpm: number;
  accuracy: number;
  progress: number;
  totalTyped: number;
  correctChars: number;
  incorrectChars: number;
  errors: number;
  elapsedSeconds: number;
  remainingSeconds: number;
  consistency: number;
}

export interface TypingTimelinePoint {
  second: number;
  wpm: number;
  rawCpm: number;
  accuracy: number;
  errors: number;
}

export interface TypingResult {
  id?: string;
  wpm: number;
  rawCpm: number;
  accuracy: number;
  charactersTyped: number;
  correctChars: number;
  incorrectChars: number;
  errors: number;
  duration: number;
  consistency: number;
  timeline: TypingTimelinePoint[];
  passageText: string;
  passageTitle?: string;
  difficulty: Difficulty;
  mode: TestMode;
  personalBestDiff?: number;
  isNewBest?: boolean;
}

export interface TypingEngineConfig {
  passageText: string;
  durationSeconds?: number;
  isPassageMode?: boolean;
  onFinish?: (result: TypingResult) => void;
  onTick?: (metrics: TypingMetrics) => void;
}
