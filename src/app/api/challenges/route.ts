import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/jwt";

export async function GET() {
  try {
    const challenges = await prisma.challenge.findMany({
      include: {
        creator: { select: { username: true, avatar: true } },
        attempts: {
          orderBy: { wpm: "desc" },
          take: 5,
        },
        _count: { select: { attempts: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = challenges.map((c) => ({
      id: c.id,
      code: c.code,
      title: c.title,
      creator: c.creator.username,
      creatorAvatar: c.creator.avatar,
      difficulty: c.difficulty,
      durationSeconds: c.durationSeconds,
      targetWpm: c.targetWpm,
      participantsCount: c._count.attempts,
      bestWpm: c.attempts[0]?.wpm || c.targetWpm,
      createdAt: c.createdAt,
      expiresAt: c.expiresAt,
    }));

    return NextResponse.json({ challenges: formatted });
  } catch (error) {
    console.error("Challenges GET error:", error);
    return NextResponse.json({ error: "Failed to fetch challenges" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required to create challenges." }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      passageId,
      customText,
      difficulty = "MEDIUM",
      durationSeconds = 30,
      targetWpm = 70.0,
      expiresInDays = 7,
    } = body;

    let passageText = customText;
    let finalPassageId = passageId;

    if (passageId) {
      const p = await prisma.typingPassage.findUnique({ where: { id: passageId } });
      if (p) {
        passageText = p.text;
      }
    } else if (!passageText) {
      const p = await prisma.typingPassage.findFirst({ where: { difficulty } });
      if (p) {
        passageText = p.text;
        finalPassageId = p.id;
      } else {
        passageText = "The quick brown fox jumps over the lazy dog.";
      }
    }

    const code = "CHAL-" + Math.floor(10000 + Math.random() * 90000);
    const expiresAt = expiresInDays > 0 ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000) : null;

    const challenge = await prisma.challenge.create({
      data: {
        code,
        title: title || `${user.username}'s Typing Challenge`,
        creatorId: user.id,
        passageId: finalPassageId,
        passageText,
        difficulty,
        durationSeconds: Number(durationSeconds),
        targetWpm: Number(targetWpm),
        expiresAt,
      },
    });

    return NextResponse.json({ success: true, challenge });
  } catch (error) {
    console.error("Challenges POST error:", error);
    return NextResponse.json({ error: "Failed to create challenge" }, { status: 500 });
  }
}
