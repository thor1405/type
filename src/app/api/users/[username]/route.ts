import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/jwt";

export async function GET(req: NextRequest, { params }: { params: { username: string } }) {
  try {
    const user = await prisma.user.findUnique({
      where: { username: params.username },
      include: {
        profile: true,
        achievements: {
          include: {
            achievement: true,
          },
        },
        typingTests: {
          include: {
            result: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const allAchievements = await prisma.achievement.findMany();
    const unlockedMap = new Map(user.achievements.map((ua) => [ua.achievementId, ua.unlockedAt]));

    const achievementsWithStatus = allAchievements.map((ach) => ({
      ...ach,
      isUnlocked: unlockedMap.has(ach.id),
      unlockedAt: unlockedMap.get(ach.id) || null,
    }));

    const results = user.typingTests.map((t) => t.result).filter(Boolean);
    const totalTests = results.length;
    let avgWpm = 0;
    let bestWpm = 0;
    let avgAccuracy = 0;
    let bestAccuracy = 0;

    if (totalTests > 0) {
      const sumWpm = results.reduce((a, b) => a + (b?.wpm || 0), 0);
      const sumAcc = results.reduce((a, b) => a + (b?.accuracy || 0), 0);
      avgWpm = Math.round((sumWpm / totalTests) * 10) / 10;
      bestWpm = Math.max(...results.map((r) => r?.wpm || 0));
      avgAccuracy = Math.round((sumAcc / totalTests) * 10) / 10;
      bestAccuracy = Math.max(...results.map((r) => r?.accuracy || 0));
    }

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
      profile: user.profile,
      stats: {
        totalTests,
        avgWpm,
        bestWpm,
        avgAccuracy,
        bestAccuracy,
        totalTypingTime: user.profile?.totalTypingTime || 0,
        currentStreak: user.profile?.currentStreak || 0,
        bestStreak: user.profile?.bestStreak || 0,
      },
      achievements: achievementsWithStatus,
    });
  } catch (error) {
    console.error("User profile API error:", error);
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { username: string } }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.username !== params.username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { bio, keyboard, theme, soundTheme, avatar, username } = body;

    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        ...(avatar && { avatar }),
        ...(username && { username }),
        profile: {
          update: {
            ...(bio !== undefined && { bio }),
            ...(keyboard !== undefined && { keyboard }),
            ...(theme !== undefined && { theme }),
            ...(soundTheme !== undefined && { soundTheme }),
          },
        },
      },
      include: { profile: true },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("User profile PUT error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
