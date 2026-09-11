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

  // Persistent refs to prevent re-render interval teardown
  const onFinishRef = useRef(onFinish);
  const onTickRef = useRef(onTick);
  const durationSecondsRef = useRef(durationSeconds);
  const isPassageModeRef = useRef(isPassageMode);
  const difficultyRef = useRef(difficulty);
  const modeRef = useRef(mode);

  const cleanPassage = passageText.trim().replace(/\r\n/g, "\n");
  const cleanPassageRef = useRef<string>(cleanPassage);

  const userInputRef = useRef<string>("");
  const errorsRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const timelineRef = useRef<TypingTimelinePoint[]>([]);
  const isFinishedRef = useRef<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize ref values on every render
  onFinishRef.current = onFinish;
  onTickRef.current = onTick;
  durationSecondsRef.current = durationSeconds;
  isPassageModeRef.current = isPassageMode;
  difficultyRef.current = difficulty;
  modeRef.current = mode;
  cleanPassageRef.current = cleanPassage;
  userInputRef.current = userInput;
  errorsRef.current = errorsCount;
  startTimeRef.current = startTime;
  timelineRef.current = timeline;

  // Sync remainingSeconds when durationSeconds changes while idle
  useEffect(() => {
    if (status === "idle") {
      setRemainingSeconds(durationSeconds);
    }
  }, [durationSeconds, status]);

  const targetChars = cleanPassage.split("");

  // Calculate character states for display
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

  // Calculate live counts
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

  // Instant live metrics on every keystroke
  const liveElapsed = startTime ? Math.max(0.1, (Date.now() - startTime) / 1000) : elapsedSeconds;
  const currentWpm = calculateWpm(correctCount, liveElapsed);
  const currentRawCpm = calculateRawCpm(userInput.length, liveElapsed);
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
  const handleFinish = useCallback((finalElapsed: number) => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    setStatus("finished");

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    playSoundEffect("finish");

    const finalInput = userInputRef.current;
    const passage = cleanPassageRef.current;
    let finalCorrect = 0;
    let finalIncorrect = 0;
    for (let i = 0; i < finalInput.length; i++) {
      if (i < passage.length && finalInput[i] === passage[i]) {
        finalCorrect++;
      } else {
        finalIncorrect++;
      }
    }

    const duration = Math.max(0.5, finalElapsed);
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
      passageText: passage,
      difficulty: difficultyRef.current,
      mode: modeRef.current,
    };

    if (onFinishRef.current) {
      onFinishRef.current(result);
    }
  }, []);

  // Timer interval effect - runs smoothly without resetting on keystroke
  useEffect(() => {
    if (status !== "running") return;

    const interval = setInterval(() => {
      if (!startTimeRef.current || isFinishedRef.current) return;

      const now = Date.now();
      const elapsed = (now - startTimeRef.current) / 1000;
      setElapsedSeconds(elapsed);

      const targetDuration = durationSecondsRef.current;
      const isPassage = isPassageModeRef.current;

      let curRemaining = targetDuration;
      if (!isPassage) {
        curRemaining = Math.max(0, targetDuration - Math.floor(elapsed));
        setRemainingSeconds(curRemaining);
      }

      // Live metrics for timeline snapshot
      const currentInput = userInputRef.current;
      const passage = cleanPassageRef.current;
      let curCorr = 0;
      for (let i = 0; i < currentInput.length; i++) {
        if (i < passage.length && currentInput[i] === passage[i]) {
          curCorr++;
        }
      }

      const snapWpm = calculateWpm(curCorr, elapsed);
      const snapRaw = calculateRawCpm(currentInput.length, elapsed);
      const snapAcc = calculateAccuracy(curCorr, currentInput.length);

      const secondMark = Math.floor(elapsed);
      const existingTimeline = timelineRef.current;
      const lastPoint = existingTimeline[existingTimeline.length - 1];

      if (!lastPoint || lastPoint.second !== secondMark) {
        const newPoint: TypingTimelinePoint = {
          second: secondMark,
          wpm: snapWpm,
          rawCpm: snapRaw,
          accuracy: snapAcc,
          errors: errorsRef.current,
        };
        timelineRef.current = [...existingTimeline, newPoint];
        setTimeline(timelineRef.current);
      }

      if (onTickRef.current) {
        onTickRef.current({
          wpm: snapWpm,
          rawCpm: snapRaw,
          accuracy: snapAcc,
          progress: calculateProgress(currentInput.length, passage.length),
          totalTyped: currentInput.length,
          correctChars: curCorr,
          incorrectChars: currentInput.length - curCorr,
          errors: errorsRef.current,
          elapsedSeconds: elapsed,
          remainingSeconds: curRemaining,
          consistency: calculateConsistency(timelineRef.current),
        });
      }

      // Check if timed test has completed
      if (!isPassage && curRemaining <= 0) {
        handleFinish(elapsed);
      }
    }, 250);

    intervalRef.current = interval;

    return () => {
      clearInterval(interval);
    };
  }, [status, handleFinish]);

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
        const passage = cleanPassageRef.current;
        const expectedChar = passage[nextIdx];

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
        if (newInput.length >= passage.length) {
          const elapsed = startTimeRef.current
            ? (Date.now() - startTimeRef.current) / 1000
            : 1;
          handleFinish(elapsed);
        }
      }
    },
    [status, handleFinish]
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
    setRemainingSeconds(durationSecondsRef.current);
    setErrorsCount(0);
    setTimeline([]);
    isFinishedRef.current = false;
    errorsRef.current = 0;
    userInputRef.current = "";
    startTimeRef.current = null;
    timelineRef.current = [];
  }, []);

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
