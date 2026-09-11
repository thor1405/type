"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/context";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { AchievementCard } from "@/components/achievements/AchievementCard";
import {
  User as UserIcon,
  Calendar,
  Zap,
  Target,
  Trophy,
  Flame,
  Award,
  Sparkles,
  Edit2,
  Check,
} from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const username = user?.username || "TypeMaster";

  const [profileData, setProfileData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [keyboard, setKeyboard] = useState("");
  const [avatar, setAvatar] = useState("");

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/users/${username}`);
      if (res.ok) {
        const data = await res.json();
        setProfileData(data);
        setBio(data.profile?.bio || "");
        setKeyboard(data.profile?.keyboard || "");
        setAvatar(data.user?.avatar || "neon-cyan");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const handleSaveProfile = async () => {
    try {
      const res = await fetch(`/api/users/${username}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio, keyboard, avatar }),
      });
      if (res.ok) {
        setIsEditing(false);
        fetchProfile();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 max-w-md mx-auto px-4 py-24 text-center font-mono text-xs text-slate-400">
        Loading profile...
      </div>
    );
  }

  const stats = profileData?.stats || {
    avgWpm: 0,
    bestWpm: 0,
    avgAccuracy: 0,
    totalTests: 0,
    currentStreak: 0,
    bestStreak: 0,
  };

  const achievements = profileData?.achievements || [];
  const unlockedCount = achievements.filter((a: any) => a.isUnlocked).length;

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      {/* Profile Card Header */}
      <div className="rounded-3xl bg-slate-950/80 border border-slate-800 p-6 sm:p-10 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-slate-800/80 pb-8">
          <div className="flex items-center gap-5">
            <UserAvatar avatar={profileData?.user?.avatar || avatar} username={username} size="xl" />
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">{username}</h1>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Joined {new Date(profileData?.user?.createdAt || Date.now()).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
              </p>
              <p className="text-xs text-slate-300 mt-2 italic max-w-md">
                &ldquo;{profileData?.profile?.bio || "Passionate typist chasing speed records."}&rdquo;
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-400" />
            <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
          </button>
        </div>

        {/* Edit Profile Form */}
        {isEditing && (
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 animate-fade-in">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Edit Profile Settings
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Bio / Quote
                </label>
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-rush-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Keyboard Setup
                </label>
                <input
                  type="text"
                  value={keyboard}
                  onChange={(e) => setKeyboard(e.target.value)}
                  placeholder="e.g. Custom Keychron Q1 (Gateron Oil Kings)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-rush-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-400 block mb-2">
                  Avatar Theme
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "neon-cyan",
                    "emerald-glow",
                    "amber-flame",
                    "purple-cyber",
                    "crimson-rush",
                  ].map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setAvatar(av)}
                      className={`p-1 rounded-xl border transition-all ${
                        avatar === av ? "ring-2 ring-rush-400 border-rush-500" : "border-slate-800 opacity-60"
                      }`}
                    >
                      <UserAvatar avatar={av} username={username} size="sm" showRing={false} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveProfile}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-rush-500 hover:bg-rush-400 text-slate-950 font-bold text-xs shadow-md"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        )}

        {/* Lifetime Stats Quick Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Peak Record</span>
            <span className="text-2xl font-black text-amber-400">{stats.bestWpm} WPM</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Average Speed</span>
            <span className="text-2xl font-black text-rush-400">{stats.avgWpm} WPM</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Average Accuracy</span>
            <span className="text-2xl font-black text-cyan-400">{stats.avgAccuracy}%</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Tests Logged</span>
            <span className="text-2xl font-black text-purple-400">{stats.totalTests}</span>
          </div>
        </div>
      </div>

      {/* Badges & Achievements Section */}
      <div className="rounded-3xl bg-slate-950/80 border border-slate-800 p-6 sm:p-10 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Achievements & Badges</h2>
          </div>
          <span className="text-xs font-mono font-bold text-rush-400 bg-rush-950/80 border border-rush-500/30 px-3 py-1 rounded-full">
            {unlockedCount} / {achievements.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((ach: any) => (
            <AchievementCard key={ach.id} achievement={ach} />
          ))}
        </div>
      </div>
    </div>
  );
}
