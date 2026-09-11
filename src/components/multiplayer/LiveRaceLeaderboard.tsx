"use client";

import React from "react";
import { SocketPlayer } from "@/lib/socket/useSocket";
import { UserAvatar } from "../ui/UserAvatar";
import { Trophy, CheckCircle, Flame } from "lucide-react";

interface LiveRaceLeaderboardProps {
  players: SocketPlayer[];
  currentUserId?: string;
}

export function LiveRaceLeaderboard({ players, currentUserId }: LiveRaceLeaderboardProps) {
  // Sort by finishRank if finished, else by progress descending
  const sorted = [...players].sort((a, b) => {
    if (a.finished && b.finished) {
      return (a.finishRank || 99) - (b.finishRank || 99);
    }
    if (a.finished) return -1;
    if (b.finished) return 1;
    return b.progress - a.progress || b.wpm - a.wpm;
  });

  // ASCII/block progress bar generator
  const getBlockProgress = (progress: number) => {
    const totalBlocks = 10;
    const filledBlocks = Math.round((progress / 100) * totalBlocks);
    const emptyBlocks = totalBlocks - filledBlocks;
    return "█".repeat(filledBlocks) + "░".repeat(Math.max(0, emptyBlocks));
  };

  return (
    <div className="w-full rounded-2xl bg-slate-950/80 border border-slate-800/80 p-4 md:p-6 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <h3 className="font-extrabold text-sm text-slate-200 uppercase tracking-wider">
            Live Race Leaderboard
          </h3>
        </div>
        <span className="text-xs text-slate-500 font-mono">Real-Time Sync</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-500 uppercase tracking-wider border-b border-slate-900 pb-2">
              <th className="py-2 px-3">#</th>
              <th className="py-2 px-3">Player</th>
              <th className="py-2 px-3">Progress</th>
              <th className="py-2 px-3">WPM</th>
              <th className="py-2 px-3">Accuracy</th>
              <th className="py-2 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900/60 font-mono">
            {sorted.map((player, idx) => {
              const isYou = player.userId === currentUserId;
              const rank = idx + 1;

              return (
                <tr
                  key={player.socketId}
                  className={`transition-colors ${
                    isYou
                      ? "bg-rush-950/40 text-rush-300 font-bold"
                      : "hover:bg-slate-900/40 text-slate-300"
                  }`}
                >
                  <td className="py-2.5 px-3">
                    {player.finished && player.finishRank === 1 ? (
                      <span className="text-amber-400 font-black">🥇 1</span>
                    ) : player.finished && player.finishRank === 2 ? (
                      <span className="text-slate-300 font-black">🥈 2</span>
                    ) : player.finished && player.finishRank === 3 ? (
                      <span className="text-amber-600 font-black">🥉 3</span>
                    ) : (
                      <span className="text-slate-500">{rank}</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2 font-sans font-medium">
                      <UserAvatar
                        avatar={player.avatar}
                        username={player.username}
                        size="sm"
                        showRing={false}
                      />
                      <span>
                        {player.username} {isYou && "(You)"}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-rush-400 tracking-tighter">
                      {getBlockProgress(player.progress)}
                    </span>
                    <span className="ml-2 text-slate-500 text-[11px]">
                      {Math.round(player.progress)}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-bold text-rush-400">
                    {player.wpm}
                  </td>
                  <td className="py-2.5 px-3 text-cyan-400">
                    {Math.round(player.accuracy)}%
                  </td>
                  <td className="py-2.5 px-3">
                    {player.finished ? (
                      <span className="inline-flex items-center gap-1 text-rush-400 font-bold text-[11px] bg-rush-950/80 px-2 py-0.5 rounded-full border border-rush-500/30">
                        <CheckCircle className="w-3 h-3" />
                        Finished
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-400 text-[11px] bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-500/20">
                        <Flame className="w-3 h-3 animate-pulse-fast" />
                        Typing...
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
