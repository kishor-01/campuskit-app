// src/app/verify-email/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useActionState } from "react";
import { startTransition } from "react";
import { verifyOtp, resendOtp, sendInitialOtp } from "@/actions/authActions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail, Clock } from "lucide-react";
import toast from "react-hot-toast";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  
  // Get email from URL params first, fallback to session
  const urlEmail = searchParams.get("email") || "";
  const sessionEmail = session?.user?.email || "";
  const email = urlEmail || sessionEmail;
  const newUser = searchParams.get("newUser") === "true"; // Flag to indicate new signup vs post-login verification
  
  const [otp, setOtp] = useState(["", "", "", "", "", ""]); // 6-digit OTP
  const [verifyState, verifyDispatch] = useActionState(verifyOtp, undefined);
  const [resendState, resendDispatch] = useActionState(resendOtp, undefined);
  const [initState, initDispatch] = useActionState(sendInitialOtp, undefined);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [otpSentMessage, setOtpSentMessage] = useState(false);

  // Initialize - send initial OTP on page load
  useEffect(() => {
    if (email && isInitializing) {
      setIsInitializing(false);
      console.log('[VERIFY-EMAIL] Sending initial OTP to:', email);
      // Trigger initial OTP send via sendInitialOtp (no cooldown)
      startTransition(() => {
        const formData = new FormData();
        formData.append("email", email);
        initDispatch(formData);
      });
    }
  }, [email, isInitializing, initDispatch]);

  // Monitor initial OTP state
  useEffect(() => {
    if (initState?.success) {
      console.log('[VERIFY-EMAIL] Initial OTP sent successfully');
      setOtpSentMessage(true);
      // Don't show toast on initial load - just update message flag
    } else if (initState?.message && !initState?.success) {
      console.error('[VERIFY-EMAIL] Initial OTP failed:', initState.message);
      toast.error(initState.message || "Failed to send OTP.");
    }
  }, [initState]);

  // Countdown for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Monitor verify state for success/error
  useEffect(() => {
    setIsVerifying(false);
    if (verifyState?.success) {
      console.log('[VERIFY-EMAIL] OTP verification successful');
      toast.success(verifyState.message || "Email verified successfully!");
      
      // Hard reload to force session refresh and break any middleware loops
      // This ensures the session is freshly loaded from the server
      console.log('[VERIFY-EMAIL] Performing hard reload...');
      
      // Wait a bit for toast to show, then do hard reload
      setTimeout(() => {
        // Hard reload with window.location.href forces a full page refresh
        // This reloads middleware which will check emailVerified status and allow access
        window.location.href = (verifyState as any).redirectUrl || "/";
      }, 1500);
    } else if (verifyState?.message && !verifyState?.success) {
      console.error('[VERIFY-EMAIL] OTP verification failed:', verifyState.message);
      toast.error(verifyState.message || "Invalid OTP");
      setOtp(["", "", "", "", "", ""]);
      const firstInput = document.getElementById("otp-0");
      firstInput?.focus();
    }
  }, [verifyState]);

  // Monitor resend state for success/error
  useEffect(() => {
    if (resendState?.success) {
      console.log('[VERIFY-EMAIL] OTP resent successfully');
      toast.success(resendState.message || "Verification code sent to your email.");
      setResendCooldown(60); // 60 seconds cooldown
      setOtp(["", "", "", "", "", ""]); // Clear OTP inputs on successful resend
    } else if (resendState?.message && !resendState?.success) {
      console.error('[VERIFY-EMAIL] OTP resend failed:', resendState.message);
      toast.error(resendState.message || "Failed to resend OTP.");
    }
  }, [resendState]);

  // Handle Input logic
  const handleChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    
    if (code.length < 6) {
      toast.error("Please enter the full 6-digit code.");
      return;
    }

    if (!email) {
      toast.error("Email not found. Please log in again.");
      return;
    }

    console.log('[VERIFY-EMAIL] User submitted OTP for email:', email);
    
    // Wrap dispatch in startTransition
    setIsVerifying(true);
    startTransition(() => {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("code", code);
      verifyDispatch(formData);
    });
  };

  // Resend OTP handler - uses server action to automatically fetch email from session if needed
  const handleResendOtp = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Email not found. Please log in again.");
      return;
    }
    
    console.log('[VERIFY-EMAIL] User requested OTP resend');
    
    // Wrap dispatch in startTransition
    startTransition(() => {
      const formData = new FormData();
      formData.append("email", email);
      resendDispatch(formData);
    });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50/50 p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Mail className="text-primary w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a 6-digit code to <span className="font-semibold text-slate-900">{email || "your email"}</span>
            {otpSentMessage && <span className="text-xs text-green-600 mt-2 block">✓ Verification code sent</span>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="flex justify-between gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-background"
                  disabled={isVerifying}
                />
              ))}
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 text-lg font-medium" 
              disabled={isVerifying}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
                </>
              ) : (
                "Verify Account"
              )}
            </Button>

            <div className="flex flex-col gap-3">
              <p className="text-center text-sm text-muted-foreground mt-4">
                Didn't receive a code?{" "}
              </p>
              <button 
                type="button" 
                className="flex items-center justify-center gap-2 w-full px-4 py-2 text-primary font-semibold hover:underline decoration-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                disabled={resendCooldown > 0}
                onClick={handleResendOtp}
              >
                {resendCooldown > 0 ? (
                  <>
                    <Clock className="w-4 h-4" />
                    Resend in {resendCooldown}s
                  </>
                ) : (
                  <>
                    <Loader2 className={`w-4 h-4 ${resendState === undefined ? '' : 'hidden'} animate-spin`} />
                    Resend OTP
                  </>
                )}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
