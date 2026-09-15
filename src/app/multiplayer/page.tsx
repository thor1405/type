"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { useSocket, BotDifficulty } from "@/lib/socket/useSocket";
import {
  Users,
  Plus,
  ArrowRight,
  Zap,
  Bot,
  RefreshCw,
  Trophy,
  Shield,
  Layers,
  Sparkles,
} from "lucide-react";

import { useCurrentPlayer } from "@/lib/auth/guest";

export default function MultiplayerHubPage() {
  const router = useRouter();
  const player = useCurrentPlayer();
  const {
    publicRooms,
    refreshPublicRooms,
    createRoom,
    joinRoom,
    addBot,
    room,
    clearRoom,
    errorMessage,
    setErrorMessage,
  } = useSocket();

  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [customRoomName, setCustomRoomName] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("MEDIUM");
  const [quickBotDifficulty, setQuickBotDifficulty] = useState<BotDifficulty>("MEDIUM");
  const [isNavigating, setIsNavigating] = useState(false);
  const [pendingBotDiff, setPendingBotDiff] = useState<BotDifficulty | null>(null);

  const currentUsername = player.username;
  const currentAvatar = player.avatar;
  const currentUserId = player.id;

  // Clear stale room and refresh public lobbies on mount
  useEffect(() => {
    clearRoom();
    refreshPublicRooms();
  }, [clearRoom, refreshPublicRooms]);

  // Navigate to race page only when room is newly created or joined
  useEffect(() => {
    if (isNavigating && room?.code) {
      if (pendingBotDiff) {
        addBot(pendingBotDiff);
        setPendingBotDiff(null);
      }
      setIsNavigating(false);
      router.push(`/race/${room.code}`);
    }
  }, [isNavigating, room?.code, pendingBotDiff, addBot, router]);

  const handleCreateRoom = () => {
    const name = customRoomName.trim() || `${currentUsername}'s Grand Prix`;
    setIsNavigating(true);
    createRoom(name, currentUsername, currentAvatar, currentUserId, selectedDifficulty);
    setShowCreateModal(false);
  };

  const handleQuickBotRace = () => {
    const name = `Duel vs ${quickBotDifficulty} AI`;
    setPendingBotDiff(quickBotDifficulty);
    setIsNavigating(true);
    createRoom(name, currentUsername, currentAvatar, currentUserId, quickBotDifficulty);
  };

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCodeInput.trim()) return;
    setIsNavigating(true);
    joinRoom(roomCodeInput.trim(), currentUsername, currentAvatar, currentUserId);
  };

  const handleJoinPublic = (code: string) => {
    setIsNavigating(true);
    joinRoom(code, currentUsername, currentAvatar, currentUserId);
  };

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-800/80 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-3">
            <Users className="w-3.5 h-3.5" />
            <span>Real-Time Synchronized Grand Prix</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Multiplayer Typing Arena
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            Create a private room to race with friends, join an active public lobby, or sharpen your
            speed against automated AI racers with selectable difficulties.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-rush-500 hover:bg-rush-400 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Create Room</span>
          </button>
        </div>
      </div>

      {/* Error Toast */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-sm flex items-center justify-between animate-fade-in">
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-xs text-rose-400 hover:text-white underline font-mono"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2-Column Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Join by Code Card */}
        <div className="rounded-3xl bg-slate-950/80 border border-slate-800 p-6 sm:p-8 shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-extrabold text-white">Join with Room Code</h3>
            <p className="text-xs text-slate-400">
              Got a room code from a friend? Enter it below to immediately jump into their race lobby.
            </p>
          </div>

          <form onSubmit={handleJoinByCode} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. RACE-1234"
              value={roomCodeInput}
              onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
            <button
              type="submit"
              className="px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-sm transition-all"
            >
              Join
            </button>
          </form>
        </div>

        {/* Solo vs AI Bot Racer Card */}
        <div className="rounded-3xl bg-slate-950/80 border border-slate-800 p-6 sm:p-8 shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-extrabold text-white">Quick Bot Challenge</h3>
            <p className="text-xs text-slate-400">
              Want instant competition right now? Choose your bot skill level and jump directly into a synchronized race!
            </p>
          </div>

          <div className="space-y-3">
            {/* 4-tier selector */}
            <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-bold">
              {(
                [
                  { id: "EASY", label: "Easy", speed: "~35 WPM" },
                  { id: "MEDIUM", label: "Med", speed: "~65 WPM" },
                  { id: "HARD", label: "Hard", speed: "~95 WPM" },
                  { id: "EXPERT", label: "Expert", speed: "~130 WPM" },
                ] as const
              ).map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setQuickBotDifficulty(tier.id)}
                  className={`py-1.5 px-1 rounded-lg text-center transition-all ${
                    quickBotDifficulty === tier.id
                      ? tier.id === "EASY"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                        : tier.id === "MEDIUM"
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                        : tier.id === "HARD"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                        : "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 border border-transparent"
                  }`}
                >
                  <div>{tier.label}</div>
                  <div className="text-[9px] font-mono opacity-70 font-normal">{tier.speed}</div>
                </button>
              ))}
            </div>

            <button
              onClick={handleQuickBotRace}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-200 font-bold text-xs transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_15px_rgba(168,85,247,0.2)]"
            >
              <Bot className="w-4 h-4 text-purple-400" />
              <span>Launch Race vs {quickBotDifficulty} Bot</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Public Rooms Section */}
      <div className="rounded-3xl bg-slate-950/80 border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <h3 className="font-extrabold text-base text-white">Active Public Lobbies</h3>
          </div>

          <button
            onClick={refreshPublicRooms}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {publicRooms.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-3 font-mono text-xs">
            <p>No active public race rooms right now.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl bg-slate-900 text-rush-400 border border-slate-800 font-sans font-bold hover:bg-slate-850"
            >
              Be the first to create one!
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {publicRooms.map((r) => (
              <div
                key={r.code}
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="font-mono font-bold text-rush-400">{r.code}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                      {r.playerCount} Players
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-200 text-sm truncate">{r.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 capitalize font-mono">
                    Difficulty: {r.difficulty}
                  </p>
                </div>

                <button
                  onClick={() => handleJoinPublic(r.code)}
                  className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-rush-500/10 hover:bg-rush-500 text-rush-400 hover:text-slate-950 font-bold text-xs transition-colors border border-rush-500/30 hover:border-rush-500"
                >
                  <span>Join Race</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-white">Create Race Room</h3>
              <p className="text-xs text-slate-400">
                Configure your race settings. You will get a shareable link once created.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Room Name
                </label>
                <input
                  type="text"
                  placeholder={`${currentUsername}'s Grand Prix`}
                  value={customRoomName}
                  onChange={(e) => setCustomRoomName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-rush-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Passage Difficulty Level
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["EASY", "MEDIUM", "HARD", "EXPERT"] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSelectedDifficulty(d)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                        selectedDifficulty === d
                          ? "bg-rush-500 text-slate-950 border-rush-500 shadow-sm"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-950 text-slate-400 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateRoom}
                className="px-6 py-2 rounded-xl bg-rush-500 hover:bg-rush-400 text-slate-950 font-bold text-xs shadow-md"
              >
                Create & Enter Lobby
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
