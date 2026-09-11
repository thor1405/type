"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { useTypingEngine } from "@/lib/typing-engine/useTypingEngine";
import { TypingArea } from "@/components/typing/TypingArea";
import { GameStatsBar } from "@/components/typing/GameStatsBar";
import { UserAvatar } from "@/components/ui/UserAvatar";
import {
  Swords,
  Trophy,
  Share2,
  Check,
  RotateCcw,
  Zap,
  Target,
  Clock,
  Flame,
  Award,
  ArrowRight,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function ChallengePage() {
  const params = useParams();
  const { user } = useAuth();
  const code = (params.code as string || "").toUpperCase();

  const [challenge, setChallenge] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchChallenge = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/challenges/${code}`);
      if (res.ok) {
        const data = await res.json();
        setChallenge(data.challenge);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (code) {
      fetchChallenge();
    }
  }, [code]);

  // Handle challenge test submission
  const handleFinish = async (result: any) => {
    setIsFinished(true);

    try {
      const res = await fetch(`/api/challenges/${code}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wpm: result.wpm,
          rawCpm: result.rawCpm,
          accuracy: result.accuracy,
          durationSeconds: result.duration,
          errors: result.errors,
          guestUsername: user?.username || "Challenger",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setUserRank(data.rank);
        // Refresh leaderboard
        fetchChallenge();

        if (data.rank === 1 || result.wpm >= (challenge?.targetWpm || 80)) {
          confetti({
            particleCount: 90,
            spread: 75,
            origin: { y: 0.6 },
            colors: ["#f59e0b", "#10b981", "#06b6d4"],
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const {
    charStates,
    currentIndex,
    status: engineStatus,
    metrics,
    handleKeyDown,
    reset: resetEngine,
  } = useTypingEngine({
    passageText: challenge?.passageText || "Friend challenge ready.",
    durationSeconds: challenge?.durationSeconds || 30,
    isPassageMode: true,
    difficulty: challenge?.difficulty || "MEDIUM",
    mode: "CHALLENGE",
    onFinish: handleFinish,
  });

  const handleShare = async () => {
    const shareText = `${challenge?.creator} challenged you to a typing race on TypeRush! Target: ${challenge?.targetWpm} WPM.`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: challenge?.title || "TypeRush Challenge",
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch {}
    }

    await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleRestart = () => {
    setIsFinished(false);
    setUserRank(null);
    resetEngine();
    setHasStarted(true);
  };

  if (isLoading) {
    return (
      <div className="flex-1 max-w-md mx-auto px-4 py-24 text-center font-mono text-xs text-slate-400">
        Loading challenge [{code}]...
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="flex-1 max-w-lg mx-auto px-4 py-20 text-center space-y-4">
        <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
          <h3 className="text-xl font-bold text-white">Challenge Not Found</h3>
          <p className="text-xs text-slate-400">
            This challenge may have expired or the link is invalid.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      {/* Challenge Invitation Card */}
      <div className="rounded-3xl bg-slate-950/80 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <UserAvatar avatar={challenge.creatorAvatar} username={challenge.creator} size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/80 border border-amber-500/30 px-2 py-0.5 rounded">
                  {challenge.code}
                </span>
                <span className="text-[10px] font-mono text-slate-400 uppercase bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {challenge.difficulty}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
                {challenge.title}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                <span className="font-bold text-slate-200">{challenge.creator}</span> challenged you to a typing race!
              </p>
            </div>
          </div>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-xs transition-colors"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-rush-400" />
                <span className="text-rush-400">Copied Link!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Share Challenge</span>
              </>
            )}
          </button>
        </div>

        {/* Target Benchmark & Stats Pill */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase">Target Speed</span>
            <span className="text-base font-extrabold text-rush-400">{challenge.targetWpm} WPM</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase">Challengers</span>
            <span className="text-base font-extrabold text-cyan-400">
              {challenge.attempts.length} attempts
            </span>
          </div>
          <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase">Status</span>
            <span className="text-base font-extrabold text-amber-400">
              {challenge.isExpired ? "Expired" : "Active"}
            </span>
          </div>
        </div>

        {/* CTA to start challenge if not started yet */}
        {!hasStarted && (
          <div className="text-center pt-2">
            <button
              onClick={() => setHasStarted(true)}
              className="px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all hover:scale-105"
            >
              Start Challenge Now
            </button>
          </div>
        )}
      </div>

      {/* Live Typing Arena when started */}
      {hasStarted && (
        <div className="space-y-6">
          <GameStatsBar metrics={metrics} isPassageMode={true} />

          <TypingArea
            charStates={charStates}
            currentIndex={currentIndex}
            onKeyDown={handleKeyDown}
            status={engineStatus}
          />

          {isFinished && (
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl space-y-4 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rush-950/80 text-rush-400 border border-rush-500/30 font-mono text-xs font-bold">
                <Check className="w-3.5 h-3.5" />
                Challenge Attempt Recorded
              </div>
              <div className="text-3xl font-black text-white font-mono">
                {metrics.wpm} WPM <span className="text-slate-500 text-lg">({metrics.accuracy}%)</span>
              </div>
              {userRank && (
                <p className="text-xs text-amber-400 font-bold">
                  You placed #{userRank} on this challenge leaderboard!
                </p>
              )}
              <div>
                <button
                  onClick={handleRestart}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dedicated Challenge Leaderboard */}
      <div className="rounded-3xl bg-slate-950/80 border border-slate-800 p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">
              Challenge Standings
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {challenge.attempts.length} Participants
          </span>
        </div>

        <div className="divide-y divide-slate-900/80 font-mono text-xs">
          {challenge.attempts.length === 0 ? (
            <div className="py-6 text-center text-slate-500">
              No attempts yet. Be the first to set the record!
            </div>
          ) : (
            challenge.attempts.map((att: any) => (
              <div key={att.id} className="py-3 px-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 font-bold text-slate-500">#{att.rank}</span>
                  <UserAvatar avatar={att.avatar} username={att.username} size="sm" showRing={false} />
                  <span className="font-sans font-semibold text-slate-200">{att.username}</span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-bold text-rush-400">{att.wpm} WPM</span>
                  <span className="text-cyan-400">{att.accuracy}%</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
