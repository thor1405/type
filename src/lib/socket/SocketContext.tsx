"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
export interface SocketPlayer {
  socketId: string;
  userId: string;
  username: string;
  avatar: string;
  isHost: boolean;
  isReady: boolean;
  progress: number;
  wpm: number;
  accuracy: number;
  finished: boolean;
  finishRank?: number;
  finishTimeMs?: number;
  isBot?: boolean;
}

export interface SocketRoom {
  id: string;
  code: string;
  name: string;
  hostId: string;
  passage: {
    id?: string;
    title: string;
    text: string;
    difficulty: string;
  };
  durationSeconds: number;
  status: "WAITING" | "COUNTDOWN" | "RACING" | "FINISHED";
  players: SocketPlayer[];
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  room: SocketRoom | null;
  publicRooms: any[];
  countdown: number | null;
  errorMessage: string | null;
  createRoom: (name: string, username: string, avatar: string, userId: string, difficulty?: string) => void;
  joinRoom: (code: string, username: string, avatar: string, userId: string) => void;
  toggleReady: () => void;
  addBot: () => void;
  startCountdown: () => void;
  sendProgress: (progress: number, wpm: number, accuracy: number) => void;
  finishRace: (finalWpm: number, accuracy: number, duration: number) => void;
  rematch: () => void;
  leaveRoom: () => void;
  refreshPublicRooms: () => void;
  setErrorMessage: (msg: string | null) => void;
  clearRoom: () => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

let globalSocket: Socket | null = null;

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [room, setRoom] = useState<SocketRoom | null>(null);
  const [publicRooms, setPublicRooms] = useState<any[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!globalSocket) {
      globalSocket = io({
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });
    }

    const socket = globalSocket;
    socketRef.current = socket;

    if (socket.connected) {
      setIsConnected(true);
      socket.emit("room:get_public");
    }

    const handleConnect = () => {
      setIsConnected(true);
      socket.emit("room:get_public");
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handlePublicList = (list: any[]) => {
      setPublicRooms(list);
    };

    const handleRoomCreated = ({ room }: { room: SocketRoom }) => {
      setRoom(room);
      setErrorMessage(null);
    };

    const handleRoomUpdated = ({ room }: { room: SocketRoom }) => {
      setRoom(room);
      setErrorMessage(null);
    };

    const handleCountdownStart = ({ count }: { count: number }) => {
      setCountdown(count);
    };

    const handleCountdownTick = ({ count }: { count: number }) => {
      setCountdown(count);
    };

    const handleRaceStart = () => {
      setCountdown(null);
      setRoom((prev) => (prev ? { ...prev, status: "RACING" } : null));
    };

    const handleProgressUpdate = ({
      socketId,
      progress,
      wpm,
      accuracy,
    }: {
      socketId: string;
      progress: number;
      wpm: number;
      accuracy: number;
    }) => {
      setRoom((prev) => {
        if (!prev) return null;
        const updatedPlayers = prev.players.map((p) =>
          p.socketId === socketId ? { ...p, progress, wpm, accuracy } : p
        );
        return { ...prev, players: updatedPlayers };
      });
    };

    const handlePlayerFinished = ({
      socketId,
      player,
    }: {
      socketId: string;
      player: SocketPlayer;
    }) => {
      setRoom((prev) => {
        if (!prev) return null;
        const updatedPlayers = prev.players.map((p) =>
          p.socketId === socketId ? { ...player } : p
        );
        return { ...prev, players: updatedPlayers };
      });
    };

    const handleAllFinished = ({ room }: { room: SocketRoom }) => {
      setRoom(room);
    };

    const handleRoomError = ({ message }: { message: string }) => {
      setErrorMessage(message);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("room:public_list", handlePublicList);
    socket.on("room:created", handleRoomCreated);
    socket.on("room:updated", handleRoomUpdated);
    socket.on("room:countdown_start", handleCountdownStart);
    socket.on("room:countdown_tick", handleCountdownTick);
    socket.on("room:race_start", handleRaceStart);
    socket.on("race:progress_update", handleProgressUpdate);
    socket.on("race:player_finished", handlePlayerFinished);
    socket.on("race:all_finished", handleAllFinished);
    socket.on("room:error", handleRoomError);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("room:public_list", handlePublicList);
      socket.off("room:created", handleRoomCreated);
      socket.off("room:updated", handleRoomUpdated);
      socket.off("room:countdown_start", handleCountdownStart);
      socket.off("room:countdown_tick", handleCountdownTick);
      socket.off("room:race_start", handleRaceStart);
      socket.off("race:progress_update", handleProgressUpdate);
      socket.off("race:player_finished", handlePlayerFinished);
      socket.off("race:all_finished", handleAllFinished);
      socket.off("room:error", handleRoomError);
    };
  }, []);

  const createRoom = useCallback(
    (name: string, username: string, avatar: string, userId: string, difficulty?: string) => {
      socketRef.current?.emit("room:create", { name, username, avatar, userId, difficulty });
    },
    []
  );

  const joinRoom = useCallback(
    (code: string, username: string, avatar: string, userId: string) => {
      socketRef.current?.emit("room:join", { code, username, avatar, userId });
    },
    []
  );

  const toggleReady = useCallback(() => {
    socketRef.current?.emit("room:toggle_ready");
  }, []);

  const addBot = useCallback(() => {
    socketRef.current?.emit("room:add_bot");
  }, []);

  const startCountdown = useCallback(() => {
    socketRef.current?.emit("room:start_countdown");
  }, []);

  const sendProgress = useCallback((progress: number, wpm: number, accuracy: number) => {
    socketRef.current?.emit("race:progress", { progress, wpm, accuracy });
  }, []);

  const finishRace = useCallback((finalWpm: number, accuracy: number, duration: number) => {
    socketRef.current?.emit("race:finish", { finalWpm, accuracy, duration });
  }, []);

  const rematch = useCallback(() => {
    socketRef.current?.emit("room:rematch");
  }, []);

  const leaveRoom = useCallback(() => {
    socketRef.current?.emit("room:leave");
    setRoom(null);
    setCountdown(null);
    setErrorMessage(null);
  }, []);

  const refreshPublicRooms = useCallback(() => {
    socketRef.current?.emit("room:get_public");
  }, []);

  const clearRoom = useCallback(() => {
    setRoom(null);
    setErrorMessage(null);
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        room,
        publicRooms,
        countdown,
        errorMessage,
        createRoom,
        joinRoom,
        toggleReady,
        addBot,
        startCountdown,
        sendProgress,
        finishRace,
        rematch,
        leaveRoom,
        refreshPublicRooms,
        setErrorMessage,
        clearRoom,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}
