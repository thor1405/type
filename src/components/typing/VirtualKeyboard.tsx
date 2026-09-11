"use client";

import React from "react";

interface VirtualKeyboardProps {
  activeKey?: string;
  expectedKey?: string;
}

const ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'"],
  ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
];

export function VirtualKeyboard({ activeKey = "", expectedKey = "" }: VirtualKeyboardProps) {
  const normActive = activeKey.toLowerCase();
  const normExpected = expectedKey.toLowerCase();

  return (
    <div className="w-full max-w-2xl mx-auto p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 shadow-xl select-none">
      <div className="flex flex-col gap-1.5 items-center">
        {ROWS.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-1.5 justify-center w-full">
            {row.map((key) => {
              const isExpected = key === normExpected;
              const isPressed = key === normActive;

              let keyStyle = "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700";

              if (isExpected) {
                keyStyle =
                  "bg-rush-950 text-rush-400 border-rush-500/60 shadow-[0_0_10px_rgba(16,185,129,0.3)] ring-1 ring-rush-400";
              } else if (isPressed) {
                keyStyle = "bg-cyan-950 text-cyan-400 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.4)]";
              }

              return (
                <div
                  key={key}
                  className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg border font-mono font-bold text-xs sm:text-sm flex items-center justify-center uppercase transition-all duration-100 ${keyStyle}`}
                >
                  {key}
                </div>
              );
            })}
          </div>
        ))}

        {/* Space Bar Row */}
        <div className="flex gap-2 justify-center w-full mt-0.5">
          <div
            className={`w-52 sm:w-64 h-8 rounded-lg border font-mono text-xs flex items-center justify-center uppercase transition-all duration-100 ${
              normExpected === " "
                ? "bg-rush-950 text-rush-400 border-rush-500/60 ring-1 ring-rush-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                : "bg-slate-900 text-slate-500 border-slate-800"
            }`}
          >
            Space
          </div>
        </div>
      </div>
    </div>
  );
}
