"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  RotateCcw,
  Share2,
  LayoutDashboard,
  Trophy,
  Zap,
  Target,
  Clock,
  AlertCircle,
  Sparkles,
  Check,
  Flame,
} from "lucide-react";
import { TypingResult } from "@/lib/typing-engine/types";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface ResultModalProps {
  result: TypingResult;
  onTryAgain: () => void;
  newAchievements?: any[];
}

export function ResultModal({
  result,
  onTryAgain,
  newAchievements = [],
}: ResultModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Fire celebratory confetti if high WPM or new PB
    if (result.wpm >= 80 || result.isNewBest || result.accuracy >= 98) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#10b981", "#06b6d4", "#f59e0b", "#8b5cf6"],
      });
    }
  }, [result]);

  // Handle Tab + Enter keyboard shortcut to restart instantly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        onTryAgain();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onTryAgain]);

  const handleShare = async () => {
    const shareText = `I just typed ${result.wpm} WPM with ${result.accuracy}% accuracy on TypeRush! 🚀`;
    const shareUrl = result.id
      ? `${window.location.origin}/result/${result.id}`
      : window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "My TypeRush Result",
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Recharts custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg bg-slate-900 border border-slate-700 p-2 text-xs shadow-xl">
          <p className="text-slate-400 font-mono">{label}s</p>
          <p className="text-rush-400 font-bold font-mono">{payload[0].value} WPM</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl bg-slate-950/90 border border-slate-800 p-6 md:p-10 shadow-2xl space-y-8 animate-fade-in backdrop-blur-xl">
      {/* Top Banner & Personal Best Badge */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono uppercase tracking-widest text-rush-400 bg-rush-950/80 border border-rush-500/30 px-2.5 py-1 rounded-md">
              {result.mode} MODE
            </span>
            <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md">
              {result.difficulty}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tracking-tight">
            Performance Breakdown
          </h2>
        </div>

        {result.isNewBest && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500/20 to-rush-500/20 border border-amber-500/40 text-amber-300 font-bold text-sm shadow-[0_0_20px_rgba(245,158,11,0.2)] animate-pulse-fast">
            <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
            <span>New Personal Best!</span>
            {result.personalBestDiff !== undefined && result.personalBestDiff > 0 && (
              <span className="text-xs font-mono font-black text-amber-200">
                (+{result.personalBestDiff} WPM)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* WPM */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Net Speed</span>
            <Zap className="w-4 h-4 text-rush-400" />
          </div>
          <div className="mt-2">
            <span className="text-4xl sm:text-5xl font-mono font-black text-rush-400 tracking-tight">
              {result.wpm}
            </span>
            <span className="text-xs text-slate-500 font-mono ml-1">WPM</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Raw CPM: {Math.round(result.rawCpm)}
          </p>
        </div>

        {/* Accuracy */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Accuracy</span>
            <Target className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2">
            <span className="text-4xl sm:text-5xl font-mono font-black text-cyan-400 tracking-tight">
              {result.accuracy}
            </span>
            <span className="text-xs text-slate-500 font-mono ml-1">%</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Consistency: {result.consistency}%
          </p>
        </div>

        {/* Characters Breakdown */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Characters</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-slate-200">
            <span className="text-rush-400">{result.correctChars}</span>
            <span className="text-slate-600"> / </span>
            <span className="text-rose-400">{result.incorrectChars}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Total Typed: {result.charactersTyped}
          </p>
        </div>

        {/* Duration & Errors */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Time & Errors</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-slate-200">
            <span>{result.duration}s</span>
          </div>
          <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {result.errors} mistakes corrected
          </p>
        </div>
      </div>

      {/* Speed Progression Chart */}
      {result.timeline && result.timeline.length > 1 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Live Speed Progression (WPM over Time)
          </h3>
          <div className="h-44 w-full bg-slate-900/40 rounded-2xl border border-slate-800/80 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={result.timeline}>
                <defs>
                  <linearGradient id="wpmGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="second" stroke="#64748b" tickLine={false} unit="s" />
                <YAxis stroke="#64748b" tickLine={false} domain={["dataMin - 5", "dataMax + 10"]} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="wpm"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#wpmGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Unlocked Achievements Toast */}
      {newAchievements.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-rush-950 via-slate-900 to-cyan-950 border border-rush-500/40 shadow-lg flex items-center gap-3">
          <div className="p-2 rounded-xl bg-rush-500 text-slate-950">
            <Sparkles className="w-5 h-5 fill-slate-950" />
          </div>
          <div>
            <div className="text-xs font-bold text-rush-400 uppercase tracking-wider">
              Achievement Unlocked!
            </div>
            <div className="font-bold text-white text-sm">
              {newAchievements.map((a) => a.title).join(", ")}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800/80">
        <button
          onClick={onTryAgain}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-rush-500 hover:bg-rush-400 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all hover:scale-105 active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Try Again</span>
          <kbd className="hidden sm:inline font-mono text-[10px] bg-rush-600/60 px-1.5 py-0.5 rounded text-slate-950">
            Tab + Enter
          </kbd>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-rush-400" />
                <span className="text-rush-400">Copied Link!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-slate-400" />
                <span>Share Result</span>
              </>
            )}
          </button>

          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 text-slate-400" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
