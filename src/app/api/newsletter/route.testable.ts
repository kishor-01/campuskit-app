import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { sendNewsletterWelcome } from '../../../lib/email';
import rateLimit from '../../../lib/rateLimiter';

// A thin testable wrapper that uses relative imports so test runners without path alias
// support can import the handler directly. This file mirrors `route.ts` behaviour.
export async function POST(req: any) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ message: 'Invalid email' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: 'Invalid email' }, { status: 400 });
    }

    const rl = await rateLimit(`newsletter:${email}`, 5, 60);
    if (rl.limited) {
      return NextResponse.json({ message: 'Too many requests, try later' }, { status: 429 });
    }

    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ message: 'Already subscribed' });
    }

    const confirmToken = Math.random().toString(36).slice(2, 8);

    await prisma.newsletterSubscriber.create({
      data: {
        email,
        confirmToken,
        confirmed: false,
      },
    });

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
