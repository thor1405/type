import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const test = await prisma.typingTest.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { username: true, avatar: true } },
        passage: true,
        result: true,
      },
    });

    if (!test || !test.result) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 });
    }

    let timeline = [];
    try {
      timeline = JSON.parse(test.result.timelineJson);
    } catch {
      timeline = [];
    }

    return NextResponse.json({
      result: {
        id: test.id,
        username: test.user?.username || "Guest Typist",
        avatar: test.user?.avatar || "default",
        mode: test.mode,
        difficulty: test.difficulty,
        durationSeconds: test.durationSeconds,
        wpm: test.result.wpm,
        rawCpm: test.result.rawCpm,
        accuracy: test.result.accuracy,
        charactersTyped: test.result.charactersTyped,
        correctChars: test.result.correctChars,
        incorrectChars: test.result.incorrectChars,
        errors: test.result.errors,
        duration: test.result.duration,
        consistency: test.result.consistency,
        passageTitle: test.passage?.title || "Typing Passage",
        passageText: test.passage?.text || "",
        timeline,
        createdAt: test.createdAt,
      },
    });
  } catch (error) {
    console.error("Result API error:", error);
    return NextResponse.json({ error: "Failed to fetch result" }, { status: 500 });
  }
}
