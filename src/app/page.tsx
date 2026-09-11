"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Zap,
  Users,
  Swords,
  Trophy,
  ArrowRight,
  Sparkles,
  Shield,
  Clock,
  Target,
  BarChart3,
  Flame,
  Award,
} from "lucide-react";
import { TypingArea } from "@/components/typing/TypingArea";
import { GameStatsBar } from "@/components/typing/GameStatsBar";
import { useTypingEngine } from "@/lib/typing-engine/useTypingEngine";

const HERO_SAMPLE = "The speed of thought transforms ideas into reality with every rapid keystroke.";

export default function LandingPage() {
  const {
    charStates,
    currentIndex,
    status,
    metrics,
    handleKeyDown,
    reset,
  } = useTypingEngine({
    passageText: HERO_SAMPLE,
    durationSeconds: 15,
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28">
        {/* Background glow meshes */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-rush-500/15 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[250px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-semibold text-rush-400 mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-rush-400" />
            <span>TypeRush 2.0 — Real-Time Competitive Typing</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white max-w-4xl leading-[1.08]">
            Type faster. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-rush-400 via-emerald-300 to-cyan-400 bg-clip-text text-transparent">
              Compete harder.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-xl text-slate-400 max-w-2xl leading-relaxed">
            Improve your typing speed, race your friends in synchronized real-time grand prix,
            and challenge yourself to become an elite keyboard warrior.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/practice"
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-rush-500 hover:bg-rush-400 text-slate-950 font-extrabold text-sm shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all hover:scale-105 active:scale-95"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Start Typing Solo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/multiplayer"
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-100 font-bold text-sm shadow-sm transition-all hover:border-slate-600"
            >
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Race Friends Live</span>
            </Link>
          </div>

          {/* Interactive Live Typing Preview */}
          <div className="w-full max-w-3xl mt-12 sm:mt-16 text-left">
            <div className="rounded-3xl bg-slate-950/90 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono uppercase tracking-wider text-rush-400 font-bold">
                  Instant Warmup Test
                </span>
                <span className="font-mono text-slate-500">Click & start typing</span>
              </div>

              <GameStatsBar metrics={metrics} isPassageMode={false} />

              <TypingArea
                charStates={charStates}
                currentIndex={currentIndex}
                onKeyDown={handleKeyDown}
                status={status}
              />

              {status === "finished" && (
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-rush-400 font-mono font-bold">
                    Great run! Final Speed: {metrics.wpm} WPM ({metrics.accuracy}% Acc)
                  </span>
                  <button
                    onClick={reset}
                    className="text-xs bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 font-semibold"
                  >
                    Reset Warmup
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stats Showcase Counter */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 w-full max-w-4xl mt-16 pt-12 border-t border-slate-900">
            <div>
              <div className="text-3xl sm:text-4xl font-mono font-black text-white">100K+</div>
              <div className="text-xs sm:text-sm font-medium text-slate-400 mt-1">Tests Completed</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-mono font-black text-rush-400">50K+</div>
              <div className="text-xs sm:text-sm font-medium text-slate-400 mt-1">Active Racers</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-mono font-black text-cyan-400">1M+</div>
              <div className="text-xs sm:text-sm font-medium text-slate-400 mt-1">Words Typed</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-mono font-black text-amber-400">142</div>
              <div className="text-xs sm:text-sm font-medium text-slate-400 mt-1">Peak Record WPM</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Modes Section */}
      <section className="py-16 bg-slate-950/40 border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold font-mono uppercase tracking-widest text-rush-400">
              Battle-Tested Game Modes
            </h2>
            <p className="text-3xl font-extrabold text-white mt-2 tracking-tight">
              Designed for Solo Mastery & Live Competition
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Solo Practice */}
            <div className="rounded-3xl bg-slate-900/40 border border-slate-800 p-8 flex flex-col justify-between hover:border-slate-700 transition-all group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-rush-950/80 border border-rush-500/30 text-rush-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 fill-rush-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Solo Practice</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  Customize duration from 15s to 120s or complete whole passages across Easy, Medium,
                  Hard, and Expert tiers with zero input latency.
                </p>
              </div>
              <Link
                href="/practice"
                className="inline-flex items-center gap-2 text-xs font-bold text-rush-400 hover:text-rush-300 font-mono"
              >
                <span>Enter Practice Arena</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Multiplayer Races */}
            <div className="rounded-3xl bg-slate-900/40 border border-slate-800 p-8 flex flex-col justify-between hover:border-slate-700 transition-all group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Real-Time Multiplayer</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  Create custom racing rooms, generate shareable links, enjoy synchronized 3-2-1-GO
                  countdowns, and watch live racetracks update instantly.
                </p>
              </div>
              <Link
                href="/multiplayer"
                className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 font-mono"
              >
                <span>Join Multiplayer Grand Prix</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Friend Challenges */}
            <div className="rounded-3xl bg-slate-900/40 border border-slate-800 p-8 flex flex-col justify-between hover:border-slate-700 transition-all group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Swords className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Friend Challenges</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  Set target WPM benchmarks, choose passages, and share unique challenge URLs to
                  compete asynchronously with dedicated leaderboards.
                </p>
              </div>
              <Link
                href="/challenges"
                className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 font-mono"
              >
                <span>Create a Challenge</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics & Progression Feature Highlight */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-semibold">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>SaaS-Grade Analytics</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Track Your Evolution. <br />
              Celebrate Every Personal Best.
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Every keystroke counts. View comprehensive second-by-second telemetry curves, daily
              streaks, accuracy consistency ratings, and performance partitioned by difficulty.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <Flame className="w-5 h-5 text-amber-400 mb-2" />
                <h4 className="font-bold text-white text-sm">Streak Engine</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Build habits with active day tracking & milestone alerts.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <Award className="w-5 h-5 text-rush-400 mb-2" />
                <h4 className="font-bold text-white text-sm">Badges & XP</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Unlock tiered achievement trophies as your WPM climbs.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition-colors"
              >
                <span>Explore Analytics Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-950 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono font-bold text-slate-400">
                TELEMETRY_SAMPLE // SPEED_CURVE
              </span>
              <span className="text-xs font-mono text-rush-400 font-bold">+18 WPM THIS MONTH</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-900 flex items-center justify-between">
                <span className="text-slate-400">Average Speed</span>
                <span className="font-bold text-rush-400">92.4 WPM</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 flex items-center justify-between">
                <span className="text-slate-400">Accuracy Benchmark</span>
                <span className="font-bold text-cyan-400">98.8%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 flex items-center justify-between">
                <span className="text-slate-400">Total Typing Duration</span>
                <span className="font-bold text-amber-400">24h 18m</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 border-t border-slate-900 bg-gradient-to-b from-slate-950 to-[#090d16] text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Ready to test your limits?
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Join thousands of typists sharpening their fingers, setting records, and dominating live
            races.
          </p>
          <div className="pt-4 flex justify-center">
            <Link
              href="/practice"
              className="px-8 py-4 rounded-xl bg-rush-500 hover:bg-rush-400 text-slate-950 font-black text-sm shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all hover:scale-105"
            >
              Start Typing Now — 100% Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
