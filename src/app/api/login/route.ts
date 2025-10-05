
//src/app/api/login/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { signIn } from '@/auth';
// We no longer need to import AuthError

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    await signIn('credentials', { email, password, redirect: false });
    return NextResponse.json({ success: true, message: 'Login successful!' });
  } catch (error) {
    // This is the updated, more robust error check that we know works
    if (error && typeof error === 'object' && 'type' in error) {
      switch ((error as { type: string }).type) {
        case 'CredentialsSignin':
          return NextResponse.json({ success: false, message: 'Invalid email or password.' }, { status: 401 });
        default:
          return NextResponse.json({ success: false, message: 'Something went wrong.' }, { status: 500 });
      }
    }
    // For any other unexpected errors
    throw error;
  }
}