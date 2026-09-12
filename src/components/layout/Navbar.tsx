"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Zap,
  Keyboard,
  Users,
  Trophy,
  Swords,
  Volume2,
  VolumeX,
  User as UserIcon,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { UserAvatar } from "../ui/UserAvatar";
import {
  getIsMuted,
  getSoundTheme,
  setSoundTheme,
  SoundTheme,
  toggleMute,
} from "@/lib/sound/soundEffects";

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [soundTheme, setLocalSoundTheme] = useState<SoundTheme>("mechanical");
  const [isMuted, setIsMuted] = useState(false);
  const [showSoundMenu, setShowSoundMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    setLocalSoundTheme(getSoundTheme());
    setIsMuted(getIsMuted());
  }, []);

  const handleToggleMute = () => {
    const muted = toggleMute();
    setIsMuted(muted);
  };

  const handleThemeChange = (theme: SoundTheme) => {
    setSoundTheme(theme);
    setLocalSoundTheme(theme);
    setShowSoundMenu(false);
  };

  const navLinks = [
    { href: "/practice", label: "Solo Practice", icon: Keyboard },
    { href: "/multiplayer", label: "Multiplayer", icon: Users },
    { href: "/challenges", label: "Challenges", icon: Swords },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-rush-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)] group-hover:scale-105 transition-transform duration-200">
            <Zap className="w-5 h-5 fill-slate-950 text-slate-950" />
          </div>
          <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-rush-400 bg-clip-text text-transparent">
            TypeRush
          </span>
        </Link>

        {/* Desktop Nav Items */}
        <nav className="hidden md:flex items-center gap-1.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-slate-800 text-rush-400 shadow-sm border border-slate-700/60"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-rush-400" : "text-slate-500"}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Sound Controls */}
          <div className="relative">
            <button
              onClick={() => setShowSoundMenu(!showSoundMenu)}
              className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors text-xs font-medium"
              title="Sound FX Settings"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-rush-400" />
              )}
              <span className="hidden sm:inline capitalize font-mono text-[11px] text-slate-300">
                {isMuted ? "Muted" : soundTheme}
              </span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {showSoundMenu && (
              <div className="absolute right-0 mt-2 w-44 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-1.5 z-50">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
                  Sound Profile
                </div>
                {(["mechanical", "typewriter", "bubble"] as SoundTheme[]).map((theme) => (
                  <button
                    key={theme}
                    onClick={() => handleThemeChange(theme)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium capitalize flex items-center justify-between transition-colors ${
                      soundTheme === theme && !isMuted
                        ? "bg-rush-500/10 text-rush-400"
                        : "text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <span>{theme}</span>
                    {soundTheme === theme && !isMuted && <span className="w-1.5 h-1.5 rounded-full bg-rush-400"></span>}
                  </button>
                ))}
                <div className="border-t border-slate-800 my-1"></div>
                <button
                  onClick={handleToggleMute}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 flex items-center justify-between"
                >
                  <span>{isMuted ? "Unmute Sounds" : "Mute Sounds"}</span>
                  {isMuted && <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>}
                </button>
              </div>
            )}
          </div>

          {/* User Profile / Quick Switcher */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <UserAvatar avatar={user.avatar} username={user.username} size="sm" showRing={false} />
                <span className="font-semibold text-xs text-slate-200 max-w-[90px] truncate">
                  {user.username}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50">
                  <div className="px-2 py-1.5 border-b border-slate-800 mb-1">
                    <p className="text-xs font-semibold text-slate-200">{user.username}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                    My Profile & Badges
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-slate-400" />
                    Analytics Dashboard
                  </Link>

                  <div className="border-t border-slate-800 my-1"></div>
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-950/40"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/auth/signup"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-rush-500 hover:bg-rush-400 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
