// src/app/signup/verify-otp/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Mail, Clock, ArrowLeft } from 'lucide-react';

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const searchParams = useSearchParams();
  const router = useRouter();

  const email = searchParams.get('email');

  useEffect(() => {
    if (!email) {
      router.push('/signup');
    }
  }, [email, router]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const pastedOtp = pastedData.slice(0, 6).split('');
    
    if (pastedOtp.every(char => /^\d?$/.test(char))) {
      const newOtp = [...otp];
      pastedOtp.forEach((char, index) => {
        if (index < 6) newOtp[index] = char;
      });
      setOtp(newOtp);
      
      // Focus the last filled input or the last one
      const lastFilledIndex = pastedOtp.findIndex(char => !char) - 1;
      const focusIndex = lastFilledIndex >= 0 ? lastFilledIndex : Math.min(5, pastedOtp.length - 1);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setMessage({ text: 'Please enter the 6-digit OTP', type: 'error' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code: otpCode,
          type: 'SIGNUP',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ text: 'Email verified successfully!', type: 'success' });
        setTimeout(() => {
          router.push('/login?verified=true');
        }, 1500);
      } else {
        setMessage({ text: data.error || 'Verification failed', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Something went wrong. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          type: 'SIGNUP',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ text: 'OTP sent successfully!', type: 'success' });
        setCountdown(60); // 60 seconds countdown
      } else {
        setMessage({ text: data.error || 'Failed to send OTP', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Failed to resend OTP', type: 'error' });
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left Section */}
      <motion.div
        className="bg-primary text-primary-foreground p-12 flex flex-col justify-center"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div>
          <Link href="/signup" className="inline-flex items-center text-sm opacity-80 hover:opacity-100 mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign Up
          </Link>
          <motion.h1
            className="text-4xl font-bold mb-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Verify Your Email
          </motion.h1>
          <motion.p
            className="text-lg opacity-80"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            We've sent a 6-digit verification code to your email address.
          </motion.p>
        </div>
      </motion.div>

      {/* Right Section */}
      <div className="p-12 flex items-center justify-center">
        <motion.div
          className="w-full max-w-md"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {/* Email Display */}
          <div className="bg-muted/30 rounded-lg p-4 mb-8">
            <div className="flex items-center justify-center space-x-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{email}</span>
            </div>
          </div>

          {/* OTP Form */}
          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Enter Verification Code
              </label>
              <div className="flex justify-between space-x-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-12 text-center text-lg font-semibold bg-background border border-muted rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors"
                    autoFocus={index === 0}
                  />
                ))}
              </div>
            </div>

            {/* Message Display */}
            {message.text && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  message.type === 'success'
                    ? 'bg-green-500/10 text-green-600 border border-green-500/20'
                    : 'bg-red-500/10 text-red-600 border border-red-500/20'
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Verify Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>

            {/* Resend OTP Section */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Didn't receive the code?
              </p>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendLoading || countdown > 0}
                className="text-primary font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendLoading ? (
                  'Sending...'
                ) : countdown > 0 ? (
                  <span className="flex items-center justify-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Resend in {countdown}s
                  </span>
                ) : (
                  'Resend OTP'
                )}
              </button>
            </div>
          </form>

          {/* Support Link */}
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              Having trouble?{' '}
              <Link href="/contact" className="font-medium text-primary hover:underline">
                Contact Support
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}