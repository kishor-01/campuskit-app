// src/app/api/auth/verify-email-change/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { logSecurityEvent } from '@/lib/audit-logger';
import { sendEmailChangeAlert } from '@/lib/email';
import { invalidateAllSessions } from '@/lib/session-utils';

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token');
    if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 });

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    // Find request
    const rows: any = await prisma.$queryRaw`
      SELECT id, user_id, old_email, new_email FROM email_change_requests WHERE token_hash = ${tokenHash} AND expires_at > NOW() LIMIT 1
    `;
    const reqRow = rows?.[0];
    if (!reqRow) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });

    // Update user's email
    await prisma.user.update({ where: { id: reqRow.user_id }, data: { email: reqRow.new_email } });

    // Delete change request
    await prisma.$executeRaw`
      DELETE FROM email_change_requests WHERE id = ${reqRow.id}
    `;

    // Invalidate sessions
    await invalidateAllSessions(reqRow.user_id);

    // Send notification to old email
    try {
      const notifyRes = await sendEmailChangeAlert(reqRow.old_email, `${process.env.NEXTAUTH_URL || ''}`);
      // ignore errors
    } catch (err) {}

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || null;
  await logSecurityEvent('EMAIL_CHANGED', { oldEmail: reqRow.old_email, newEmail: reqRow.new_email }, reqRow.user_id, ip, req.headers.get('user-agent') || null);

    return NextResponse.json({ success: true, message: 'Email changed successfully' });
  } catch (err) {
    console.error('verify-email-change error:', err);
    return NextResponse.json({ error: 'Failed to verify email change' }, { status: 500 });
  }
}
