const http = require("http");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// In-memory room manager for real-time multiplayer
const rooms = new Map();

const DEFAULT_PASSAGES = [
  {
    id: "p1",
    title: "The Speed of Innovation",
    text: "Technology moves at the speed of thought, transforming the boundaries of human potential and shaping the future of global connectivity.",
    difficulty: "MEDIUM",
  },
  {
    id: "p2",
    title: "Whispers of the Cosmos",
    text: "Stars are the ancient beacons of the universe, casting light across trillions of kilometers to remind us how vast and mysterious our reality truly is.",
    difficulty: "MEDIUM",
  },
  {
    id: "p3",
    title: "Cyber Racing Circuit",
    text: "Adrenaline surges through your fingertips as keystrokes echo like lightning across the mechanical switches in the digital arena.",
    difficulty: "HARD",
  },
  {
    id: "p4",
    title: "Code of Creation",
    text: "Programs must be written for people to read, and only incidentally for machines to execute. Elegance is not optional; it is fundamental.",
    difficulty: "EASY",
  }
];

function getPublicRooms() {
  const list = [];
  rooms.forEach((room) => {
    if (room.status === "WAITING" || room.status === "COUNTDOWN") {
      list.push({
        id: room.id,
        code: room.code,
        name: room.name,
        difficulty: room.passage.difficulty,
        playerCount: Object.keys(room.players).length,
        status: room.status,
      });
    }
  });
  return list;
}

function sanitizeRoom(room) {
  return {
    id: room.id,
    code: room.code,
    name: room.name,
    hostId: room.hostId,
    passage: room.passage,
    durationSeconds: room.durationSeconds,
    status: room.status,
    players: Object.values(room.players),
  };
}

const BOT_PROFILES = {
  EASY: {
    names: ["TurtleBot", "NovicePacer", "SteadyPaws", "ChillTyper", "BreezeAI"],
    minWpm: 32,
    maxWpm: 46,
    avgAcc: 94,
  },
  MEDIUM: {
    names: ["TurboBot", "SwiftKey_Bot", "VelocityAI", "RhythmBot", "SprintPacer"],
    minWpm: 58,
    maxWpm: 76,
    avgAcc: 97,
  },
  HARD: {
    names: ["ApexRacer", "CyberDash", "ThunderKey", "HyperBot", "ByteSpeed"],
    minWpm: 88,
    maxWpm: 108,
    avgAcc: 98.5,
  },
  EXPERT: {
    names: ["QuantumGod", "NeuralTitan", "SupersonicX", "OmniStrike", "MachSpeed"],
    minWpm: 120,
    maxWpm: 145,
    avgAcc: 99.5,
  },
};

function startBotsSimulation(room, io) {
  const bots = Object.values(room.players).filter((p) => p.isBot);
  if (bots.length === 0) return;

  room.botIntervals = [];

  bots.forEach((bot) => {
    const diff = (bot.botDifficulty || "MEDIUM").toUpperCase();
    const profile = BOT_PROFILES[diff] || BOT_PROFILES.MEDIUM;
    const targetWpm = profile.minWpm + Math.floor(Math.random() * (profile.maxWpm - profile.minWpm + 1));
    const charsPerSec = (targetWpm * 5) / 60;
    const totalChars = room.passage.text.length;

    let typedChars = 0;
    const botInterval = setInterval(() => {
      if (room.status !== "RACING" || bot.finished) {
        clearInterval(botInterval);
        return;
      }

      const tickAdvance = (charsPerSec / 2) * (0.85 + Math.random() * 0.3);
      typedChars += tickAdvance;
      const progress = Math.min(100, Math.round((typedChars / totalChars) * 100));
      const currentWpm = Math.round(targetWpm + (Math.random() * 4 - 2));

      bot.progress = progress;
      bot.wpm = currentWpm;
      bot.accuracy = Math.min(100, Math.max(90, Math.round(profile.avgAcc + (Math.random() * 2 - 1))));

      io.to(room.code).emit("race:progress_update", {
        socketId: bot.socketId,
        progress: bot.progress,
        wpm: bot.wpm,
        accuracy: bot.accuracy,
      });

      if (progress >= 100) {
        clearInterval(botInterval);
        room.finishRankCounter = (room.finishRankCounter || 0) + 1;
        bot.finished = true;
        bot.finishRank = room.finishRankCounter;
        bot.finishTimeMs = Date.now() - (room.startTime || Date.now());

        io.to(room.code).emit("race:player_finished", {
          socketId: bot.socketId,
          player: bot,
        });

        const allDone = Object.values(room.players).every((p) => p.finished);
        if (allDone) {
          room.status = "FINISHED";
          io.to(room.code).emit("race:all_finished", { room: sanitizeRoom(room) });
        }
      }
    }, 500);

    room.botIntervals.push(botInterval);
  });
}

app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    return handle(req, res);
  });

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    let currentRoomCode = null;

    socket.on("room:get_public", () => {
      socket.emit("room:public_list", getPublicRooms());
    });

    socket.on("room:create", (payload) => {
      const code = "RACE-" + Math.floor(1000 + Math.random() * 9000);
      const randomPassage =
        payload.passage ||
        DEFAULT_PASSAGES[Math.floor(Math.random() * DEFAULT_PASSAGES.length)];

      const room = {
        id: code,
        code,
        name: payload.name || `${payload.username || 'Racer'}'s Grand Prix`,
        hostId: payload.userId || socket.id,
        passage: randomPassage,
        durationSeconds: 45,
        status: "WAITING",
        players: {},
        finishRankCounter: 0,
      };

      const hostPlayer = {
        socketId: socket.id,
        userId: payload.userId || socket.id,
        username: payload.username || "Racer",
        avatar: payload.avatar || "default",
        isHost: true,
        isReady: true,
        progress: 0,
        wpm: 0,
        accuracy: 100,
        finished: false,
      };

      room.players[socket.id] = hostPlayer;
      rooms.set(code, room);
      currentRoomCode = code;

      socket.join(code);
      socket.emit("room:created", { room: sanitizeRoom(room) });
      io.emit("room:public_list", getPublicRooms());
    });

    socket.on("room:join", (payload) => {
      const targetCode = (payload.code || "").toUpperCase();
      const room = rooms.get(targetCode);
      if (!room) {
        socket.emit("room:error", { message: "Race room not found or expired." });
        return;
      }

      if (room.status === "RACING") {
        socket.emit("room:error", { message: "Race has already started." });
        return;
      }

      if (room.cleanupTimer) {
        clearTimeout(room.cleanupTimer);
        delete room.cleanupTimer;
      }

      // Check if user is host or if this is the only human player in room
      const existingHost = Object.values(room.players).find((p) => p.isHost && !p.isBot);
      const isHost = payload.userId === room.hostId || socket.id === room.hostId || !existingHost;

      // Clean up any stale socketId under the same userId
      Object.keys(room.players).forEach((sId) => {
        if (room.players[sId].userId === payload.userId) {
          delete room.players[sId];
        }
      });

      const player = {
        socketId: socket.id,
        userId: payload.userId || socket.id,
        username: payload.username || "Racer",
        avatar: payload.avatar || "default",
        isHost: isHost,
        isReady: isHost,
        progress: 0,
        wpm: 0,
        accuracy: 100,
        finished: false,
      };

      if (isHost) {
        room.hostId = payload.userId || socket.id;
      }

      room.players[socket.id] = player;
      currentRoomCode = room.code;
      socket.join(room.code);

      io.to(room.code).emit("room:updated", { room: sanitizeRoom(room) });
      io.emit("room:public_list", getPublicRooms());
    });

    socket.on("room:toggle_ready", () => {
      if (!currentRoomCode) return;
      const room = rooms.get(currentRoomCode);
      if (!room || !room.players[socket.id]) return;

      room.players[socket.id].isReady = !room.players[socket.id].isReady;
      io.to(room.code).emit("room:updated", { room: sanitizeRoom(room) });
    });

    socket.on("room:add_bot", (payload) => {
      if (!currentRoomCode) return;
      const room = rooms.get(currentRoomCode);
      if (!room) return;

      const player = room.players[socket.id];
      const isHost = player?.isHost || socket.id === room.hostId;
      if (!isHost) return;

      if (Object.keys(room.players).length >= 8) {
        socket.emit("room:error", { message: "Room is already full (max 8 racers)." });
        return;
      }

      const diff = (payload?.difficulty || "MEDIUM").toUpperCase();
      const profile = BOT_PROFILES[diff] || BOT_PROFILES.MEDIUM;

      const existingBotsOfTier = Object.values(room.players).filter((p) => p.isBot && p.botDifficulty === diff).length;
      const botName = profile.names[existingBotsOfTier % profile.names.length];
      const botId = "bot_" + Math.random().toString(36).substring(2, 8);

      room.players[botId] = {
        socketId: botId,
        userId: botId,
        username: `${botName} [BOT • ${diff}]`,
        avatar: "bot",
        isHost: false,
        isReady: true,
        progress: 0,
        wpm: 0,
        accuracy: profile.avgAcc,
        finished: false,
        isBot: true,
        botDifficulty: diff,
      };

      io.to(room.code).emit("room:updated", { room: sanitizeRoom(room) });
    });

    socket.on("room:remove_bot", (payload) => {
      if (!currentRoomCode) return;
      const room = rooms.get(currentRoomCode);
      if (!room) return;

      const player = room.players[socket.id];
      const isHost = player?.isHost || socket.id === room.hostId;
      if (!isHost) return;

      const target = room.players[payload?.socketId];
      if (target && target.isBot) {
        delete room.players[payload.socketId];
        io.to(room.code).emit("room:updated", { room: sanitizeRoom(room) });
      }
    });

    socket.on("room:start_countdown", () => {
      if (!currentRoomCode) return;
      const room = rooms.get(currentRoomCode);
      if (!room) return;

      const player = room.players[socket.id];
      const isHost = player?.isHost || socket.id === room.hostId;
      if (!isHost) return;
      if (room.status !== "WAITING") return;

      room.status = "COUNTDOWN";
      room.finishRankCounter = 0;

      Object.values(room.players).forEach((p) => {
        p.progress = 0;
        p.wpm = 0;
        p.accuracy = 100;
        p.finished = false;
        delete p.finishRank;
        delete p.finishTimeMs;
      });

      io.to(room.code).emit("room:countdown_start", { count: 3 });

      let count = 3;
      const countdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
          io.to(room.code).emit("room:countdown_tick", { count });
        } else {
          clearInterval(countdownInterval);
          room.status = "RACING";
          room.startTime = Date.now();
          io.to(room.code).emit("room:race_start", { startTime: room.startTime });
          startBotsSimulation(room, io);
        }
      }, 1000);

      room.countdownTimer = countdownInterval;
    });

    socket.on("race:progress", (data) => {
      if (!currentRoomCode) return;
      const room = rooms.get(currentRoomCode);
      if (!room || room.status !== "RACING" || !room.players[socket.id]) return;

      const player = room.players[socket.id];
      player.progress = Math.min(100, Math.max(0, data.progress));
      player.wpm = Math.max(0, data.wpm);
      player.accuracy = Math.max(0, Math.min(100, data.accuracy));

      io.to(room.code).emit("race:progress_update", {
        socketId: socket.id,
        progress: player.progress,
        wpm: player.wpm,
        accuracy: player.accuracy,
      });
    });

    socket.on("race:finish", (data) => {
      if (!currentRoomCode) return;
      const room = rooms.get(currentRoomCode);
      if (!room || room.status !== "RACING" || !room.players[socket.id]) return;

      const player = room.players[socket.id];
      if (player.finished) return;

      room.finishRankCounter = (room.finishRankCounter || 0) + 1;
      player.finished = true;
      player.progress = 100;
      player.wpm = data.finalWpm;
      player.accuracy = data.accuracy;
      player.finishRank = room.finishRankCounter;
      player.finishTimeMs = Date.now() - (room.startTime || Date.now());

      io.to(room.code).emit("race:player_finished", {
        socketId: socket.id,
        player,
      });

      const allDone = Object.values(room.players).every((p) => p.finished);
      if (allDone) {
        room.status = "FINISHED";
        io.to(room.code).emit("race:all_finished", { room: sanitizeRoom(room) });
      }
    });

    socket.on("room:rematch", () => {
      if (!currentRoomCode) return;
      const room = rooms.get(currentRoomCode);
      if (!room) return;

      const player = room.players[socket.id];
      const isHost = player?.isHost || socket.id === room.hostId;
      if (!isHost) return;

      room.passage = DEFAULT_PASSAGES[Math.floor(Math.random() * DEFAULT_PASSAGES.length)];
      room.status = "WAITING";
      room.finishRankCounter = 0;

      Object.values(room.players).forEach((p) => {
        p.progress = 0;
        p.wpm = 0;
        p.accuracy = 100;
        p.finished = false;
        p.isReady = p.isHost || p.isBot === true;
        delete p.finishRank;
        delete p.finishTimeMs;
      });

      io.to(room.code).emit("room:updated", { room: sanitizeRoom(room) });
    });

    socket.on("room:leave", () => {
      if (!currentRoomCode) return;
      const room = rooms.get(currentRoomCode);
      if (room) {
        const wasHost = room.players[socket.id]?.isHost;
        delete room.players[socket.id];
        socket.leave(currentRoomCode);

        const remainingPlayers = Object.values(room.players).filter((p) => !p.isBot);
        if (remainingPlayers.length === 0) {
          if (room.cleanupTimer) clearTimeout(room.cleanupTimer);
          room.cleanupTimer = setTimeout(() => {
            const currentRemaining = Object.values(room.players).filter((p) => !p.isBot);
            if (currentRemaining.length === 0) {
              if (room.botIntervals) room.botIntervals.forEach(clearInterval);
              if (room.countdownTimer) clearInterval(room.countdownTimer);
              rooms.delete(room.code);
              io.emit("room:public_list", getPublicRooms());
            }
          }, 60000);
        } else {
          if (wasHost && remainingPlayers.length > 0) {
            remainingPlayers[0].isHost = true;
            remainingPlayers[0].isReady = true;
            room.hostId = remainingPlayers[0].userId;
          }
          io.to(room.code).emit("room:updated", { room: sanitizeRoom(room) });
        }
      }
      currentRoomCode = null;
      io.emit("room:public_list", getPublicRooms());
    });

    socket.on("disconnect", () => {
      if (!currentRoomCode) return;
      const room = rooms.get(currentRoomCode);
      if (!room) return;

      const wasHost = room.players[socket.id]?.isHost;
      delete room.players[socket.id];

      const remainingPlayers = Object.values(room.players).filter((p) => !p.isBot);
      if (remainingPlayers.length === 0) {
        if (room.cleanupTimer) clearTimeout(room.cleanupTimer);
        room.cleanupTimer = setTimeout(() => {
          const currentRemaining = Object.values(room.players).filter((p) => !p.isBot);
          if (currentRemaining.length === 0) {
            if (room.botIntervals) room.botIntervals.forEach(clearInterval);
            if (room.countdownTimer) clearInterval(room.countdownTimer);
            rooms.delete(room.code);
            io.emit("room:public_list", getPublicRooms());
          }
        }, 60000);
      } else {
        if (wasHost && remainingPlayers.length > 0) {
          remainingPlayers[0].isHost = true;
          remainingPlayers[0].isReady = true;
          room.hostId = remainingPlayers[0].userId;
        }
        io.to(room.code).emit("room:updated", { room: sanitizeRoom(room) });
      }

      io.emit("room:public_list", getPublicRooms());
    });
  });

  server.listen(port, hostname, () => {
    console.log(`> KeyStreak production server running on http://${hostname}:${port}`);
  });
});
