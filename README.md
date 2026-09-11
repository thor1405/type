# ⚡ TypeRush — Production-Grade Competitive Typing Game

**TypeRush** is a fast, modern, competitive typing platform where users can practice solo across multiple difficulty tiers, race against other players in synchronized real-time grand prix via Socket.IO, and challenge friends with asynchronous time-trial leaderboards.

---

## 🚀 Key Features

### 1. Solo Practice Arena (`/practice`)
- **Difficulty Selection**: Easy, Medium, Hard, and Expert tiers.
- **Flexible Test Modes**: 15s, 30s, 60s, 120s, Custom duration, or full Passage mode.
- **Curated Passage Library**: Quotes, Tech / Code, Literature, General, and Speed sentences.
- **Ultra-Low Latency Typing Engine**: Zero input lag, character-by-character highlights (correct, incorrect, current caret, untyped), backspace correction, and error tracking.
- **Synthesized Web Audio Sound Effects**: Cherry MX Mechanical click, Typewriter strike, and Bubble pop profiles with zero audio network overhead + mute toggle.
- **Detailed Results Breakdown**: Final WPM, Raw CPM, Accuracy %, Error breakdown, Consistency score, Personal Best difference alert with celebratory confetti, second-by-second Recharts speed progression graph, and 1-click share links.

### 2. Real-Time Multiplayer Races (`/multiplayer` & `/race/[code]`)
- **Custom Race Rooms**: Generate unique codes (e.g. `RACE-8492`) or shareable URLs.
- **Lobby Presence**: Real-time connected players list, ready checkmarks, and host controls.
- **AI Bot Racers**: Add automated bot pacers (TurboBot, ApexRacer, VelocityAI) for instant competition.
- **Synchronized 3-2-1-GO Countdown**: Precise server-synchronized race start with audio cues.
- **Animated Race Track**: Visual racing lanes with moving racer icons, real-time WPM badges, and finish line flags.
- **Live Leaderboard**: Real-time ASCII/block progress bars (`████████░░ 82%`), live speed, and overtaking rank animations.
- **Podium Celebration**: 3D winner podium for Gold, Silver, and Bronze finishers with confetti, finish times, and 1-click Rematch with a fresh passage.

### 3. Asynchronous Friend Challenges (`/challenges` & `/challenge/[code]`)
- **Challenge Creator**: Custom challenge title, target WPM benchmark, difficulty, and expiration time.
- **Unique Shareable URLs**: `/challenge/[code]` with native Web Share API & clipboard copy.
- **Competitive Friend Leaderboard**: Dedicated ranked standings of all friends who completed the challenge.

### 4. SaaS-Grade User Analytics Dashboard (`/dashboard`)
- **KPI Metrics**: Average WPM, Peak WPM, Avg Accuracy, Best Accuracy, Total Tests, Total Typing Time, Daily Streak, Best Streak.
- **Interactive Recharts**: Speed progression curve, accuracy over time, and performance breakdown by difficulty.
- **Timeframe Filters**: 7 Days, 30 Days, 3 Months, All Time.
- **Recent Tests Log**: Table with test mode badges, speed, accuracy, duration, errors, and link to verified certificate cards.

### 5. Profiles, Achievements & Badges (`/profile`)
- **Tiered Badges**: Bronze, Silver, Gold, Platinum, Diamond badges (First Test, 50 WPM, 75 WPM, 100 WPM, 120 WPM, Sharpshooter 95% Acc, Perfectionist 99% Acc, Centurion, Multiplayer Winner, Challenge Champion, Streak Master).
- **Profile Customization**: Bio, custom keyboard setup, and glowing neon avatars.

### 6. Global Leaderboard (`/leaderboard`)
- **Timeframe Filtering**: Daily, Weekly, Monthly, All Time.
- **Metric Filtering**: Highest WPM, Best Accuracy, Most Tests, Multiplayer Victories.
- **Top 3 Podium Cards**: Gold, Silver, Bronze badges and user search.

### 7. Standalone Shareable Results (`/result/[id]`)
- Verified result certificates with WPM, Accuracy, Duration, Errors, Passage snippet, and "Challenge This Score" CTA.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Canvas Confetti.
- **Typing Engine**: Zero-latency pure TypeScript state machine with Web Audio API sound synthesis.
- **Real-Time WebSockets**: Socket.IO server integrated with Next.js in a custom unified Node HTTP server (`server.js`).
- **Database & ORM**: Prisma ORM with SQLite default (100% PostgreSQL compatible).
- **Authentication**: JWT & session cookies with bcrypt password hashing + 1-click demo user switcher.
- **Testing**: Vitest automated unit test suite.

---

## 🏁 Quickstart

```bash
# 1. Install dependencies
npm install

# 2. Push database schema & seed sample data
npm run db:push
npm run db:seed

# 3. Run automated tests
npm run test

# 4. Start the unified production/dev server
npm run dev
```

Open `http://localhost:3000` to start typing!
