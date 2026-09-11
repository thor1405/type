"use client";

import React from "react";
import {
  Sparkles,
  Zap,
  Flame,
  Trophy,
  Rocket,
  Target,
  Award,
  Shield,
  Crown,
  Medal,
  Lock,
  CheckCircle,
} from "lucide-react";

interface AchievementCardProps {
  achievement: {
    id: string;
    code: string;
    title: string;
    description: string;
    icon: string;
    tier: string;
    xpReward: number;
    isUnlocked?: boolean;
    unlockedAt?: string | null;
  };
}

const ICON_MAP: Record<string, any> = {
  Sparkles,
  Zap,
  Flame,
  Trophy,
  Rocket,
  Target,
  Award,
  Shield,
  Crown,
  Medal,
};

const TIER_STYLES: Record<string, { border: string; bg: string; badge: string; text: string }> = {
  BRONZE: {
    border: "border-amber-800/40",
    bg: "bg-amber-950/20",
    badge: "bg-amber-900/40 text-amber-500 border-amber-800/50",
    text: "text-amber-500",
  },
  SILVER: {
    border: "border-slate-500/40",
    bg: "bg-slate-800/30",
    badge: "bg-slate-700/40 text-slate-300 border-slate-600/50",
    text: "text-slate-300",
  },
  GOLD: {
    border: "border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]",
    bg: "bg-amber-950/30",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    text: "text-amber-300",
  },
  PLATINUM: {
    border: "border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]",
    bg: "bg-cyan-950/30",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    text: "text-cyan-300",
  },
  DIAMOND: {
    border: "border-purple-500/60 shadow-[0_0_20px_rgba(139,92,246,0.25)]",
    bg: "bg-purple-950/30",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/50",
    text: "text-purple-300",
  },
};

export function AchievementCard({ achievement }: AchievementCardProps) {
  const isUnlocked = achievement.isUnlocked ?? true;
  const Icon = ICON_MAP[achievement.icon] || Trophy;
  const tierConfig = TIER_STYLES[achievement.tier] || TIER_STYLES.BRONZE;

  return (
    <div
      className={`relative rounded-2xl p-4 sm:p-5 border transition-all duration-200 flex flex-col justify-between ${
        isUnlocked
          ? `${tierConfig.bg} ${tierConfig.border}`
          : "bg-slate-900/20 border-slate-800/50 opacity-50 grayscale"
      }`}
    >
      <div>
        {/* Header with Icon & Tier */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              isUnlocked
                ? `${tierConfig.badge}`
                : "bg-slate-800 text-slate-500 border-slate-700"
            }`}
          >
            {isUnlocked ? (
              <Icon className="w-5 h-5" />
            ) : (
              <Lock className="w-4 h-4 text-slate-500" />
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${tierConfig.badge}`}
            >
              {achievement.tier}
            </span>
            <span className="text-[10px] font-mono text-rush-400 font-bold bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
              +{achievement.xpReward} XP
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <h4
          className={`font-bold text-sm tracking-tight ${
            isUnlocked ? "text-slate-100" : "text-slate-400"
          }`}
        >
          {achievement.title}
        </h4>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          {achievement.description}
        </p>
      </div>

      {/* Footer / Status */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
        {isUnlocked ? (
          <span className="flex items-center gap-1 text-rush-400 font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            Unlocked
          </span>
        ) : (
          <span className="flex items-center gap-1 text-slate-500">
            <Lock className="w-3.5 h-3.5" />
            Locked
          </span>
        )}

        {isUnlocked && achievement.unlockedAt && (
          <span className="font-mono text-[10px]">
            {new Date(achievement.unlockedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        )}
      </div>
    </div>
  );
}
