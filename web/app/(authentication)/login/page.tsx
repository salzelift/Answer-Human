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
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  MessageSquare,
  Shield,
  Sparkles,
  Star,
  Users,
  Zap,
} from "lucide-react";

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
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string; requiresVerification?: boolean } } };
      if (error.response?.data?.requiresVerification) {
        setError("Please verify your email before logging in. Check your inbox for the verification code.");
      } else {
        setError(error.response?.data?.error || "Login failed. Please try again.");
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
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setForgotError(error.response?.data?.error || "Failed to send reset code. Please try again.");
    } finally {
      setIsForgotSubmitting(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
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
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setForgotError(error.response?.data?.error || "Invalid code. Please try again.");
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
        resetToken: resetToken || undefined,
      });
      setForgotPasswordStep("success");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setForgotError(error.response?.data?.error || "Failed to reset password. Please try again.");
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
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setForgotError(error.response?.data?.error || "Failed to resend code. Please try again.");
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-600" />
          <p className="mt-2 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  const stats = [
    { value: "50K+", label: "Questions answered" },
    { value: "2.5K+", label: "Verified experts" },
    { value: "98%", label: "Satisfaction rate" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left Panel - Branding */}
        <div className="hidden lg:flex flex-col relative overflow-hidden bg-emerald-600">
          {/* Background pattern */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500 rounded-full blur-3xl opacity-50" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-500 rounded-full blur-3xl opacity-30" />
            {/* Grid pattern */}
            <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          <div className="relative flex flex-col justify-between h-full px-12 py-12 text-white">
            {/* Logo */}
            <div>
              <Link href="/" className="inline-flex items-center gap-2">
                <span className="text-2xl font-bold">
                  Answer Human<span className="text-emerald-200">.</span>
                </span>
              </Link>
            </div>

            {/* Main content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm">The Knowledge Marketplace</span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                Welcome back to your{" "}
                <span className="text-emerald-200">expert network</span>
              </h1>

              <p className="text-lg text-emerald-100 max-w-md">
                Pick up where you left off. Your questions, your experts, your journey to knowledge.
              </p>

              {/* Features */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/10 border border-white/20">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold">Instant Connections</p>
                    <p className="text-sm text-emerald-100">Chat, call, or video with experts</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/10 border border-white/20">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold">Secure & Private</p>
                    <p className="text-sm text-emerald-100">Your data is always protected</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8">
              {stats.map((stat, index) => (
                <div key={index}>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-sm text-emerald-100">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="flex items-center justify-center px-4 py-12 bg-slate-50">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="lg:hidden text-center mb-8">
              <Link href="/" className="inline-flex items-center gap-2">
                <span className="text-2xl font-bold text-slate-900">
                  Answer Human<span className="text-emerald-600">.</span>
                </span>
              </Link>
            </div>

            <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-2xl bg-white">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-2xl font-bold text-center text-slate-900">
                  Sign in to your account
                </CardTitle>
                <CardDescription className="text-center text-slate-500">
                  Enter your credentials to continue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-red-600 text-xs">!</span>
                      </div>
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isSubmitting}
                        className="h-11 pl-10 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-slate-700">
                        Password
                      </Label>
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isSubmitting}
                        className="h-11 pl-10 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center text-sm">
                  <span className="text-slate-500">Don&apos;t have an account? </span>
                  <Link
                    href={`/register${searchParams.get("redirect") ? `?redirect=${searchParams.get("redirect")}` : ""}`}
                    className="text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Sign up for free
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Trust badges */}
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>50K+ Users</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog
        open={showForgotPassword}
        onOpenChange={(open) => !open && resetForgotPasswordModal()}
      >
        <DialogContent className="sm:max-w-md border-0 shadow-2xl rounded-2xl">
          {forgotPasswordStep === "email" && (
            <>
              <DialogHeader>
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl" />
                    <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                      <KeyRound className="h-10 w-10 text-white" />
                    </div>
                  </div>
                </div>
                <DialogTitle className="text-center text-2xl font-bold text-slate-900">
                  Forgot your password?
                </DialogTitle>
                <DialogDescription className="text-center text-slate-500">
                  No worries! Enter your email and we&apos;ll send you a reset code.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 mt-4">
                {forgotError && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                    {forgotError}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="forgot-email" className="text-slate-700">
                    Email address
                  </Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="john@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    disabled={isForgotSubmitting}
                    className="h-11 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
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
                  className="w-fit mb-2 text-slate-600"
                  onClick={() => setForgotPasswordStep("email")}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl" />
                    <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      <Mail className="h-10 w-10 text-white" />
                    </div>
                  </div>
                </div>
                <DialogTitle className="text-center text-2xl font-bold text-slate-900">
                  Check your email
                </DialogTitle>
                <DialogDescription className="text-center text-slate-500">
                  We sent a code to <span className="font-medium text-slate-700">{forgotEmail}</span>
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleVerifyOtp} className="space-y-6 mt-4">
                {forgotError && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                    {forgotError}
                  </div>
                )}
                {forgotSuccess && (
                  <div className="p-3 text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    {forgotSuccess}
                  </div>
                )}

                <div className="flex justify-center gap-2">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-14 text-center text-2xl font-bold border-2 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl"
                      disabled={isForgotSubmitting}
                    />
                  ))}
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
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
                <button
                  onClick={handleResendOtp}
                  disabled={countdown > 0 || isResending}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium disabled:text-slate-400"
                >
                  {isResending ? (
                    "Resending..."
                  ) : countdown > 0 ? (
                    `Resend code in ${countdown}s`
                  ) : (
                    "Resend code"
                  )}
                </button>
              </div>
            </>
          )}

          {forgotPasswordStep === "newPassword" && (
            <>
              <DialogHeader>
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl" />
                    <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                      <Lock className="h-10 w-10 text-white" />
                    </div>
                  </div>
                </div>
                <DialogTitle className="text-center text-2xl font-bold text-slate-900">
                  Create new password
                </DialogTitle>
                <DialogDescription className="text-center text-slate-500">
                  Your new password must be at least 6 characters
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleResetPassword} className="space-y-4 mt-4">
                {forgotError && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                    {forgotError}
                  </div>
                )}
                {forgotSuccess && (
                  <div className="p-3 text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    {forgotSuccess}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-slate-700">
                    New Password
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={isForgotSubmitting}
                    className="h-11 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-new-password" className="text-slate-700">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirm-new-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                    disabled={isForgotSubmitting}
                    className="h-11 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
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
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
                    <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                      <CheckCircle2 className="h-10 w-10 text-white" />
                    </div>
                  </div>
                </div>
                <DialogTitle className="text-center text-2xl font-bold text-slate-900">
                  Password reset successful!
                </DialogTitle>
                <DialogDescription className="text-center text-slate-500">
                  Your password has been changed. You can now sign in with your new password.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-6">
                <Button
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
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
