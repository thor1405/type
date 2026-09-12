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

    if (random) {
      const count = await prisma.typingPassage.count({ where });
      if (count === 0) {
        return NextResponse.json({ error: "No passages found" }, { status: 404 });
      }
      const randomSkip = Math.floor(Math.random() * count);
      const passage = await prisma.typingPassage.findFirst({
        where,
        skip: randomSkip,
      });
      return NextResponse.json({ passage });
    }

    const limit = Math.min(Number(searchParams.get("limit") || 50), 100);
    const passages = await prisma.typingPassage.findMany({
      where,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ passages });
  } catch (error) {
    console.error("Error fetching passages:", error);
    return NextResponse.json({ error: "Failed to fetch passages" }, { status: 500 });
  }
}
