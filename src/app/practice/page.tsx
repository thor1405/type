"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Difficulty,
  TestDuration,
  TypingResult,
} from "@/lib/typing-engine/types";
import { useTypingEngine } from "@/lib/typing-engine/useTypingEngine";
import { GameStatsBar } from "@/components/typing/GameStatsBar";
import { TypingArea } from "@/components/typing/TypingArea";
import { VirtualKeyboard } from "@/components/typing/VirtualKeyboard";
import { ResultModal } from "@/components/typing/ResultModal";
import {
  Zap,
  Clock,
  BookOpen,
  RotateCcw,
  Sparkles,
  Keyboard as KeyboardIcon,
  Sliders,
} from "lucide-react";

export default function PracticePage() {
  const [difficulty, setDifficulty] = useState<Difficulty>("MEDIUM");
  const [duration, setDuration] = useState<TestDuration>(30);
  const [customSeconds, setCustomSeconds] = useState<number>(45);
  const [category, setCategory] = useState<string>("ALL");
  const [passage, setPassage] = useState<{ id?: string; title: string; text: string }>({
    id: "default",
    title: "The Speed of Innovation",
    text: "Technology moves at the speed of thought, transforming the boundaries of human potential and shaping the future of global connectivity.",
  });
  const [isLoadingPassage, setIsLoadingPassage] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [finalResult, setFinalResult] = useState<TypingResult | null>(null);
  const [newAchievements, setNewAchievements] = useState<any[]>([]);

  // Fetch passage from API
  const fetchPassage = useCallback(async (diff: Difficulty, cat: string) => {
    try {
      setIsLoadingPassage(true);
      const query = new URLSearchParams({
        difficulty: diff,
        category: cat,
        random: "true",
      });
      const res = await fetch(`/api/passages?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.passage) {
          setPassage(data.passage);
        }
      }
    } catch (e) {
      console.error("Failed to load passage:", e);
    } finally {
      setIsLoadingPassage(false);
    }
  }, []);

  useEffect(() => {
    fetchPassage(difficulty, category);
  }, [difficulty, category, fetchPassage]);

  const activeDurationSeconds =
    duration === "custom"
      ? customSeconds
      : duration === "passage"
      ? 180
      : Number(duration);

  const isPassageMode = duration === "passage";

  // Handle test completion & API record
  const handleFinish = useCallback(
    async (result: TypingResult) => {
      try {
        const res = await fetch("/api/tests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            passageId: passage.id,
            mode: "SOLO",
            difficulty,
            durationSeconds: activeDurationSeconds,
            wpm: result.wpm,
            rawCpm: result.rawCpm,
            accuracy: result.accuracy,
            charactersTyped: result.charactersTyped,
            correctChars: result.correctChars,
            incorrectChars: result.incorrectChars,
            errors: result.errors,
            duration: result.duration,
            consistency: result.consistency,
            timeline: result.timeline,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setFinalResult({
            ...result,
            id: data.testId,
            personalBestDiff: data.personalBestDiff,
            isNewBest: data.isNewBest,
          });
          if (data.newAchievements) {
            setNewAchievements(data.newAchievements);
          }
        } else {
          setFinalResult(result);
        }
      } catch {
        setFinalResult(result);
      }
    },
    [passage.id, difficulty, activeDurationSeconds]
  );

  const {
    charStates,
    currentIndex,
    status,
    metrics,
    handleKeyDown,
    reset,
  } = useTypingEngine({
    passageText: passage.text,
    durationSeconds: activeDurationSeconds,
    isPassageMode,
    difficulty,
    mode: "SOLO",
    onFinish: handleFinish,
  });

  const handleRestart = () => {
    setFinalResult(null);
    setNewAchievements([]);
    reset();
  };

  const handleNewPassage = () => {
    handleRestart();
    fetchPassage(difficulty, category);
  };

  return (
    <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Top Configuration Controls */}
      <div className="rounded-2xl bg-slate-950/80 border border-slate-800/80 p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Difficulty selector */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            {(["EASY", "MEDIUM", "HARD", "EXPERT"] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => {
                  setDifficulty(d);
                  handleRestart();
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  difficulty === d
                    ? "bg-rush-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Duration selector */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            {([15, 30, 60, 120] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setDuration(t);
                  handleRestart();
                }}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  duration === t
                    ? "bg-cyan-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {t}s
              </button>
            ))}
            <button
              onClick={() => {
                setDuration("passage");
                handleRestart();
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                duration === "passage"
                  ? "bg-purple-500 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Passage
            </button>
          </div>

          {/* Quick Action Tools */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowKeyboard(!showKeyboard)}
              className={`p-2 rounded-xl border transition-colors ${
                showKeyboard
                  ? "bg-rush-950/80 border-rush-500/40 text-rush-400"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
              title="Toggle On-Screen Keyboard"
            >
              <KeyboardIcon className="w-4 h-4" />
            </button>

            <button
              onClick={handleNewPassage}
              disabled={isLoadingPassage}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
              title="Get New Random Passage"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isLoadingPassage ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">New Text</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Arena / Results View */}
      {finalResult ? (
        <ResultModal
          result={finalResult}
          onTryAgain={handleRestart}
          newAchievements={newAchievements}
        />
      ) : (
        <div className="space-y-6">
          {/* Live Game Stats */}
          <GameStatsBar metrics={metrics} isPassageMode={isPassageMode} />

          {/* Text Title & Meta */}
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono px-1">
            <div className="flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-rush-400" />
              <span>{passage.title}</span>
            </div>
            <span>{passage.text.split(" ").length} Words</span>
          </div>

          {/* Typing Area */}
          <TypingArea
            charStates={charStates}
            currentIndex={currentIndex}
            onKeyDown={handleKeyDown}
            status={status}
          />

          {/* Optional Virtual Keyboard Visualizer */}
          {showKeyboard && (
            <div className="pt-2 animate-fade-in">
              <VirtualKeyboard
                activeKey={charStates[currentIndex - 1]?.char}
                expectedKey={charStates[currentIndex]?.expected}
              />
            </div>
          )}

          {/* Quick Restart Reminder */}
          <div className="flex items-center justify-center gap-3 text-xs text-slate-500 font-mono pt-4">
            <button
              onClick={handleRestart}
              className="flex items-center gap-1.5 hover:text-slate-300 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart Test</span>
            </button>
            <span>•</span>
            <span>Press Tab + Enter to restart anytime</span>
          </div>
        </div>
      )}
    </div>
  );
}
