"use client";

import React from "react";
import { SocketPlayer } from "@/lib/socket/useSocket";
import { UserAvatar } from "../ui/UserAvatar";
import { Trophy, Flag, Zap } from "lucide-react";

interface RaceTrackProps {
  players: SocketPlayer[];
  currentUserId?: string;
}

export function RaceTrack({ players, currentUserId }: RaceTrackProps) {
  // Sort players for track ordering or keep consistent
  return (
    <div className="w-full rounded-2xl bg-slate-950/80 border border-slate-800/80 p-4 md:p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-rush-500/20 text-rush-400">
            <Zap className="w-4 h-4 fill-rush-400" />
          </div>
          <span className="font-extrabold text-sm text-slate-200 uppercase tracking-wider">
            Live Track Telemetry
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
          <Flag className="w-4 h-4 text-rush-400" />
          <span>Finish Line (100%)</span>
        </div>
      </div>

      {/* Racing Lanes */}
      <div className="space-y-3">
        {players.map((player) => {
          const isYou = player.userId === currentUserId;
          const progressClamped = Math.min(100, Math.max(0, player.progress));

          return (
            <div
              key={player.socketId}
              className={`relative rounded-xl p-2.5 border transition-all duration-200 ${
                isYou
                  ? "bg-slate-900/90 border-rush-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                  : "bg-slate-900/40 border-slate-800/60"
              }`}
            >
              {/* Lane Info Header */}
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <UserAvatar avatar={player.avatar} username={player.username} size="sm" showRing={false} />
                  <span className={`font-semibold ${isYou ? "text-rush-300 font-bold" : "text-slate-300"}`}>
                    {player.username} {isYou && "(You)"}
                  </span>
                  {player.finished && player.finishRank && (
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        player.finishRank === 1
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : player.finishRank === 2
                          ? "bg-slate-400/20 text-slate-300 border border-slate-400/40"
                          : "bg-amber-900/20 text-amber-600 border border-amber-800/40"
                      }`}
                    >
                      <Trophy className="w-3 h-3" />
                      #{player.finishRank}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className="text-rush-400 font-bold">{player.wpm} WPM</span>
                  <span className="text-slate-500">|</span>
                  <span className="text-cyan-400">{Math.round(player.accuracy)}%</span>
                </div>
              </div>

              {/* Lane Track Bar */}
              <div className="relative w-full h-4 bg-slate-950 rounded-lg overflow-hidden border border-slate-800">
                {/* Chequered flag finish zone */}
                <div className="absolute right-0 top-0 bottom-0 w-6 bg-[repeating-conic-gradient(#334155_0%_25%,#0f172a_0%_50%)] bg-[length:6px_6px] opacity-40"></div>

                {/* Progress bar fill */}
                <div
                  className={`h-full transition-all duration-200 ease-out rounded-lg ${
                    isYou
                      ? "bg-gradient-to-r from-rush-600 to-rush-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                      : "bg-gradient-to-r from-slate-700 to-slate-500"
                  }`}
                  style={{ width: `${progressClamped}%` }}
                ></div>

                {/* Racer Head Icon */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-200"
                  style={{ left: `${Math.max(2, Math.min(98, progressClamped))}%` }}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full border-2 border-slate-950 shadow-md ${
                      isYou ? "bg-rush-300 ring-2 ring-rush-500" : "bg-cyan-400"
                    }`}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
