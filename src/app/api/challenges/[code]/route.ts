import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/jwt";

export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  try {
    const code = params.code.toUpperCase();
    const challenge = await prisma.challenge.findUnique({
      where: { code },
      include: {
        creator: { select: { username: true, avatar: true } },
        attempts: {
          orderBy: { wpm: "desc" },
          include: {
            user: { select: { username: true, avatar: true } },
          },
        },
      },
    });

    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found or expired." }, { status: 404 });
    }

    const isExpired = challenge.expiresAt ? new Date() > new Date(challenge.expiresAt) : false;

    return NextResponse.json({
      challenge: {
        id: challenge.id,
        code: challenge.code,
        title: challenge.title,
        creator: challenge.creator.username,
        creatorAvatar: challenge.creator.avatar,
        passageText: challenge.passageText,
        difficulty: challenge.difficulty,
        durationSeconds: challenge.durationSeconds,
        targetWpm: challenge.targetWpm,
        createdAt: challenge.createdAt,
        expiresAt: challenge.expiresAt,
        isExpired,
        attempts: challenge.attempts.map((att, idx) => ({
          id: att.id,
          username: att.username,
          avatar: att.avatar,
          wpm: att.wpm,
          accuracy: att.accuracy,
          durationSeconds: att.durationSeconds,
          errors: att.errors,
          rank: idx + 1,
          createdAt: att.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Challenge detail GET error:", error);
    return NextResponse.json({ error: "Failed to fetch challenge" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  try {
    const code = params.code.toUpperCase();
    const user = await getCurrentUser();
    const body = await req.json();

    const {
      wpm,
      rawCpm,
      accuracy,
      durationSeconds = 30,
      errors = 0,
      guestUsername = "Guest Challenger",
    } = body;

    const challenge = await prisma.challenge.findUnique({
      where: { code },
      include: { attempts: true },
    });

    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found." }, { status: 404 });
    }

    if (challenge.expiresAt && new Date() > new Date(challenge.expiresAt)) {
      return NextResponse.json({ error: "This challenge has expired." }, { status: 400 });
    }

    const username = user?.username || guestUsername;
    const avatar = user?.avatar || "default";

    const attempt = await prisma.challengeAttempt.create({
      data: {
        challengeId: challenge.id,
        userId: user?.id || null,
        username,
        avatar,
        wpm: Math.round(wpm * 10) / 10,
        rawCpm: Math.round(rawCpm * 10) / 10,
        accuracy: Math.round(accuracy * 10) / 10,
        durationSeconds: Math.round(durationSeconds),
        errors,
      },
    });

    // Calculate new rank
    const allAttempts = await prisma.challengeAttempt.findMany({
      where: { challengeId: challenge.id },
      orderBy: { wpm: "desc" },
    });

    const rank = allAttempts.findIndex((a) => a.id === attempt.id) + 1;

    return NextResponse.json({ success: true, attempt, rank });
  } catch (error) {
    console.error("Challenge attempt POST error:", error);
    return NextResponse.json({ error: "Failed to submit challenge attempt" }, { status: 500 });
  }
}
