// src/app/api/check-username/route.ts
// Real-time username availability endpoint.
// Rate-limited, no auth required (public — needed before account creation).

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimiter";
import { headers } from "next/headers";

const USERNAME_RE = /^[a-z0-9_]{3,30}$/;

export async function GET(req: NextRequest) {
  const reqHeaders = await headers();
  const ip =
    reqHeaders.get("x-forwarded-for") ||
    reqHeaders.get("x-real-ip") ||
    "unknown";

  // 30 checks per minute per IP — generous for typing, tight enough to stop scraping
  const rl = await rateLimit(`check-username:${ip}`, 30, 60);
  if (rl.limited) {
    return NextResponse.json(
      { available: false, error: "Too many requests" },
      { status: 429 }
    );
  }

  const username = req.nextUrl.searchParams.get("username")?.toLowerCase().trim();

  if (!username || !USERNAME_RE.test(username)) {
    return NextResponse.json(
      { available: false, error: "Invalid username format" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  return NextResponse.json({ available: !existing });
}
