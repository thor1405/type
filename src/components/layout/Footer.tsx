"use client";

import React from "react";
import Link from "next/link";
import { Zap, Heart, Terminal, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-900 bg-slate-950/60 py-10 mt-auto text-slate-500 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-lg bg-rush-500 flex items-center justify-center text-slate-950 font-black">
            <Zap className="w-3.5 h-3.5 fill-slate-950" />
          </div>
          <span className="font-bold text-slate-300 tracking-tight">TypeRush</span>
          <span className="text-slate-600">|</span>
          <span>Next-Gen Competitive Typing Platform</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800">
            <Terminal className="w-3.5 h-3.5 text-rush-400" />
            <span>Tab + Enter</span>
            <span className="text-slate-600">to quick restart</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <Link href="/practice" className="hover:text-rush-400 transition-colors">
              Solo
            </Link>
            <Link href="/multiplayer" className="hover:text-rush-400 transition-colors">
              Multiplayer
            </Link>
            <Link href="/challenges" className="hover:text-rush-400 transition-colors">
              Challenges
            </Link>
            <Link href="/leaderboard" className="hover:text-rush-400 transition-colors">
              Leaderboard
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
