"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { useSocket, SocketPlayer } from "@/lib/socket/useSocket";
import { useTypingEngine } from "@/lib/typing-engine/useTypingEngine";
import { TypingArea } from "@/components/typing/TypingArea";
import { GameStatsBar } from "@/components/typing/GameStatsBar";
import { RaceTrack } from "@/components/multiplayer/RaceTrack";
import { LiveRaceLeaderboard } from "@/components/multiplayer/LiveRaceLeaderboard";
import { PodiumModal } from "@/components/multiplayer/PodiumModal";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { playSoundEffect } from "@/lib/sound/soundEffects";
import {
  Users,
  Copy,
  Check,
  Play,
  Bot,
  Crown,
  ShieldCheck,
  Clock,
  Zap,
  ArrowLeft,
} from "lucide-react";

import { useCurrentPlayer } from "@/lib/auth/guest";

export default function RaceRoomPage() {
  const params = useParams();
  const router = useRouter();
  const player = useCurrentPlayer();
  const code = (params.code as string || "").toUpperCase();

  const {
    socket,
    room,
    countdown,
    errorMessage,
    joinRoom,
    toggleReady,
    addBot,
    startCountdown,
    sendProgress,
    finishRace,
    rematch,
    leaveRoom,
  } = useSocket();

  const handleLeaveRoom = () => {
    leaveRoom();
    router.push("/multiplayer");
  };

  const [copiedLink, setCopiedLink] = useState(false);
  const progressThrottleRef = useRef<number>(0);

  const currentUsername = player.username;
  const currentAvatar = player.avatar;
  const currentUserId = player.id;

  // Auto-join room if not yet loaded or code doesn't match
  useEffect(() => {
    if (player.id !== "guest_loading" && (!room || room.code !== code) && code) {
      joinRoom(code, currentUsername, currentAvatar, currentUserId);
    }
  }, [code, room, player.id, currentUsername, currentAvatar, currentUserId, joinRoom]);

  // Handle countdown sound effects
  useEffect(() => {
    if (countdown !== null) {
      if (countdown > 0) {
        playSoundEffect("countdown");
      } else {
        playSoundEffect("go");
      }
    }
  }, [countdown]);

  // Check if current user is the host
  const isYou = (p: SocketPlayer) =>
    (socket?.id && p.socketId === socket.id) || p.userId === currentUserId;

  const currentPlayer = room?.players.find(isYou);
  const isHost: boolean = Boolean(
    currentPlayer?.isHost === true ||
    room?.hostId === currentUserId ||
    (room?.players && room.players.length === 1 && isYou(room.players[0]))
  );

  const passageText = room?.passage?.text || "Synchronized real-time race ready.";

  // Typing engine
  const {
    charStates,
    currentIndex,
    status: engineStatus,
    metrics,
    handleKeyDown,
    reset: resetEngine,
  } = useTypingEngine({
    passageText,
    durationSeconds: room?.durationSeconds || 45,
    isPassageMode: true,
    difficulty: (room?.passage?.difficulty as any) || "MEDIUM",
    mode: "MULTIPLAYER",
    onFinish: (result) => {
      finishRace(result.wpm, result.accuracy, result.duration);
    },
    onTick: (liveMetrics) => {
      // Send progress to socket (throttled)
      const now = Date.now();
      if (now - progressThrottleRef.current > 100) {
        progressThrottleRef.current = now;
        sendProgress(liveMetrics.progress, liveMetrics.wpm, liveMetrics.accuracy);
      }
    },
  });

  // Reset engine when rematch starts
  useEffect(() => {
    if (room?.status === "WAITING") {
      resetEngine();
    }
  }, [room?.status, resetEngine]);

  const handleCopyLink = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (errorMessage) {
    return (
      <div className="flex-1 max-w-lg mx-auto px-4 py-20 text-center space-y-4">
        <div className="p-6 rounded-3xl bg-rose-950/60 border border-rose-500/40 text-rose-300 space-y-4">
          <h3 className="text-xl font-bold text-white">Room Error</h3>
          <p className="text-xs">{errorMessage}</p>
          <button
            onClick={handleLeaveRoom}
            className="px-5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-bold hover:bg-slate-850"
          >
            Back to Multiplayer Hub
          </button>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex-1 max-w-md mx-auto px-4 py-24 text-center space-y-3 font-mono text-xs text-slate-400">
        <div className="w-8 h-8 rounded-full border-2 border-rush-500 border-t-transparent animate-spin mx-auto"></div>
        <p>Connecting to Grand Prix room [{code}]...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Room Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold bg-rush-950 text-rush-400 border border-rush-500/30 px-2.5 py-1 rounded-md">
              {room.code}
            </span>
            <span className="text-xs font-mono font-bold uppercase text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md">
              {room.passage?.difficulty || "MEDIUM"}
            </span>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-1 rounded-md">
              {room.players.length} Racers
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-2 tracking-tight">
            {room.name}
          </h1>
        </div>

        {/* Action Buttons: Leave Room + Share Link */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleLeaveRoom}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Leave Room</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4 text-rush-400" />
                <span className="text-rush-400">Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" />
                <span>Share Invite Link</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Synchronized Countdown Overlay */}
      {countdown !== null && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-fade-in select-none">
          <div className="text-center space-y-4">
            <div className="text-8xl sm:text-9xl font-mono font-black text-rush-400 animate-bounce-subtle drop-shadow-[0_0_40px_rgba(16,185,129,0.8)]">
              {countdown > 0 ? countdown : "GO!"}
            </div>
            <p className="text-sm font-mono text-slate-400 tracking-widest uppercase">
              {countdown > 0 ? "Get your fingers ready..." : "Type with all your might!"}
            </p>
          </div>
        </div>
      )}

      {/* STATE 1: WAITING IN LOBBY */}
      {room.status === "WAITING" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Players Roster */}
          <div className="lg:col-span-2 rounded-3xl bg-slate-950/80 border border-slate-800 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <h3 className="font-extrabold text-white text-base">Connected Racers</h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {room.players.length} / 8 slots
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {room.players.map((p) => {
                const isYou = (socket?.id && p.socketId === socket.id) || p.userId === currentUserId;
                return (
                  <div
                    key={p.socketId}
                    className={`p-4 rounded-2xl border flex items-center justify-between ${
                      isYou
                        ? "bg-slate-900 border-rush-500/40 shadow-[0_0_12px_rgba(16,185,129,0.1)]"
                        : "bg-slate-900/50 border-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <UserAvatar avatar={p.avatar} username={p.username} size="md" />
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-sm text-slate-200">
                          <span>{p.username}</span>
                          {p.isHost && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                          {p.isBot && (
                            <span className="text-[9px] font-mono text-purple-400 bg-purple-950 px-1.5 py-0.5 rounded border border-purple-500/30">
                              BOT
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {isYou ? "You" : p.isHost ? "Host" : "Competitor"}
                        </p>
                      </div>
                    </div>

                    <div>
                      {p.isReady ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rush-400 bg-rush-950/80 px-2 py-1 rounded-lg border border-rush-500/30">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Ready
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                          Waiting...
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lobby Host / Action Controls */}
          <div className="rounded-3xl bg-slate-950/80 border border-slate-800 p-6 sm:p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-extrabold text-white text-base">Race Control</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isHost
                  ? "As host, you can add AI bot racers or launch the synchronized countdown when everyone is ready."
                  : "Mark yourself ready. The race host will start the countdown shortly."}
              </p>

              {isHost && (
                <button
                  onClick={addBot}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  <Bot className="w-4 h-4 text-purple-400" />
                  <span>Add AI Bot Racer</span>
                </button>
              )}
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-800">
              <button
                onClick={toggleReady}
                className={`w-full py-3 rounded-xl font-bold text-xs transition-colors border ${
                  currentPlayer?.isReady
                    ? "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800"
                    : "bg-cyan-500 hover:bg-cyan-400 border-cyan-500 text-slate-950 shadow-md"
                }`}
              >
                {currentPlayer?.isReady ? "Cancel Ready" : "I am Ready!"}
              </button>

              {isHost && (
                <button
                  onClick={startCountdown}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-rush-500 hover:bg-rush-400 text-slate-950 font-black text-sm shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all hover:scale-105 active:scale-95"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Start Grand Prix</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STATE 2: ACTIVE RACE */}
      {room.status === "RACING" && (
        <div className="space-y-6">
          {/* Animated Race Track */}
          <RaceTrack players={room.players} currentUserId={currentUserId} />

          {/* Typing Telemetry Stats */}
          <GameStatsBar metrics={metrics} isPassageMode={true} />

          {/* Focused Typing Area */}
          <TypingArea
            charStates={charStates}
            currentIndex={currentIndex}
            onKeyDown={handleKeyDown}
            status={engineStatus}
          />

          {/* Live Leaderboard Table */}
          <LiveRaceLeaderboard players={room.players} currentUserId={currentUserId} />
        </div>
      )}

      {/* STATE 3: RACE FINISHED / PODIUM */}
      {room.status === "FINISHED" && (
        <PodiumModal
          players={room.players}
          currentUserId={currentUserId}
          isHost={isHost}
          onRematch={rematch}
          onLeave={handleLeaveRoom}
        />
      )}
    </div>
  );
}
