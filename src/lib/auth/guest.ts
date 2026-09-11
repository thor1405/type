"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./context";

export interface CurrentPlayerIdentity {
  id: string;
  username: string;
  avatar: string;
  isGuest: boolean;
}

export function getGuestUser(): { id: string; username: string; avatar: string } {
  if (typeof window === "undefined") {
    return { id: "guest_init", username: "Racer", avatar: "neon-cyan" };
  }

  let guestId = localStorage.getItem("typerush_guest_id");
  let guestName = localStorage.getItem("typerush_guest_name");
  let guestAvatar = localStorage.getItem("typerush_guest_avatar");

  if (!guestId) {
    guestId = "guest_" + Math.random().toString(36).substring(2, 9);
    localStorage.setItem("typerush_guest_id", guestId);
  }

  if (!guestName) {
    guestName = "Racer_" + Math.floor(100 + Math.random() * 900);
    localStorage.setItem("typerush_guest_name", guestName);
  }

  if (!guestAvatar) {
    const avatars = ["neon-cyan", "emerald-glow", "amber-flame", "purple-cyber", "crimson-rush"];
    guestAvatar = avatars[Math.floor(Math.random() * avatars.length)];
    localStorage.setItem("typerush_guest_avatar", guestAvatar);
  }

  return { id: guestId, username: guestName, avatar: guestAvatar };
}

export function useCurrentPlayer(): CurrentPlayerIdentity {
  const { user } = useAuth();
  const [guest, setGuest] = useState<{ id: string; username: string; avatar: string }>({
    id: "guest_loading",
    username: "Racer",
    avatar: "neon-cyan",
  });

  useEffect(() => {
    setGuest(getGuestUser());
  }, []);

  if (user) {
    return {
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      isGuest: false,
    };
  }

  return {
    id: guest.id,
    username: guest.username,
    avatar: guest.avatar,
    isGuest: true,
  };
}
