// src/app/api/otp/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(request: NextRequest) {
  try {
    const { email, code, type = "SIGNUP" } = await request.json();
    if (!email || !code)
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });

    const normalizedEmail = email.trim().toLowerCase();

    const otpRecord = await prisma.otp.findFirst({
      where: { email: normalizedEmail, type, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });
    if (!otpRecord) return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });

    const valid = await bcrypt.compare(code, otpRecord.code);
    if (!valid) return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });

    await prisma.otp.delete({ where: { id: otpRecord.id } });

    // ✅ Create user or mark verified here
    let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      const username = normalizedEmail.split("@")[0] + "_" + Math.floor(Math.random() * 1000);
      const randomPass = await bcrypt.hash("defaultTempPass" + Date.now(), 10);
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          username,
          password: randomPass,
          emailVerified: new Date(),
          role: "VIEWER",
        },
      });
    } else if (!user.emailVerified) {
      await prisma.user.update({
        where: { email: normalizedEmail },
        data: { emailVerified: new Date() },
      });
    }

    return NextResponse.json({ success: true, message: "Email verified successfully" });
  } catch (err) {
    console.error("OTP Verify error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
