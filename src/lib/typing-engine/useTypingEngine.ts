"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  CharState,
  CharStatus,
  Difficulty,
  TestMode,
  TypingEngineConfig,
  TypingMetrics,
  TypingResult,
  TypingTimelinePoint,
} from "./types";
import {
  calculateAccuracy,
  calculateConsistency,
  calculateProgress,
  calculateRawCpm,
  calculateWpm,
} from "./calculator";
import { playKeySound, playSoundEffect } from "../sound/soundEffects";

export function useTypingEngine({
  passageText = "",
  durationSeconds = 30,
  isPassageMode = false,
  difficulty = "MEDIUM" as Difficulty,
  mode = "SOLO" as TestMode,
  onFinish,
  onTick,
}: TypingEngineConfig & { difficulty?: Difficulty; mode?: TestMode }) {
  const [userInput, setUserInput] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "running" | "finished">("idle");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(durationSeconds);
  const [errorsCount, setErrorsCount] = useState<number>(0);
  const [timeline, setTimeline] = useState<TypingTimelinePoint[]>([]);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const errorsRef = useRef<number>(0);
  const userInputRef = useRef<string>("");
  const startTimeRef = useRef<number | null>(null);
  const timelineRef = useRef<TypingTimelinePoint[]>([]);
  const isFinishedRef = useRef<boolean>(false);

  userInputRef.current = userInput;
  errorsRef.current = errorsCount;
  startTimeRef.current = startTime;
  timelineRef.current = timeline;

  // Clean passage text: normalized whitespace
  const cleanPassage = passageText.trim().replace(/\r\n/g, "\n");
  const targetChars = cleanPassage.split("");

  // Calculate character states
  const charStates: CharState[] = targetChars.map((expectedChar, idx) => {
    const typedChar = userInput[idx];
    let charStatus: CharStatus = "untyped";

    if (typedChar !== undefined) {
      charStatus = typedChar === expectedChar ? "correct" : "incorrect";
    }

    return {
      char: typedChar || expectedChar,
      expected: expectedChar,
      status: charStatus,
    };
  });

  // Calculate live numbers
  let correctCount = 0;
  let incorrectCount = 0;
  for (let i = 0; i < userInput.length; i++) {
    if (i < targetChars.length) {
      if (userInput[i] === targetChars[i]) {
        correctCount++;
      } else {
        incorrectCount++;
      }
    } else {
      incorrectCount++;
    }
  }

  const currentWpm = calculateWpm(correctCount, elapsedSeconds);
  const currentRawCpm = calculateRawCpm(userInput.length, elapsedSeconds);
  const currentAccuracy = calculateAccuracy(correctCount, userInput.length);
  const currentProgress = calculateProgress(userInput.length, targetChars.length);

  const metrics: TypingMetrics = {
    wpm: currentWpm,
    rawCpm: currentRawCpm,
    accuracy: currentAccuracy,
    progress: currentProgress,
    totalTyped: userInput.length,
    correctChars: correctCount,
    incorrectChars: incorrectCount,
    errors: errorsCount,
    elapsedSeconds,
    remainingSeconds,
    consistency: calculateConsistency(timeline),
  };

  // Finish callback handler
  const handleFinish = useCallback(
    (finalElapsed: number) => {
      if (isFinishedRef.current) return;
      isFinishedRef.current = true;
      setStatus("finished");

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      playSoundEffect("finish");

      const finalInput = userInputRef.current;
      let finalCorrect = 0;
      let finalIncorrect = 0;
      for (let i = 0; i < finalInput.length; i++) {
        if (i < cleanPassage.length && finalInput[i] === cleanPassage[i]) {
          finalCorrect++;
        } else {
          finalIncorrect++;
        }
      }

      const duration = Math.max(1, finalElapsed);
      const finalWpm = calculateWpm(finalCorrect, duration);
      const finalRawCpm = calculateRawCpm(finalInput.length, duration);
      const finalAccuracy = calculateAccuracy(finalCorrect, finalInput.length);
      const finalConsistency = calculateConsistency(timelineRef.current);

      const result: TypingResult = {
        wpm: finalWpm,
        rawCpm: finalRawCpm,
        accuracy: finalAccuracy,
        charactersTyped: finalInput.length,
        correctChars: finalCorrect,
        incorrectChars: finalIncorrect,
        errors: errorsRef.current,
        duration: Math.round(duration * 10) / 10,
        consistency: finalConsistency,
        timeline: timelineRef.current,
        passageText: cleanPassage,
        difficulty,
        mode,
      };

      if (onFinish) {
        onFinish(result);
      }
    },
    [cleanPassage, difficulty, mode, onFinish]
  );

  // Timer interval effect
  useEffect(() => {
    if (status !== "running") return;

    intervalRef.current = setInterval(() => {
      if (!startTimeRef.current) return;

      const now = Date.now();
      const elapsed = (now - startTimeRef.current) / 1000;
      setElapsedSeconds(elapsed);

      let curRemaining = durationSeconds;
      if (!isPassageMode) {
        curRemaining = Math.max(0, durationSeconds - Math.floor(elapsed));
        setRemainingSeconds(curRemaining);
      }

      // Live metrics for snapshot
      const currentInput = userInputRef.current;
      let curCorr = 0;
      for (let i = 0; i < currentInput.length; i++) {
        if (i < cleanPassage.length && currentInput[i] === cleanPassage[i]) {
          curCorr++;
        }
      }

      const snapWpm = calculateWpm(curCorr, elapsed);
      const snapRaw = calculateRawCpm(currentInput.length, elapsed);
      const snapAcc = calculateAccuracy(curCorr, currentInput.length);

      const newPoint: TypingTimelinePoint = {
        second: Math.round(elapsed),
        wpm: snapWpm,
        rawCpm: snapRaw,
        accuracy: snapAcc,
        errors: errorsRef.current,
      };

      setTimeline((prev) => [...prev, newPoint]);

      if (onTick) {
        onTick({
          wpm: snapWpm,
          rawCpm: snapRaw,
          accuracy: snapAcc,
          progress: calculateProgress(currentInput.length, cleanPassage.length),
          totalTyped: currentInput.length,
          correctChars: curCorr,
          incorrectChars: currentInput.length - curCorr,
          errors: errorsRef.current,
          elapsedSeconds: elapsed,
          remainingSeconds: curRemaining,
          consistency: calculateConsistency([...timelineRef.current, newPoint]),
        });
      }

      // Check if timed test is over
      if (!isPassageMode && curRemaining <= 0) {
        handleFinish(elapsed);
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [status, durationSeconds, isPassageMode, cleanPassage, handleFinish, onTick]);

  // Key press handling
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent | KeyboardEvent) => {
      if (status === "finished") return;

      // Ignore modifier combinations (except Shift)
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      // Prevent default page scroll on Space
      if (e.key === " ") {
        e.preventDefault();
      }

      // Handle Backspace
      if (e.key === "Backspace") {
        e.preventDefault();
        playKeySound("backspace");
        setUserInput((prev) => prev.slice(0, -1));
        return;
      }

      // Only handle single characters
      if (e.key.length === 1) {
        e.preventDefault();

        // Start typing if idle
        if (status === "idle") {
          const now = Date.now();
          setStartTime(now);
          startTimeRef.current = now;
          setStatus("running");
          isFinishedRef.current = false;
        }

        const nextIdx = userInputRef.current.length;
        const expectedChar = cleanPassage[nextIdx];

        if (e.key !== expectedChar) {
          setErrorsCount((prev) => prev + 1);
          errorsRef.current += 1;
          playKeySound("error");
        } else {
          playKeySound("press");
        }

        const newInput = userInputRef.current + e.key;
        setUserInput(newInput);

        // Check if finished passage
        if (newInput.length >= cleanPassage.length) {
          const elapsed = startTimeRef.current
            ? (Date.now() - startTimeRef.current) / 1000
            : 1;
          handleFinish(elapsed);
        }
      }
    },
    [status, cleanPassage, handleFinish]
  );

  // Reset engine
  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setUserInput("");
    setStatus("idle");
    setStartTime(null);
    setElapsedSeconds(0);
    setRemainingSeconds(durationSeconds);
    setErrorsCount(0);
    setTimeline([]);
    isFinishedRef.current = false;
    errorsRef.current = 0;
    userInputRef.current = "";
    startTimeRef.current = null;
    timelineRef.current = [];
  }, [durationSeconds]);

  return {
    userInput,
    status,
    currentIndex: userInput.length,
    charStates,
    cleanPassage,
    metrics,
    timeline,
    handleKeyDown,
    reset,
    remainingSeconds,
    elapsedSeconds,
  };
}
