"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { UserAvatar } from "@/components/ui/UserAvatar";
import {
  Trophy,
  Crown,
  Zap,
  Target,
  Medal,
  Sparkles,
  TrendingUp,
  Search,
} from "lucide-react";

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState<"daily" | "weekly" | "monthly" | "all">("all");
  const [category, setCategory] = useState<"wpm" | "accuracy" | "tests" | "races">("wpm");
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/leaderboard?timeframe=${timeframe}&category=${category}`);
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data.leaderboard || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [timeframe, category]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const filtered = leaderboard.filter((item) =>
    item.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const top1 = filtered[0];
  const top2 = filtered[1];
  const top3 = filtered[2];

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-800/80 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-3">
            <Trophy className="w-3.5 h-3.5" />
            <span>Global Hall of Fame</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            World Leaderboards
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            The fastest fingers on Earth. Filter by timeframe and metric to see top typists.
          </p>
        </div>

        {/* Timeframe Filter */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          {[
            { label: "Daily", val: "daily" },
            { label: "Weekly", val: "weekly" },
            { label: "Monthly", val: "monthly" },
            { label: "All Time", val: "all" },
          ].map((t) => (
            <button
              key={t.val}
              onClick={() => setTimeframe(t.val as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                timeframe === t.val
                  ? "bg-amber-500 text-slate-950 shadow-sm font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category Pills & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Category switcher */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          {[
            { label: "Highest WPM", val: "wpm", icon: Zap },
            { label: "Best Accuracy", val: "accuracy", icon: Target },
            { label: "Most Tests", val: "tests", icon: TrendingUp },
            { label: "Races Won", val: "races", icon: Trophy },
          ].map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.val}
                onClick={() => setCategory(c.val as any)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  category === c.val
                    ? "bg-slate-800 text-rush-400 border border-slate-700 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{c.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Typist */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search typist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-56 bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rush-500"
          />
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      {filtered.length >= 3 && !searchQuery && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* #2 Silver */}
          {top2 && (
            <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col items-center text-center justify-between order-2 md:order-1">
              <div className="flex flex-col items-center">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-3">
                  🥈 Rank #2
                </span>
                <UserAvatar avatar={top2.avatar} username={top2.username} size="lg" />
                <h3 className="font-extrabold text-white text-base mt-2">{top2.username}</h3>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-900 w-full flex justify-around font-mono text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">PEAK SPEED</span>
                  <span className="text-rush-400 font-black text-base">{top2.bestWpm} WPM</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">ACCURACY</span>
                  <span className="text-cyan-400 font-bold text-base">{top2.bestAccuracy}%</span>
                </div>
              </div>
            </div>
          )}

          {/* #1 Gold Champion */}
          {top1 && (
            <div className="p-7 rounded-3xl bg-gradient-to-b from-amber-950/30 via-slate-950 to-slate-950 border border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.15)] flex flex-col items-center text-center justify-between order-1 md:order-2">
              <div className="flex flex-col items-center">
                <div className="inline-flex items-center gap-1 text-xs font-mono font-black text-amber-400 uppercase tracking-widest mb-3 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-500/30">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Gold Champion</span>
                </div>
                <UserAvatar avatar={top1.avatar} username={top1.username} size="xl" />
                <h3 className="font-black text-white text-lg mt-2">{top1.username}</h3>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-900 w-full flex justify-around font-mono text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">PEAK SPEED</span>
                  <span className="text-amber-400 font-black text-xl">{top1.bestWpm} WPM</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">ACCURACY</span>
                  <span className="text-cyan-400 font-bold text-xl">{top1.bestAccuracy}%</span>
                </div>
              </div>
            </div>
          )}

          {/* #3 Bronze */}
          {top3 && (
            <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col items-center text-center justify-between order-3">
              <div className="flex flex-col items-center">
                <span className="text-xs font-mono font-bold text-amber-600 uppercase tracking-widest mb-3">
                  🥉 Rank #3
                </span>
                <UserAvatar avatar={top3.avatar} username={top3.username} size="lg" />
                <h3 className="font-extrabold text-white text-base mt-2">{top3.username}</h3>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-900 w-full flex justify-around font-mono text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">PEAK SPEED</span>
                  <span className="text-rush-400 font-black text-base">{top3.bestWpm} WPM</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">ACCURACY</span>
                  <span className="text-cyan-400 font-bold text-base">{top3.bestAccuracy}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="rounded-3xl bg-slate-950/80 border border-slate-800 p-6 sm:p-8 shadow-xl space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="text-slate-500 uppercase tracking-wider border-b border-slate-900 pb-2">
                <th className="py-3 px-3"># Rank</th>
                <th className="py-3 px-3">Typist</th>
                <th className="py-3 px-3">Best WPM</th>
                <th className="py-3 px-3">Avg WPM</th>
                <th className="py-3 px-3">Accuracy</th>
                <th className="py-3 px-3">Tests Logged</th>
                <th className="py-3 px-3 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/60">
              {filtered.map((item) => (
                <tr key={item.userId} className="hover:bg-slate-900/40 text-slate-300 transition-colors">
                  <td className="py-3 px-3">
                    {item.rank === 1 ? (
                      <span className="text-amber-400 font-black">🥇 1</span>
                    ) : item.rank === 2 ? (
                      <span className="text-slate-300 font-black">🥈 2</span>
                    ) : item.rank === 3 ? (
                      <span className="text-amber-600 font-black">🥉 3</span>
                    ) : (
                      <span className="text-slate-500">#{item.rank}</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5 font-sans font-semibold text-slate-200">
                      <UserAvatar avatar={item.avatar} username={item.username} size="sm" showRing={false} />
                      <span>{item.username}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-bold text-rush-400 text-sm">
                    {item.bestWpm} WPM
                  </td>
                  <td className="py-3 px-3 text-slate-400">{item.avgWpm} WPM</td>
                  <td className="py-3 px-3 text-cyan-400">{item.bestAccuracy}%</td>
                  <td className="py-3 px-3 text-slate-400">{item.totalTests}</td>
                  <td className="py-3 px-3 text-right font-sans">
                    <Link
                      href={`/profile/${item.username}`}
                      className="text-xs font-semibold text-rush-400 hover:underline"
                    >
                      View
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
