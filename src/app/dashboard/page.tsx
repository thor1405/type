"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import { PerformanceCharts } from "@/components/charts/PerformanceCharts";
import { UserAvatar } from "@/components/ui/UserAvatar";
import {
  Zap,
  Target,
  Trophy,
  Clock,
  Flame,
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingUp,
  LayoutDashboard,
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<"7d" | "30d" | "3m" | "all">("all");
  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = useCallback(async (timeFilter: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/dashboard?filter=${timeFilter}`);
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData(filter);
  }, [filter, fetchDashboardData]);

  const overview = dashboardData?.overview || {
    avgWpm: 0,
    bestWpm: 0,
    avgAccuracy: 0,
    bestAccuracy: 0,
    totalTests: 0,
    totalTypingTime: 0,
    currentStreak: 0,
    bestStreak: 0,
  };

  const chartData = dashboardData?.chartData || [];
  const difficultyBreakdown = dashboardData?.difficultyBreakdown || [];
  const recentTests = dashboardData?.recentTests || [];

  // Format typing time to hours/minutes
  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m ${secs % 60}s`;
  };

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-slate-800/80 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rush-950/60 border border-rush-500/30 text-rush-400 text-xs font-semibold mb-3">
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Telemetry & Progression</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Analytics Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Comprehensive overview of your typing speed evolution, accuracy consistency, and test history.
          </p>
        </div>

        {/* Timeframe Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          {[
            { label: "7 Days", val: "7d" },
            { label: "30 Days", val: "30d" },
            { label: "3 Months", val: "3m" },
            { label: "All Time", val: "all" },
          ].map((t) => (
            <button
              key={t.val}
              onClick={() => setFilter(t.val as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === t.val
                  ? "bg-rush-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 8 Metric KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Avg WPM */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Average Speed</span>
            <Zap className="w-4 h-4 text-rush-400" />
          </div>
          <div className="mt-3">
            <span className="text-3xl sm:text-4xl font-mono font-black text-rush-400">
              {overview.avgWpm}
            </span>
            <span className="text-xs text-slate-500 font-mono ml-1">WPM</span>
          </div>
        </div>

        {/* Peak Best WPM */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Peak Speed</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3">
            <span className="text-3xl sm:text-4xl font-mono font-black text-amber-400">
              {overview.bestWpm}
            </span>
            <span className="text-xs text-slate-500 font-mono ml-1">WPM</span>
          </div>
        </div>

        {/* Avg Accuracy */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Avg Accuracy</span>
            <Target className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-3">
            <span className="text-3xl sm:text-4xl font-mono font-black text-cyan-400">
              {overview.avgAccuracy}
            </span>
            <span className="text-xs text-slate-500 font-mono ml-1">%</span>
          </div>
        </div>

        {/* Best Accuracy */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Best Accuracy</span>
            <Target className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-3">
            <span className="text-3xl sm:text-4xl font-mono font-black text-purple-400">
              {overview.bestAccuracy}
            </span>
            <span className="text-xs text-slate-500 font-mono ml-1">%</span>
          </div>
        </div>

        {/* Tests Completed */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Tests Completed</span>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3">
            <span className="text-3xl sm:text-4xl font-mono font-black text-white">
              {overview.totalTests}
            </span>
          </div>
        </div>

        {/* Total Typing Time */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Typing Time</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-slate-200">
              {formatTime(overview.totalTypingTime)}
            </span>
          </div>
        </div>

        {/* Current Streak */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Daily Streak</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3">
            <span className="text-3xl sm:text-4xl font-mono font-black text-amber-400">
              {overview.currentStreak}
            </span>
            <span className="text-xs text-slate-500 font-mono ml-1">days</span>
          </div>
        </div>

        {/* Best Streak */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Best Streak</span>
            <Flame className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-3">
            <span className="text-3xl sm:text-4xl font-mono font-black text-amber-600">
              {overview.bestStreak}
            </span>
            <span className="text-xs text-slate-500 font-mono ml-1">days</span>
          </div>
        </div>
      </div>

      {/* Interactive Performance Charts */}
      <PerformanceCharts
        chartData={chartData}
        difficultyBreakdown={difficultyBreakdown}
      />

      {/* Recent Tests Table */}
      <div className="rounded-3xl bg-slate-950/80 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-rush-400" />
            <h3 className="font-extrabold text-base text-white">Recent Typing Tests</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {recentTests.length} Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="text-slate-500 uppercase tracking-wider border-b border-slate-900 pb-2">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Mode</th>
                <th className="py-2.5 px-3">Difficulty</th>
                <th className="py-2.5 px-3">Speed</th>
                <th className="py-2.5 px-3">Accuracy</th>
                <th className="py-2.5 px-3">Duration</th>
                <th className="py-2.5 px-3">Errors</th>
                <th className="py-2.5 px-3 text-right">Certificate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/60">
              {recentTests.map((t: any) => (
                <tr key={t.id} className="hover:bg-slate-900/40 text-slate-300 transition-colors">
                  <td className="py-3 px-3 text-slate-400">{t.date}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        t.mode === "MULTIPLAYER"
                          ? "bg-cyan-950/80 text-cyan-400 border border-cyan-500/30"
                          : t.mode === "CHALLENGE"
                          ? "bg-amber-950/80 text-amber-400 border border-amber-500/30"
                          : "bg-slate-900 text-slate-300 border border-slate-800"
                      }`}
                    >
                      {t.mode}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[11px] text-slate-400">{t.difficulty}</span>
                  </td>
                  <td className="py-3 px-3 font-bold text-rush-400">{t.wpm} WPM</td>
                  <td className="py-3 px-3 text-cyan-400">{t.accuracy}%</td>
                  <td className="py-3 px-3 text-slate-400">{t.duration}s</td>
                  <td className="py-3 px-3 text-rose-400">{t.errors}</td>
                  <td className="py-3 px-3 text-right font-sans">
                    <Link
                      href={`/result/${t.id}`}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-rush-400 hover:text-rush-300 transition-colors"
                    >
                      <span>View</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
