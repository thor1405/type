"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { Trophy, RotateCcw, ArrowLeft, Crown, Medal, Zap, Target, LayoutDashboard } from "lucide-react";
import { SocketPlayer } from "@/lib/socket/useSocket";
import { UserAvatar } from "../ui/UserAvatar";

interface PodiumModalProps {
  players: SocketPlayer[];
  currentUserId?: string;
  isHost: boolean;
  onRematch: () => void;
  onLeave: () => void;
}

export function PodiumModal({
  players,
  currentUserId,
  isHost,
  onRematch,
  onLeave,
}: PodiumModalProps) {
  // Sort players by finishRank
  const sorted = [...players].sort((a, b) => (a.finishRank || 99) - (b.finishRank || 99));
  const first = sorted[0];
  const second = sorted[1];
  const third = sorted[2];

  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
      colors: ["#f59e0b", "#10b981", "#06b6d4", "#8b5cf6"],
    });
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl bg-slate-950/95 border border-slate-800 p-6 md:p-10 shadow-2xl space-y-8 backdrop-blur-2xl animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs uppercase tracking-widest">
          <Trophy className="w-4 h-4 text-amber-400" />
          Race Completed
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Grand Prix Standings
        </h2>
      </div>

      {/* 3D Visual Podium */}
      <div className="flex items-end justify-center gap-3 sm:gap-6 pt-8 pb-4 max-w-lg mx-auto">
        {/* 2nd Place */}
        {second && (
          <div className="flex flex-col items-center flex-1">
            <div className="mb-2 flex flex-col items-center">
              <UserAvatar avatar={second.avatar} username={second.username} size="md" />
              <span className="text-xs font-bold text-slate-300 mt-1 truncate max-w-[80px]">
                {second.username}
              </span>
              <span className="text-[11px] font-mono text-rush-400 font-bold">
                {second.wpm} WPM
              </span>
            </div>
            <div className="w-full h-24 sm:h-28 bg-gradient-to-t from-slate-800 to-slate-700/80 rounded-t-2xl border-t border-x border-slate-500/40 flex flex-col items-center justify-center shadow-lg">
              <span className="text-2xl font-black text-slate-300">2</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Silver</span>
            </div>
          </div>
        )}

        {/* 1st Place Champion */}
        {first && (
          <div className="flex flex-col items-center flex-1 z-10">
            <div className="mb-2 flex flex-col items-center">
              <div className="relative">
                <Crown className="w-6 h-6 text-amber-400 absolute -top-5 left-1/2 -translate-x-1/2 animate-bounce-subtle" />
                <UserAvatar avatar={first.avatar} username={first.username} size="lg" />
              </div>
              <span className="text-sm font-extrabold text-amber-300 mt-1 truncate max-w-[100px]">
                {first.username}
              </span>
              <span className="text-xs font-mono text-rush-400 font-extrabold">
                {first.wpm} WPM
              </span>
            </div>
            <div className="w-full h-32 sm:h-40 bg-gradient-to-t from-amber-600 to-amber-500 rounded-t-2xl border-t border-x border-amber-300/60 flex flex-col items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.3)]">
              <span className="text-3xl font-black text-slate-950">1</span>
              <span className="text-[10px] font-black text-amber-950 uppercase tracking-wider">
                Winner
              </span>
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {third && (
          <div className="flex flex-col items-center flex-1">
            <div className="mb-2 flex flex-col items-center">
              <UserAvatar avatar={third.avatar} username={third.username} size="md" />
              <span className="text-xs font-bold text-slate-300 mt-1 truncate max-w-[80px]">
                {third.username}
              </span>
              <span className="text-[11px] font-mono text-rush-400 font-bold">
                {third.wpm} WPM
              </span>
            </div>
            <div className="w-full h-16 sm:h-20 bg-gradient-to-t from-amber-950 to-amber-900/80 rounded-t-2xl border-t border-x border-amber-700/40 flex flex-col items-center justify-center shadow-lg">
              <span className="text-xl font-black text-amber-600">3</span>
              <span className="text-[10px] font-bold text-amber-700 uppercase">Bronze</span>
            </div>
          </div>
        )}
      </div>

      {/* Full Leaderboard Table */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          All Racer Telemetry
        </h4>
        <div className="divide-y divide-slate-800/80">
          {sorted.map((p, idx) => {
            const isYou = p.userId === currentUserId;
            return (
              <div
                key={p.socketId}
                className={`py-2.5 px-3 flex items-center justify-between text-xs rounded-xl ${
                  isYou ? "bg-rush-950/30 text-rush-300 font-bold" : "text-slate-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 font-mono font-bold text-slate-500">#{idx + 1}</span>
                  <UserAvatar avatar={p.avatar} username={p.username} size="sm" showRing={false} />
                  <span>
                    {p.username} {isYou && "(You)"}
                  </span>
                </div>

                <div className="flex items-center gap-4 font-mono">
                  <div className="flex items-center gap-1 text-rush-400 font-bold">
                    <Zap className="w-3.5 h-3.5" />
                    <span>{p.wpm} WPM</span>
                  </div>
                  <div className="flex items-center gap-1 text-cyan-400">
                    <Target className="w-3.5 h-3.5" />
                    <span>{Math.round(p.accuracy)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800/80">
        <button
          onClick={onLeave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Leave Room</span>
        </button>

        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-xs transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 text-slate-400" />
            <span>Dashboard</span>
          </Link>

          {isHost ? (
            <button
              onClick={onRematch}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rush-500 hover:bg-rush-400 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all hover:scale-105"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Rematch (New Passage)</span>
            </button>
          ) : (
            <span className="text-xs text-slate-500 italic">Waiting for host to start rematch...</span>
          )}
        </div>
      </div>
    </div>
  );
}
