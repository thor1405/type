const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const PASSAGES = [
  // EASY
  {
    title: "Morning Coffee",
    text: "The sun rises gently over the horizon, painting the morning sky in shades of amber and rose. A warm cup of coffee rests comfortably in your hands as a new day begins with calm energy.",
    author: "Elena Rostova",
    source: "Morning Reflections",
    difficulty: "EASY",
    category: "General",
    wordsCount: 35,
  },
  {
    title: "Simple Joys",
    text: "Sometimes the most profound moments in life are the simplest ones: a walk in the park, the sound of rain against the window, or a quiet conversation with a good friend.",
    author: "Marcus Aurelius",
    source: "Quiet Thoughts",
    difficulty: "EASY",
    category: "Quotes",
    wordsCount: 32,
  },
  {
    title: "Ocean Breeze",
    text: "Waves crash softly against the sandy shore while seabirds glide effortlessly through the crisp coastal air. The rhythm of the ocean brings peace to every restless mind.",
    author: "Claire Bennett",
    source: "Coastal Notes",
    difficulty: "EASY",
    category: "Literature",
    wordsCount: 29,
  },

  // MEDIUM
  {
    title: "The Speed of Innovation",
    text: "Technology moves at the speed of thought, transforming the boundaries of human potential and shaping the future of global connectivity. Every leap forward demands courage, creativity, and relentless determination.",
    author: "Dr. Arthur Vance",
    source: "Silicon Frontier",
    difficulty: "MEDIUM",
    category: "General",
    wordsCount: 32,
  },
  {
    title: "Whispers of the Cosmos",
    text: "Stars are the ancient beacons of the universe, casting light across trillions of kilometers to remind us how vast and mysterious our reality truly is. We are stardust contemplating the stars.",
    author: "Carl Sagan",
    source: "Cosmic Horizons",
    difficulty: "MEDIUM",
    category: "Literature",
    wordsCount: 31,
  },
  {
    title: "The Craft of Software",
    text: "Programs must be written for people to read, and only incidentally for machines to execute. Elegance is not optional; it is fundamental to building enduring architecture.",
    author: "Harold Abelson",
    source: "Structure and Interpretation of Computer Programs",
    difficulty: "MEDIUM",
    category: "Code",
    wordsCount: 27,
  },
  {
    title: "Discipline and Mastery",
    text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit. The path to typing mastery requires continuous focus, deliberate repetition, and patience.",
    author: "Will Durant",
    source: "The Story of Philosophy",
    difficulty: "MEDIUM",
    category: "Quotes",
    wordsCount: 29,
  },

  // HARD
  {
    title: "Cyber Racing Circuit",
    text: "Adrenaline surges through your fingertips as keystrokes echo like lightning across the mechanical switches in the digital arena. Every millisecond counts when milliseconds decide victory.",
    author: "TypeRush Elite",
    source: "Championship Series",
    difficulty: "HARD",
    category: "Speed",
    wordsCount: 28,
  },
  {
    title: "Quantum Entanglement",
    text: "Entangled particles maintain instantaneous correlation irrespective of the physical distance separating them, presenting a confounding paradox that challenged the foundational tenets of classical physics.",
    author: "Niels Bohr",
    source: "Quantum Principles",
    difficulty: "HARD",
    category: "General",
    wordsCount: 24,
  },
  {
    title: "Recursive Algorithms",
    text: "function fibonacci(n: number): number { if (n <= 1) return n; return fibonacci(n - 1) + fibonacci(n - 2); } // Recursive complexity O(2^n)",
    author: "Algorithm Design Manual",
    source: "Computer Science Standard",
    difficulty: "HARD",
    category: "Code",
    wordsCount: 22,
  },

  // EXPERT
  {
    title: "Cryptographic Synthesis",
    text: "Zero-knowledge succinct non-interactive arguments of knowledge (zk-SNARKs) leverage elliptic curve pairings and polynomial commitment schemes to achieve verifiable computation without revealing sensitive inputs.",
    author: "Satoshi Nakamoto",
    source: "Cryptographic Protocols",
    difficulty: "EXPERT",
    category: "Code",
    wordsCount: 23,
  },
  {
    title: "Philosophical Dialectics",
    text: "The epistemological dissonance between phenomenological existentialism and deterministic materialism necessitates a rigorous metaphysical deconstruction of intentionality and perceived subjective consciousness.",
    author: "Jean-Paul Sartre",
    source: "Being and Nothingness",
    difficulty: "EXPERT",
    category: "Literature",
    wordsCount: 21,
  },
];

const ACHIEVEMENTS = [
  {
    code: "FIRST_TEST",
    title: "First Key",
    description: "Complete your very first typing test.",
    icon: "Sparkles",
    tier: "BRONZE",
    category: "TESTS",
    thresholdValue: 1,
    xpReward: 50,
  },
  {
    code: "SPEED_50",
    title: "Speed Demon 50",
    description: "Achieve a speed of 50 WPM on any test.",
    icon: "Zap",
    tier: "BRONZE",
    category: "SPEED",
    thresholdValue: 50,
    xpReward: 100,
  },
  {
    code: "SPEED_75",
    title: "Velocity 75",
    description: "Break the 75 WPM barrier.",
    icon: "Flame",
    tier: "SILVER",
    category: "SPEED",
    thresholdValue: 75,
    xpReward: 200,
  },
  {
    code: "SPEED_100",
    title: "Triple Digits 100",
    description: "Reach the elite 100+ WPM benchmark.",
    icon: "Trophy",
    tier: "GOLD",
    category: "SPEED",
    thresholdValue: 100,
    xpReward: 500,
  },
  {
    code: "SPEED_120",
    title: "Supersonic 120",
    description: "Surpass 120 WPM with blazing speed.",
    icon: "Rocket",
    tier: "DIAMOND",
    category: "SPEED",
    thresholdValue: 120,
    xpReward: 1000,
  },
  {
    code: "ACCURACY_95",
    title: "Sharpshooter",
    description: "Finish a test with at least 95% accuracy.",
    icon: "Target",
    tier: "SILVER",
    category: "ACCURACY",
    thresholdValue: 95,
    xpReward: 150,
  },
  {
    code: "ACCURACY_99",
    title: "Perfectionist",
    description: "Score 99% or higher accuracy on a full test.",
    icon: "Award",
    tier: "GOLD",
    category: "ACCURACY",
    thresholdValue: 99,
    xpReward: 350,
  },
  {
    code: "CENTURION",
    title: "Centurion",
    description: "Complete 100 typing tests.",
    icon: "Shield",
    tier: "PLATINUM",
    category: "TESTS",
    thresholdValue: 100,
    xpReward: 750,
  },
  {
    code: "MULTIPLAYER_WIN",
    title: "Podium Champion",
    description: "Win 1st place in a live multiplayer race.",
    icon: "Crown",
    tier: "GOLD",
    category: "MULTIPLAYER",
    thresholdValue: 1,
    xpReward: 300,
  },
  {
    code: "CHALLENGE_MASTER",
    title: "Challenge Champion",
    description: "Top the leaderboard in a friend challenge.",
    icon: "Medal",
    tier: "GOLD",
    category: "CHALLENGE",
    thresholdValue: 1,
    xpReward: 250,
  },
];

async function main() {
  console.log("Seeding TypeRush database...");

  // Clean existing data
  await prisma.userAchievement.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.challengeAttempt.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.roomPlayer.deleteMany();
  await prisma.room.deleteMany();
  await prisma.testResult.deleteMany();
  await prisma.typingTest.deleteMany();
  await prisma.typingPassage.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  // 1. Seed Passages
  console.log("Creating passages...");
  const createdPassages = [];
  for (const p of PASSAGES) {
    const passage = await prisma.typingPassage.create({
      data: p,
    });
    createdPassages.push(passage);
  }

  // 2. Seed Achievements
  console.log("Creating achievements...");
  const createdAchievements = [];
  for (const a of ACHIEVEMENTS) {
    const ach = await prisma.achievement.create({
      data: a,
    });
    createdAchievements.push(ach);
  }

  // 3. Seed Demo Users
  console.log("Creating demo users...");
  const passwordHash = bcrypt.hashSync("password123", 10);

  const alex = await prisma.user.create({
    data: {
      email: "alex@typerush.io",
      username: "AlexVance",
      passwordHash,
      avatar: "neon-cyan",
      role: "USER",
      profile: {
        create: {
          bio: "Speed demon & competitive typist. Chasing 120 WPM.",
          keyboard: "Custom Keychron Q1 Pro (Gateron Oil Kings)",
          theme: "dark",
          soundTheme: "mechanical",
          totalTypingTime: 18450,
          currentStreak: 12,
          bestStreak: 24,
        },
      },
    },
  });

  const sarah = await prisma.user.create({
    data: {
      email: "sarah@typerush.io",
      username: "SarahConnor",
      passwordHash,
      avatar: "emerald-glow",
      role: "USER",
      profile: {
        create: {
          bio: "Accuracy is king. 99% accuracy club member.",
          keyboard: "HHKB Professional Hybrid Type-S",
          theme: "dark",
          soundTheme: "mechanical",
          totalTypingTime: 14200,
          currentStreak: 8,
          bestStreak: 15,
        },
      },
    },
  });

  const john = await prisma.user.create({
    data: {
      email: "john@typerush.io",
      username: "JohnWick",
      passwordHash,
      avatar: "amber-flame",
      role: "USER",
      profile: {
        create: {
          bio: "Focus. Commitment. Sheer will.",
          keyboard: "Wooting 60HE (Lekker Switches)",
          theme: "dark",
          soundTheme: "mechanical",
          totalTypingTime: 9800,
          currentStreak: 5,
          bestStreak: 10,
        },
      },
    },
  });

  const demoUser = await prisma.user.create({
    data: {
      email: "demo@typerush.io",
      username: "TypeMaster",
      passwordHash,
      avatar: "purple-cyber",
      role: "USER",
      profile: {
        create: {
          bio: "TypeRush enthusiast aiming for the global top 10.",
          keyboard: "Mode Sonnet (Boba U4T)",
          theme: "dark",
          soundTheme: "mechanical",
          totalTypingTime: 7600,
          currentStreak: 6,
          bestStreak: 14,
        },
      },
    },
  });

  // 4. Assign Achievements
  console.log("Assigning user achievements...");
  const users = [alex, sarah, john, demoUser];
  for (const u of users) {
    // Unlock first test & speed 50 for everyone
    await prisma.userAchievement.create({
      data: { userId: u.id, achievementId: createdAchievements[0].id },
    });
    await prisma.userAchievement.create({
      data: { userId: u.id, achievementId: createdAchievements[1].id },
    });
    await prisma.userAchievement.create({
      data: { userId: u.id, achievementId: createdAchievements[5].id },
    });
  }

  // Alex & Sarah extra achievements
  await prisma.userAchievement.create({
    data: { userId: alex.id, achievementId: createdAchievements[2].id }, // 75 WPM
  });
  await prisma.userAchievement.create({
    data: { userId: alex.id, achievementId: createdAchievements[3].id }, // 100 WPM
  });
  await prisma.userAchievement.create({
    data: { userId: alex.id, achievementId: createdAchievements[8].id }, // MP Win
  });

  await prisma.userAchievement.create({
    data: { userId: sarah.id, achievementId: createdAchievements[2].id }, // 75 WPM
  });
  await prisma.userAchievement.create({
    data: { userId: sarah.id, achievementId: createdAchievements[6].id }, // 99% Acc
  });

  // 5. Seed Historical Test Results (over past 30 days for rich charts)
  console.log("Creating historical test data...");
  const baseDates = Array.from({ length: 25 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (24 - i));
    return d;
  });

  for (let i = 0; i < baseDates.length; i++) {
    const date = baseDates[i];
    const passage = createdPassages[i % createdPassages.length];

    // Demo User test progression
    const progressFactor = i / baseDates.length;
    const demoWpm = Math.round(62 + progressFactor * 24 + (Math.random() * 6 - 3));
    const demoAcc = Math.round((96 + Math.random() * 3.5) * 10) / 10;
    const demoCpm = demoWpm * 5;

    const timeline = [
      { second: 5, wpm: Math.round(demoWpm * 0.9), rawCpm: demoCpm, accuracy: demoAcc, errors: 0 },
      { second: 15, wpm: demoWpm, rawCpm: demoCpm, accuracy: demoAcc, errors: 1 },
      { second: 30, wpm: demoWpm + 2, rawCpm: demoCpm + 10, accuracy: demoAcc, errors: 1 },
    ];

    const test = await prisma.typingTest.create({
      data: {
        userId: demoUser.id,
        passageId: passage.id,
        mode: i % 4 === 0 ? "MULTIPLAYER" : "SOLO",
        difficulty: passage.difficulty,
        durationSeconds: 30,
        createdAt: date,
      },
    });

    await prisma.testResult.create({
      data: {
        testId: test.id,
        wpm: demoWpm,
        rawCpm: demoCpm,
        accuracy: demoAcc,
        charactersTyped: Math.round((demoWpm * 5 * 30) / 60),
        correctChars: Math.round(((demoWpm * 5 * 30) / 60) * (demoAcc / 100)),
        incorrectChars: 2,
        errors: 2,
        duration: 30,
        consistency: 92.5,
        timelineJson: JSON.stringify(timeline),
        createdAt: date,
      },
    });

    // Alex high score tests
    const alexWpm = Math.round(95 + progressFactor * 16 + (Math.random() * 6 - 3));
    const alexTest = await prisma.typingTest.create({
      data: {
        userId: alex.id,
        passageId: passage.id,
        mode: "MULTIPLAYER",
        difficulty: passage.difficulty,
        durationSeconds: 30,
        createdAt: date,
      },
    });
    await prisma.testResult.create({
      data: {
        testId: alexTest.id,
        wpm: alexWpm,
        rawCpm: alexWpm * 5.2,
        accuracy: 98.4,
        charactersTyped: Math.round((alexWpm * 5 * 30) / 60),
        correctChars: Math.round(((alexWpm * 5 * 30) / 60) * 0.984),
        incorrectChars: 1,
        errors: 1,
        duration: 30,
        consistency: 95.0,
        timelineJson: JSON.stringify(timeline),
        createdAt: date,
      },
    });
  }

  // 6. Seed Friend Challenges
  console.log("Creating friend challenges...");
  const challenge1 = await prisma.challenge.create({
    data: {
      code: "SPEED-99",
      title: "Cyber Speed Trial",
      creatorId: alex.id,
      passageId: createdPassages[3].id,
      passageText: createdPassages[3].text,
      difficulty: "MEDIUM",
      durationSeconds: 30,
      targetWpm: 104.0,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      attempts: {
        create: [
          {
            userId: alex.id,
            username: "AlexVance",
            avatar: "neon-cyan",
            wpm: 104.2,
            rawCpm: 530,
            accuracy: 98.7,
            durationSeconds: 30,
            errors: 1,
            rank: 1,
          },
          {
            userId: sarah.id,
            username: "SarahConnor",
            avatar: "emerald-glow",
            wpm: 97.4,
            rawCpm: 495,
            accuracy: 99.1,
            durationSeconds: 30,
            errors: 0,
            rank: 2,
          },
          {
            userId: john.id,
            username: "JohnWick",
            avatar: "amber-flame",
            wpm: 91.0,
            rawCpm: 470,
            accuracy: 96.4,
            durationSeconds: 30,
            errors: 3,
            rank: 3,
          },
        ],
      },
    },
  });

  const challenge2 = await prisma.challenge.create({
    data: {
      code: "ACC-MASTER",
      title: "Pure Precision Gauntlet",
      creatorId: sarah.id,
      passageId: createdPassages[5].id,
      passageText: createdPassages[5].text,
      difficulty: "MEDIUM",
      durationSeconds: 30,
      targetWpm: 95.0,
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      attempts: {
        create: [
          {
            userId: sarah.id,
            username: "SarahConnor",
            avatar: "emerald-glow",
            wpm: 96.5,
            rawCpm: 485,
            accuracy: 100.0,
            durationSeconds: 30,
            errors: 0,
            rank: 1,
          },
          {
            userId: demoUser.id,
            username: "TypeMaster",
            avatar: "purple-cyber",
            wpm: 84.2,
            rawCpm: 430,
            accuracy: 97.8,
            durationSeconds: 30,
            errors: 2,
            rank: 2,
          },
        ],
      },
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
