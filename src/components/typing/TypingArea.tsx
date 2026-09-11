"use client";

import React, { useEffect, useRef, useState } from "react";
import { CharState } from "@/lib/typing-engine/types";
import { MousePointerClick } from "lucide-react";

interface TypingAreaProps {
  charStates: CharState[];
  currentIndex: number;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  status: "idle" | "running" | "finished";
  disabled?: boolean;
}

export function TypingArea({
  charStates,
  currentIndex,
  onKeyDown,
  status,
  disabled = false,
}: TypingAreaProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isFocused, setIsFocused] = useState(true);

  // Auto focus input on mount or status change
  useEffect(() => {
    if (!disabled && status !== "finished") {
      inputRef.current?.focus();
    }
  }, [status, disabled]);

  const handleContainerClick = () => {
    if (!disabled && status !== "finished") {
      inputRef.current?.focus();
      setIsFocused(true);
    }
  };

  // Group characters into words for natural word wrapping and non-collapsing spaces
  const words: {
    chars: { state: CharState; originalIndex: number }[];
    hasSpaceAfter: boolean;
    spaceIndex?: number;
    spaceState?: CharState;
  }[] = [];

  let currentWordChars: { state: CharState; originalIndex: number }[] = [];

  charStates.forEach((state, idx) => {
    if (state.expected === " ") {
      words.push({
        chars: currentWordChars,
        hasSpaceAfter: true,
        spaceIndex: idx,
        spaceState: state,
      });
      currentWordChars = [];
    } else {
      currentWordChars.push({ state, originalIndex: idx });
    }
  });

  if (currentWordChars.length > 0) {
    words.push({
      chars: currentWordChars,
      hasSpaceAfter: false,
    });
  }

  return (
    <div
      onClick={handleContainerClick}
      className={`relative w-full rounded-2xl p-6 md:p-8 bg-slate-900/40 border transition-all duration-300 cursor-text select-none min-h-[220px] flex flex-col justify-center ${
        isFocused
          ? "border-rush-500/40 shadow-[0_0_25px_rgba(16,185,129,0.15)] ring-1 ring-rush-500/20"
          : "border-slate-800 hover:border-slate-700"
      }`}
    >
      {/* Hidden real input for keyboard focus & mobile virtual keyboards */}
      <input
        ref={inputRef}
        type="text"
        className="absolute opacity-0 pointer-events-none w-0 h-0"
        onKeyDown={onKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={disabled || status === "finished"}
        autoFocus
      />

      {/* Unfocused overlay reminder */}
      {!isFocused && status !== "finished" && (
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10 animate-fade-in">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rush-500 text-slate-950 font-bold text-sm shadow-[0_0_15px_rgba(16,185,129,0.5)]">
            <MousePointerClick className="w-4 h-4 animate-bounce-subtle" />
            <span>Click to focus & start typing</span>
          </div>
        </div>
      )}

      {/* Render Text Passage by Words */}
      <div className="font-mono text-xl sm:text-2xl md:text-3xl leading-relaxed tracking-wide transition-opacity duration-200 flex flex-wrap items-center">
        {words.map((word, wordIdx) => (
          <div key={wordIdx} className="inline-flex items-center mr-3 my-0.5 relative">
            {/* Render Characters in Word */}
            {word.chars.map(({ state, originalIndex }) => {
              const isCurrent = originalIndex === currentIndex && status !== "finished";
              let charClass = "text-slate-600 transition-colors duration-75";

              if (state.status === "correct") {
                charClass = "text-slate-100 font-medium";
              } else if (state.status === "incorrect") {
                charClass =
                  "text-rose-400 bg-rose-950/80 border-b-2 border-rose-500 rounded px-0.5 font-bold";
              }

              return (
                <span key={originalIndex} className="relative inline-block">
                  {isCurrent && (
                    <span className="absolute -left-[2px] top-1 bottom-1 w-[2.5px] bg-rush-400 rounded-full animate-caret shadow-[0_0_8px_rgba(16,185,129,0.8)] z-10" />
                  )}
                  <span className={charClass}>{state.expected}</span>
                </span>
              );
            })}

            {/* Render Trailing Space after Word */}
            {word.hasSpaceAfter && word.spaceState && word.spaceIndex !== undefined && (
              <span key={word.spaceIndex} className="relative inline-block ml-0.5">
                {word.spaceIndex === currentIndex && status !== "finished" && (
                  <span className="absolute -left-[1px] top-1 bottom-1 w-[2.5px] bg-rush-400 rounded-full animate-caret shadow-[0_0_8px_rgba(16,185,129,0.8)] z-10" />
                )}
                <span
                  className={
                    word.spaceState.status === "incorrect"
                      ? "text-rose-400 bg-rose-950/80 border-b-2 border-rose-500 rounded px-1 font-bold text-sm"
                      : "text-slate-700/50"
                  }
                >
                  {word.spaceState.status === "incorrect" ? "_" : "\u00A0"}
                </span>
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
