"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { UserAvatar } from "@/components/ui/UserAvatar";
import {
  Swords,
  Plus,
  ArrowRight,
  Trophy,
  Clock,
  Zap,
  Target,
  Sparkles,
  Users,
} from "lucide-react";

export default function ChallengesHubPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [customText, setCustomText] = useState("");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [durationSeconds, setDurationSeconds] = useState(30);
  const [targetWpm, setTargetWpm] = useState(85);
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchChallenges = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/challenges");
      if (res.ok) {
        const data = await res.json();
        setChallenges(data.challenges || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/auth/login");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          customText,
          difficulty,
          durationSeconds,
          targetWpm,
          expiresInDays,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setShowCreateModal(false);
        router.push(`/challenge/${data.challenge.code}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-800/80 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-3">
            <Swords className="w-3.5 h-3.5" />
            <span>Asynchronous Time-Trial Challenges</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Friend Challenges
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            Challenge your friends to beat your typing speed. Everyone types the exact same passage
            with a dedicated leaderboard.
          </p>
        </div>

        <button
          onClick={() => {
            if (!user) {
              router.push("/auth/login");
            } else {
              setShowCreateModal(true);
            }
          }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Create Challenge</span>
        </button>
      </div>

      {/* Challenges Grid */}
      {isLoading ? (
        <div className="py-20 text-center font-mono text-xs text-slate-500">
          Loading challenges...
        </div>
      ) : challenges.length === 0 ? (
        <div className="py-20 text-center text-slate-500 space-y-3 font-mono text-xs">
          <p>No active challenges right now.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-xl bg-slate-900 text-amber-400 border border-slate-800 font-sans font-bold"
          >
            Create the first challenge!
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((c) => (
            <div
              key={c.id}
              className="rounded-3xl bg-slate-950/80 border border-slate-800 p-6 flex flex-col justify-between space-y-6 hover:border-slate-700 transition-all shadow-xl group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/80 border border-amber-500/30 px-2.5 py-1 rounded-md">
                    {c.code}
                  </span>
                  <span className="text-[10px] font-mono uppercase text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {c.difficulty}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                    {c.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <UserAvatar avatar={c.creatorAvatar} username={c.creator} size="sm" showRing={false} />
                    <span className="text-xs text-slate-400">Created by {c.creator}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-900 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block uppercase">Target Speed</span>
                    <span className="text-sm font-bold text-rush-400">{c.targetWpm} WPM</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block uppercase">Challengers</span>
                    <span className="text-sm font-bold text-cyan-400">{c.participantsCount} typed</span>
                  </div>
                </div>
              </div>

              <Link
                href={`/challenge/${c.code}`}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 font-bold text-xs transition-colors border border-amber-500/30 hover:border-amber-500"
              >
                <span>Accept Challenge</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Create Challenge Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-white">Create Friend Challenge</h3>
              <p className="text-xs text-slate-400">
                Craft a custom challenge passage and set target benchmark speed for your friends.
              </p>
            </div>

            <form onSubmit={handleCreateChallenge} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Challenge Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Can you beat my 104 WPM record?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Custom Passage Text (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Leave empty to use a curated passage from our library."
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 resize-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Target WPM Benchmark
                  </label>
                  <input
                    type="number"
                    min={30}
                    max={200}
                    value={targetWpm}
                    onChange={(e) => setTargetWpm(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Difficulty Tier
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                    <option value="EXPERT">EXPERT</option>
                  </select>
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
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md"
                >
                  {isSubmitting ? "Generating Link..." : "Create & Get Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
