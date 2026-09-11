import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/jwt";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    const {
      passageId,
      mode = "SOLO",
      difficulty = "MEDIUM",
      durationSeconds = 30,
      wpm,
      rawCpm,
      accuracy,
      charactersTyped,
      correctChars,
      incorrectChars,
      errors,
      duration,
      consistency = 90.0,
      timeline = [],
    } = body;

    let personalBestDiff = 0;
    let isNewBest = false;
    const newAchievements: any[] = [];

    // Calculate Personal Best comparison if user is logged in
    if (user?.id) {
      const pastBest = await prisma.testResult.findFirst({
        where: {
          test: {
            userId: user.id,
          },
        },
        orderBy: { wpm: "desc" },
      });

      if (pastBest) {
        personalBestDiff = Math.round((wpm - pastBest.wpm) * 10) / 10;
        if (wpm > pastBest.wpm) {
          isNewBest = true;
        }
      } else {
        isNewBest = true;
      }
    }

    // Create the test record
    const test = await prisma.typingTest.create({
      data: {
        userId: user?.id || null,
        passageId: passageId || null,
        mode,
        difficulty,
        durationSeconds: Math.round(durationSeconds),
        result: {
          create: {
            wpm: Math.round(wpm * 10) / 10,
            rawCpm: Math.round(rawCpm * 10) / 10,
            accuracy: Math.round(accuracy * 10) / 10,
            charactersTyped,
            correctChars,
            incorrectChars,
            errors,
            duration: Math.round(duration * 10) / 10,
            consistency: Math.round(consistency * 10) / 10,
            timelineJson: JSON.stringify(timeline),
          },
        },
      },
      include: {
        result: true,
      },
    });

    // If logged in, update stats, streak, and check achievements
    if (user?.id) {
      // 1. Update Profile typing time and streak
      const profile = await prisma.profile.findUnique({
        where: { userId: user.id },
      });

      if (profile) {
        const now = new Date();
        const lastActive = new Date(profile.lastActiveAt);
        const diffDays = Math.floor(
          (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
        );

        let newStreak = profile.currentStreak;
        if (diffDays === 1) {
          newStreak += 1;
        } else if (diffDays > 1) {
          newStreak = 1;
        } else if (newStreak === 0) {
          newStreak = 1;
        }

        await prisma.profile.update({
          where: { userId: user.id },
          data: {
            totalTypingTime: { increment: Math.round(duration) },
            currentStreak: newStreak,
            bestStreak: Math.max(newStreak, profile.bestStreak),
            lastActiveAt: now,
          },
        });
      }

      // 2. Check and unlock achievements
      const allAchievements = await prisma.achievement.findMany();
      const existingUserAchievements = await prisma.userAchievement.findMany({
        where: { userId: user.id },
      });
      const unlockedIds = new Set(existingUserAchievements.map((ua) => ua.achievementId));

      const totalCompletedTests = await prisma.typingTest.count({
        where: { userId: user.id },
      });

      for (const ach of allAchievements) {
        if (unlockedIds.has(ach.id)) continue;

        let unlock = false;
        if (ach.code === "FIRST_TEST" && totalCompletedTests >= 1) unlock = true;
        if (ach.code === "SPEED_50" && wpm >= 50) unlock = true;
        if (ach.code === "SPEED_75" && wpm >= 75) unlock = true;
        if (ach.code === "SPEED_100" && wpm >= 100) unlock = true;
        if (ach.code === "SPEED_120" && wpm >= 120) unlock = true;
        if (ach.code === "ACCURACY_95" && accuracy >= 95 && duration >= 15) unlock = true;
        if (ach.code === "ACCURACY_99" && accuracy >= 99 && duration >= 15) unlock = true;
        if (ach.code === "CENTURION" && totalCompletedTests >= 100) unlock = true;
        if (ach.code === "MULTIPLAYER_WIN" && mode === "MULTIPLAYER") unlock = true;

        if (unlock) {
          await prisma.userAchievement.create({
            data: {
              userId: user.id,
              achievementId: ach.id,
            },
          });
          newAchievements.push(ach);
        }
      }
    }

    return NextResponse.json({
      success: true,
      testId: test.id,
      result: test.result,
      personalBestDiff,
      isNewBest,
      newAchievements,
    });
  } catch (error) {
    console.error("Error saving test result:", error);
    return NextResponse.json({ error: "Failed to save test result" }, { status: 500 });
  }
}
