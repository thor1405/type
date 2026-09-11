import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const difficulty = searchParams.get("difficulty");
    const category = searchParams.get("category");
    const random = searchParams.get("random") === "true";

    const where: any = {};
    if (difficulty && difficulty !== "ALL") {
      where.difficulty = difficulty.toUpperCase();
    }
    if (category && category !== "ALL") {
      where.category = category;
    }

    const passages = await prisma.typingPassage.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    if (random && passages.length > 0) {
      const selected = passages[Math.floor(Math.random() * passages.length)];
      return NextResponse.json({ passage: selected });
    }

    return NextResponse.json({ passages });
  } catch (error) {
    console.error("Error fetching passages:", error);
    return NextResponse.json({ error: "Failed to fetch passages" }, { status: 500 });
  }
}
