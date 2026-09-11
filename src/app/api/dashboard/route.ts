import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "all"; // 7d, 30d, 3m, all

    if (!user?.id) {
      return NextResponse.json({
        overview: {
          avgWpm: 0,
          bestWpm: 0,
          avgAccuracy: 0,
          bestAccuracy: 0,
          totalTests: 0,
          totalTypingTime: 0,
          currentStreak: 0,
          bestStreak: 0,
        },
        chartData: [],
        difficultyBreakdown: [],
        recentTests: [],
        user: null,
      });
    }

    const targetUserId = user.id;

    // Date range filter
    const now = new Date();
    let fromDate: Date | undefined;
    if (filter === "7d") {
      fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (filter === "30d") {
      fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (filter === "3m") {
      fromDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    }

    const whereClause: any = { userId: targetUserId };
    if (fromDate) {
      whereClause.createdAt = { gte: fromDate };
    }

    const tests = await prisma.typingTest.findMany({
      where: whereClause,
      include: {
        result: true,
        passage: { select: { title: true, difficulty: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    const profile = await prisma.profile.findUnique({
      where: { userId: targetUserId },
    });

    const results = tests.map((t) => t.result).filter(Boolean);

    // Calculate aggregated metrics
    const totalTests = results.length;
    let avgWpm = 0;
    let bestWpm = 0;
    let avgAccuracy = 0;
    let bestAccuracy = 0;
    let totalTypingTime = profile?.totalTypingTime || 0;

    if (totalTests > 0) {
      const sumWpm = results.reduce((acc, r) => acc + (r?.wpm || 0), 0);
      const sumAcc = results.reduce((acc, r) => acc + (r?.accuracy || 0), 0);
      avgWpm = Math.round((sumWpm / totalTests) * 10) / 10;
      bestWpm = Math.max(...results.map((r) => r?.wpm || 0));
      avgAccuracy = Math.round((sumAcc / totalTests) * 10) / 10;
      bestAccuracy = Math.max(...results.map((r) => r?.accuracy || 0));
    }

    // Chart timeline series
    const chartData = tests.map((t) => ({
      date: new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      wpm: t.result?.wpm || 0,
      accuracy: t.result?.accuracy || 0,
      mode: t.mode,
      difficulty: t.difficulty,
    }));

    // Performance by difficulty
    const diffMap: Record<string, { totalWpm: number; count: number; totalAcc: number }> = {
      EASY: { totalWpm: 0, count: 0, totalAcc: 0 },
      MEDIUM: { totalWpm: 0, count: 0, totalAcc: 0 },
      HARD: { totalWpm: 0, count: 0, totalAcc: 0 },
      EXPERT: { totalWpm: 0, count: 0, totalAcc: 0 },
    };

    tests.forEach((t) => {
      if (t.result && diffMap[t.difficulty]) {
        diffMap[t.difficulty].totalWpm += t.result.wpm;
        diffMap[t.difficulty].totalAcc += t.result.accuracy;
        diffMap[t.difficulty].count += 1;
      }
    });

    const difficultyBreakdown = Object.entries(diffMap).map(([difficulty, data]) => ({
      difficulty,
      avgWpm: data.count > 0 ? Math.round((data.totalWpm / data.count) * 10) / 10 : 0,
      avgAccuracy: data.count > 0 ? Math.round((data.totalAcc / data.count) * 10) / 10 : 0,
      testsCount: data.count,
    }));

    // Recent tests formatted (newest first)
    const recentTests = [...tests].reverse().slice(0, 15).map((t) => ({
      id: t.id,
      date: new Date(t.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      mode: t.mode,
      difficulty: t.difficulty,
      passageTitle: t.passage?.title || "Custom Passage",
      wpm: t.result?.wpm || 0,
      accuracy: t.result?.accuracy || 0,
      duration: t.result?.duration || t.durationSeconds,
      errors: t.result?.errors || 0,
      consistency: t.result?.consistency || 90,
    }));

    return NextResponse.json({
      overview: {
        avgWpm,
        bestWpm,
        avgAccuracy,
        bestAccuracy,
        totalTests,
        totalTypingTime,
        currentStreak: profile?.currentStreak || 0,
        bestStreak: profile?.bestStreak || 0,
      },
      chartData,
      difficultyBreakdown,
      recentTests,
      user: {
        id: targetUserId,
        username: user.username,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: "Failed to load dashboard data" }, { status: 500 });
  }
}
