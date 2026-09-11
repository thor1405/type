"use client";

import React from "react";
import { Zap, Target, Clock, AlertTriangle } from "lucide-react";
import { TypingMetrics } from "@/lib/typing-engine/types";

interface GameStatsBarProps {
  metrics: TypingMetrics;
  isPassageMode?: boolean;
}

export function GameStatsBar({ metrics, isPassageMode = false }: GameStatsBarProps) {
  return (
    <div className="w-full space-y-3">
      {/* Top progress bar */}
      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800/80">
        <div
          className="h-full bg-gradient-to-r from-rush-500 to-cyan-400 transition-all duration-150 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]"
          style={{ width: `${Math.min(100, Math.max(0, metrics.progress))}%` }}
        ></div>
      </div>

      {/* Main KPI badges */}
      <div className="flex items-center justify-between gap-3 bg-slate-900/60 backdrop-blur border border-slate-800/80 px-4 py-2.5 rounded-xl text-slate-300">
        {/* WPM */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rush-950/80 border border-rush-500/30 text-rush-400">
            <Zap className="w-4 h-4 fill-rush-400" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Speed
            </div>
            <div className="text-xl font-mono font-extrabold text-rush-400 leading-tight">
              {metrics.wpm} <span className="text-xs font-normal text-slate-500">WPM</span>
            </div>
          </div>
        </div>

        {/* Accuracy */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Accuracy
            </div>
            <div className="text-xl font-mono font-extrabold text-cyan-400 leading-tight">
              {metrics.accuracy}%
            </div>
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-950/80 border border-amber-500/30 text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {isPassageMode ? "Elapsed" : "Time Left"}
            </div>
            <div className="text-xl font-mono font-extrabold text-amber-400 leading-tight">
              {isPassageMode ? `${Math.round(metrics.elapsedSeconds)}s` : `${metrics.remainingSeconds}s`}
            </div>
          </div>
        </div>

        {/* Errors */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-950/80 border border-rose-500/30 text-rose-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Errors
            </div>
            <div className="text-xl font-mono font-extrabold text-rose-400 leading-tight">
              {metrics.errors}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
