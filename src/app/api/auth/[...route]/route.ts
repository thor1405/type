import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { comparePassword, hashPassword, signToken, verifyToken } from "@/lib/auth/jwt";

export async function GET(req: NextRequest, { params }: { params: { route: string[] } }) {
  const route = params.route?.[0];

  if (route === "me") {
    const token = req.cookies.get("typerush_session")?.value;
    if (!token) {
      return NextResponse.json({ user: null });
    }

    const payload = verifyToken(token);
    if (!payload?.id) {
      return NextResponse.json({ user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        role: true,
      },
    });

    return NextResponse.json({ user: user || null });
  }

  return NextResponse.json({ error: "Route not found" }, { status: 404 });
}

export async function POST(req: NextRequest, { params }: { params: { route: string[] } }) {
  const route = params.route?.[0];
  const body = await req.json().catch(() => ({}));

  if (route === "login") {
    const { email, password } = body;
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Check password if provided, or allow demo accounts with simple pass
    if (password && !comparePassword(password, user.passwordHash)) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const sessionUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      role: user.role,
    };

    const token = signToken(sessionUser);
    const response = NextResponse.json({ success: true, user: sessionUser });

    response.cookies.set("typerush_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  }

  if (route === "signup") {
    const { username, email, password } = body;
    if (!username || !email) {
      return NextResponse.json({ error: "Username and email are required" }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with that email or username already exists." },
        { status: 400 }
      );
    }

    const avatars = ["neon-cyan", "emerald-glow", "amber-flame", "purple-cyber", "crimson-rush"];
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash: hashPassword(password || "password123"),
        avatar: randomAvatar,
        role: "USER",
        profile: {
          create: {
            bio: "Typing enthusiast on TypeRush.",
            keyboard: "Mechanical Keyboard",
            theme: "dark",
            soundTheme: "mechanical",
          },
        },
      },
    });

    const sessionUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      role: user.role,
    };

    const token = signToken(sessionUser);
    const response = NextResponse.json({ success: true, user: sessionUser });

    response.cookies.set("typerush_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  }

  if (route === "logout") {
    const response = NextResponse.json({ success: true });
    response.cookies.delete("typerush_session");
    return response;
  }

  return NextResponse.json({ error: "Route not found" }, { status: 404 });
}
