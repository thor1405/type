"use client";

import React from "react";
import { User, Zap, Flame, Shield, Sparkles, Bot } from "lucide-react";

interface UserAvatarProps {
  avatar?: string;
  username?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showRing?: boolean;
}

const AVATAR_COLORS: Record<string, { bg: string; ring: string; icon: any }> = {
  "neon-cyan": {
    bg: "bg-cyan-950/80 border-cyan-500/40 text-cyan-400",
    ring: "ring-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.4)]",
    icon: Zap,
  },
  "emerald-glow": {
    bg: "bg-emerald-950/80 border-emerald-500/40 text-emerald-400",
    ring: "ring-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.4)]",
    icon: Sparkles,
  },
  "amber-flame": {
    bg: "bg-amber-950/80 border-amber-500/40 text-amber-400",
    ring: "ring-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.4)]",
    icon: Flame,
  },
  "purple-cyber": {
    bg: "bg-purple-950/80 border-purple-500/40 text-purple-400",
    ring: "ring-purple-500/50 shadow-[0_0_12px_rgba(139,92,246,0.4)]",
    icon: Shield,
  },
  "crimson-rush": {
    bg: "bg-rose-950/80 border-rose-500/40 text-rose-400",
    ring: "ring-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.4)]",
    icon: Zap,
  },
  bot: {
    bg: "bg-indigo-950/80 border-indigo-500/40 text-indigo-400",
    ring: "ring-indigo-500/50 shadow-[0_0_12px_rgba(99,102,241,0.4)]",
    icon: Bot,
  },
  default: {
    bg: "bg-slate-800 border-slate-700 text-slate-300",
    ring: "ring-slate-600",
    icon: User,
  },
};

export function UserAvatar({
  avatar = "default",
  username = "User",
  size = "md",
  showRing = true,
}: UserAvatarProps) {
  const config = AVATAR_COLORS[avatar] || AVATAR_COLORS.default;
  const Icon = config.icon;

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-base",
    xl: "w-20 h-20 text-xl",
  };

  const initial = username ? username.charAt(0).toUpperCase() : "U";

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-xl font-bold border transition-transform duration-200 ${
        config.bg
      } ${sizeClasses[size]} ${showRing ? config.ring : ""}`}
    >
      <span className="font-mono">{initial}</span>
    </div>
  );
}
