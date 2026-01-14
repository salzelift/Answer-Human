"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/auth-context";
import { authApi } from "@/lib/api/auth";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle2, Loader2, KeyRound } from "lucide-react";

type ForgotPasswordStep = "email" | "otp" | "newPassword" | "success";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isLoading } = useAuth();

  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot password modal state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<ForgotPasswordStep>("email");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotUserId, setForgotUserId] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // OTP state
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const redirectTo = searchParams.get("redirect") || "/post";
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, searchParams]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email, password });
      const redirectTo = searchParams.get("redirect") || "/post";
      router.push(redirectTo);
    } catch (err: any) {
      if (err.response?.data?.requiresVerification) {
        // User needs to verify email first
        setError("Please verify your email before logging in. Check your inbox for the verification code.");
      } else {
        setError(err.response?.data?.error || "Login failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Forgot Password Handlers
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");

    if (!forgotEmail) {
      setForgotError("Please enter your email");
      return;
    }

    setIsForgotSubmitting(true);
    try {
      const response = await authApi.forgotPassword(forgotEmail);
      if (response.userId) {
        setForgotUserId(response.userId);
      }
      setForgotPasswordStep("otp");
      setCountdown(60);
      setForgotSuccess("If an account exists with this email, a reset code has been sent.");
    } catch (err: any) {
      setForgotError(err.response?.data?.error || "Failed to send reset code. Please try again.");
    } finally {
      setIsForgotSubmitting(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
    } else {
      const newOtp = [...otp];
      newOtp[index] = value.replace(/\D/g, "");
      setOtp(newOtp);

      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");

    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setForgotError("Please enter the complete 6-digit code");
      return;
    }

    if (!forgotUserId) {
      setForgotError("Something went wrong. Please try again.");
      return;
    }

    setIsForgotSubmitting(true);
    try {
      const response = await authApi.verifyForgotPasswordOTP({ userId: forgotUserId, otp: otpCode });
      setResetToken(response.resetToken);
      setForgotPasswordStep("newPassword");
      setForgotSuccess("OTP verified! Please enter your new password.");
    } catch (err: any) {
      setForgotError(err.response?.data?.error || "Invalid code. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsForgotSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");

    if (!newPassword || !confirmNewPassword) {
      setForgotError("Please fill in both password fields");
      return;
    }

    if (newPassword.length < 6) {
      setForgotError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setForgotError("Passwords do not match");
      return;
    }

    if (!forgotUserId) {
      setForgotError("Something went wrong. Please try again.");
      return;
    }

    setIsForgotSubmitting(true);
    try {
      await authApi.resetPassword({ 
        userId: forgotUserId, 
        newPassword,
        resetToken: resetToken || undefined 
      });
      setForgotPasswordStep("success");
    } catch (err: any) {
      setForgotError(err.response?.data?.error || "Failed to reset password. Please try again.");
    } finally {
      setIsForgotSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (!forgotUserId || countdown > 0) return;

    setIsResending(true);
    setForgotError("");
    try {
      await authApi.resendForgotPasswordOTP(forgotUserId);
      setForgotSuccess("Reset code resent successfully!");
      setCountdown(60);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setForgotError(err.response?.data?.error || "Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const resetForgotPasswordModal = () => {
    setShowForgotPassword(false);
    setForgotPasswordStep("email");
    setForgotEmail("");
    setForgotUserId(null);
    setResetToken(null);
    setNewPassword("");
    setConfirmNewPassword("");
    setForgotError("");
    setForgotSuccess("");
    setOtp(["", "", "", "", "", ""]);
    setCountdown(0);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-20 flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
          <CardDescription className="text-center">
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <span className="text-gray-600">Don&apos;t have an account? </span>
            <Link
              href={`/register${searchParams.get("redirect") ? `?redirect=${searchParams.get("redirect")}` : ""}`}
              className="text-primary hover:underline"
            >
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPassword} onOpenChange={(open) => !open && resetForgotPasswordModal()}>
        <DialogContent className="sm:max-w-md">
          {forgotPasswordStep === "email" && (
            <>
              <DialogHeader>
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <KeyRound className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <DialogTitle className="text-center">Forgot Password?</DialogTitle>
                <DialogDescription className="text-center">
                  Enter your email and we&apos;ll send you a code to reset your password.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 mt-4">
                {forgotError && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    {forgotError}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">Email</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="your@email.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    disabled={isForgotSubmitting}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isForgotSubmitting}
                >
                  {isForgotSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Code"
                  )}
                </Button>
              </form>
            </>
          )}

          {forgotPasswordStep === "otp" && (
            <>
              <DialogHeader>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-fit mb-2"
                  onClick={() => setForgotPasswordStep("email")}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <DialogTitle className="text-center">Enter Reset Code</DialogTitle>
                <DialogDescription className="text-center">
                  We&apos;ve sent a 6-digit code to <strong>{forgotEmail}</strong>
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleVerifyOtp} className="space-y-6 mt-4">
                {forgotError && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    {forgotError}
                  </div>
                )}
                {forgotSuccess && (
                  <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    {forgotSuccess}
                  </div>
                )}

                <div className="flex justify-center gap-2">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-12 text-center text-xl font-semibold"
                      disabled={isForgotSubmitting}
                    />
                  ))}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isForgotSubmitting || otp.join("").length !== 6}
                >
                  {isForgotSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Code"
                  )}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <Button
                  variant="link"
                  onClick={handleResendOtp}
                  disabled={countdown > 0 || isResending}
                  className="text-primary"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Resending...
                    </>
                  ) : countdown > 0 ? (
                    `Resend code in ${countdown}s`
                  ) : (
                    "Resend code"
                  )}
                </Button>
              </div>
            </>
          )}

          {forgotPasswordStep === "newPassword" && (
            <>
              <DialogHeader>
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                    <KeyRound className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <DialogTitle className="text-center">Set New Password</DialogTitle>
                <DialogDescription className="text-center">
                  Please enter your new password
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleResetPassword} className="space-y-4 mt-4">
                {forgotError && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    {forgotError}
                  </div>
                )}
                {forgotSuccess && (
                  <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    {forgotSuccess}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={isForgotSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                  <Input
                    id="confirm-new-password"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                    disabled={isForgotSubmitting}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isForgotSubmitting}
                >
                  {isForgotSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>
            </>
          )}

          {forgotPasswordStep === "success" && (
            <>
              <DialogHeader>
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <DialogTitle className="text-center">Password Reset Successfully!</DialogTitle>
                <DialogDescription className="text-center">
                  You can now sign in with your new password.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4">
                <Button
                  className="w-full"
                  onClick={resetForgotPasswordModal}
                >
                  Back to Sign In
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
