import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const timeframe = searchParams.get("timeframe") || "all"; // daily, weekly, monthly, all
    const category = searchParams.get("category") || "wpm"; // wpm, accuracy, tests, races

    const now = new Date();
    let fromDate: Date | undefined;
    if (timeframe === "daily") {
      fromDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else if (timeframe === "weekly") {
      fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeframe === "monthly") {
      fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const whereClause: any = {};
    if (fromDate) {
      whereClause.createdAt = { gte: fromDate };
    }

    // Fetch tests with results
    const tests = await prisma.typingTest.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        result: true,
      },
    });

    // Aggregate by user
    const userMap = new Map<string, {
      userId: string;
      username: string;
      avatar: string;
      bestWpm: number;
      avgWpm: number;
      bestAccuracy: number;
      avgAccuracy: number;
      totalTests: number;
      racesWon: number;
      sumWpm: number;
      sumAcc: number;
    }>();

    tests.forEach((t) => {
      const u = t.user || { id: "guest", username: "Guest Typist", avatar: "default" };
      const res = t.result;
      if (!res) return;

      if (!userMap.has(u.id)) {
        userMap.set(u.id, {
          userId: u.id,
          username: u.username,
          avatar: u.avatar,
          bestWpm: res.wpm,
          avgWpm: res.wpm,
          bestAccuracy: res.accuracy,
          avgAccuracy: res.accuracy,
          totalTests: 1,
          racesWon: t.mode === "MULTIPLAYER" && res.wpm > 85 ? 1 : 0,
          sumWpm: res.wpm,
          sumAcc: res.accuracy,
        });
      } else {
        const entry = userMap.get(u.id)!;
        entry.totalTests += 1;
        entry.sumWpm += res.wpm;
        entry.sumAcc += res.accuracy;
        entry.bestWpm = Math.max(entry.bestWpm, res.wpm);
        entry.bestAccuracy = Math.max(entry.bestAccuracy, res.accuracy);
        entry.avgWpm = Math.round((entry.sumWpm / entry.totalTests) * 10) / 10;
        entry.avgAccuracy = Math.round((entry.sumAcc / entry.totalTests) * 10) / 10;
        if (t.mode === "MULTIPLAYER" && res.wpm > 85) entry.racesWon += 1;
      }
    });

    let leaderboard = Array.from(userMap.values());

    if (category === "wpm") {
      leaderboard.sort((a, b) => b.bestWpm - a.bestWpm);
    } else if (category === "accuracy") {
      leaderboard.sort((a, b) => b.bestAccuracy - a.bestAccuracy || b.avgWpm - a.avgWpm);
    } else if (category === "tests") {
      leaderboard.sort((a, b) => b.totalTests - a.totalTests);
    } else if (category === "races") {
      leaderboard.sort((a, b) => b.racesWon - a.racesWon || b.bestWpm - a.bestWpm);
    }

    const ranked = leaderboard.map((item, index) => ({
      rank: index + 1,
      ...item,
    }));

    return NextResponse.json({ leaderboard: ranked });
  } catch (error) {
    console.error("Leaderboard API error:", error);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
