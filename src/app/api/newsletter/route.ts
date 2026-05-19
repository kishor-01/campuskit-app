import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendNewsletterWelcome } from '@/lib/email';
import rateLimit from '@/lib/rateLimiter';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ message: 'Invalid email' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: 'Invalid email' }, { status: 400 });
    }

    // Rate-limit by email to avoid abuse (5 requests per minute by default)
    const rl = await rateLimit(`newsletter:${email}`, 5, 60);
    if (rl.limited) {
      return NextResponse.json({ message: 'Too many requests, try later' }, { status: 429 });
    }

    // Upsert subscriber to avoid duplicates and to allow future confirmation workflow
    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
    if (existing) {
      // Keep behaviour idempotent and safe from enumeration
      return NextResponse.json({ message: 'Already subscribed' });
    }

    // Create a confirm token (optional) — use a short random token if you plan to confirm
    const confirmToken = Math.random().toString(36).slice(2, 8);

    const subscriber = await prisma.newsletterSubscriber.create({
      data: {
        email,
        confirmToken,
        confirmed: false,
      },
    });

    // Send a welcome/confirmation email if configured (best-effort)
    try {
      const confirmUrl = `${process.env.NEXTAUTH_URL}/api/newsletter/confirm?token=${confirmToken}&email=${encodeURIComponent(email)}`;
      await sendNewsletterWelcome(email, confirmUrl);
    } catch (e) {
      console.error('Newsletter email error:', e);
    }

    return NextResponse.json({ message: 'Subscribed successfully' });
  } catch (e) {
    console.error('Newsletter POST error:', e);
    return NextResponse.json({ message: 'Failed to subscribe' }, { status: 500 });
  }
}
