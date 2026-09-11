"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { Zap, Lock, Mail, User, ArrowRight } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const success = await signup(username, email, password || "password123");
    setIsLoading(false);

    if (success) {
      router.push("/dashboard");
    } else {
      setError("Failed to create account. That username or email may already be taken.");
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 py-12">
      <div className="w-full max-w-md rounded-3xl bg-slate-950/90 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-rush-500 flex items-center justify-center text-slate-950 font-black mx-auto shadow-[0_0_20px_rgba(16,185,129,0.4)]">
            <Zap className="w-6 h-6 fill-slate-950" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Create TypeRush Account</h1>
          <p className="text-xs text-slate-400">
            Join the competitive community and start tracking your evolution.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Username</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="ApexTypist"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-rush-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-rush-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-rush-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-rush-500 hover:bg-rush-400 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2"
          >
            <span>{isLoading ? "Creating Account..." : "Create Free Account"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Login link */}
        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-900">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-rush-400 font-bold hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
