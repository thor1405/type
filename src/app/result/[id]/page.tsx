"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { UserAvatar } from "@/components/ui/UserAvatar";
import {
  Zap,
  Target,
  Clock,
  Share2,
  Check,
  Trophy,
  ArrowRight,
  ShieldCheck,
  Keyboard,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function ShareableResultPage() {
  const params = useParams();
  const id = params.id as string;

  const [result, setResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchResult() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/results/${id}`);
        if (res.ok) {
          const data = await res.json();
          setResult(data.result);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    if (id) fetchResult();
  }, [id]);

  const handleShare = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex-1 max-w-md mx-auto px-4 py-24 text-center font-mono text-xs text-slate-400">
        Loading verified certificate [{id}]...
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex-1 max-w-lg mx-auto px-4 py-20 text-center space-y-4">
        <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
          <h3 className="text-xl font-bold text-white">Result Not Found</h3>
          <p className="text-xs text-slate-400">
            This test certificate does not exist or has expired.
          </p>
          <Link
            href="/practice"
            className="inline-block mt-2 px-5 py-2 rounded-xl bg-rush-500 text-slate-950 font-bold text-xs"
          >
            Take a Test on TypeRush
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-8">
      {/* Verified Certificate Card */}
      <div className="rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 border border-slate-800 p-6 sm:p-12 shadow-2xl space-y-8 relative overflow-hidden backdrop-blur-xl">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-rush-500/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>

        {/* Certificate Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rush-950/80 border border-rush-500/30 text-rush-400 font-mono text-xs font-bold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>TypeRush Verified Result</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Speed Performance Certificate
            </h1>
          </div>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-rush-400" />
                <span className="text-rush-400">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-slate-400" />
                <span>Share Certificate</span>
              </>
            )}
          </button>
        </div>

        {/* Typist Profile Row */}
        <div className="flex items-center gap-4">
          <UserAvatar avatar={result.avatar} username={result.username} size="lg" />
          <div>
            <h2 className="text-xl font-extrabold text-white">{result.username}</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Completed on {new Date(result.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </div>

        {/* Big Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Speed</span>
            <div className="text-4xl font-mono font-black text-rush-400 mt-1">
              {result.wpm} <span className="text-xs text-slate-500">WPM</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Accuracy</span>
            <div className="text-4xl font-mono font-black text-cyan-400 mt-1">
              {result.accuracy}%
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Duration</span>
            <div className="text-2xl font-mono font-bold text-slate-200 mt-2">
              {result.duration}s
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Errors</span>
            <div className="text-2xl font-mono font-bold text-rose-400 mt-2">
              {result.errors}
            </div>
          </div>
        </div>

        {/* Passage Snippet */}
        {result.passageText && (
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
              Passage // {result.passageTitle}
            </span>
            <p className="text-xs text-slate-300 italic leading-relaxed font-mono">
              &ldquo;{result.passageText}&rdquo;
            </p>
          </div>
        )}

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-800/80">
          <Link
            href="/practice"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-rush-500 hover:bg-rush-400 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:scale-105"
          >
            <Keyboard className="w-4 h-4" />
            <span>Test Your Speed on TypeRush</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/challenges"
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-xs transition-colors"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Challenge This Score</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
