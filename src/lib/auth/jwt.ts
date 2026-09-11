import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import prisma from "../db";

const JWT_SECRET = process.env.JWT_SECRET || "typerush_super_secret_jwt_key_2026_production";

export interface SessionUser {
  id: string;
  email: string;
  username: string;
  avatar: string;
  role: string;
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function signToken(user: SessionUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionUser;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("typerush_session")?.value;
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload?.id) return null;

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

    return user || null;
  } catch {
    return null;
  }
}
