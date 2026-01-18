"use client";

import { useState, useEffect, useRef, Suspense } from "react";
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
  ArrowRight,
  CheckCircle2,
  Loader2,
  Mail,
  Shield,
  Sparkles,
  Zap,
  Globe,
  Star,
} from "lucide-react";

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading, login } = useAuth();

  // Registration state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OTP verification state
  const [showVerification, setShowVerification] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [countdown, setCountdown] = useState(0);
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

    if (!name || !email || !username || !password) {
      setError("All fields are required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authApi.initiateRegister({ name, email, username, password });
      if (response.userId) {
        setUserId(response.userId);
        setShowVerification(true);
        setCountdown(60);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
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
    setVerificationError("");

    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setVerificationError("Please enter the complete 6-digit code");
      return;
    }

    if (!userId) {
      setVerificationError("Something went wrong. Please try again.");
      return;
    }

    setIsVerifying(true);
    try {
      await authApi.verifyRegistration({ userId, otp: otpCode });
      // Auto-login after verification
      await login({ email, password });
      const redirectTo = searchParams.get("redirect") || "/post";
      router.push(redirectTo);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setVerificationError(error.response?.data?.error || "Invalid code. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (!userId || countdown > 0) return;

    setIsResending(true);
    setVerificationError("");
    try {
      await authApi.resendRegistrationOTP(userId);
      setCountdown(60);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setVerificationError(error.response?.data?.error || "Failed to resend code.");
    } finally {
      setIsResending(false);
    }
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

  const benefits = [
    { icon: Zap, text: "Get answers in minutes" },
    { icon: Shield, text: "Verified experts only" },
    { icon: Globe, text: "24/7 global access" },
    { icon: Star, text: "Satisfaction guaranteed" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left Panel - Branding */}
        <div className="hidden lg:flex flex-col relative overflow-hidden bg-slate-900 text-white">
          {/* Background effects */}
          <div className="absolute inset-0">
            <div className="absolute top-20 -left-20 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/5 rounded-full" />
          </div>

          <div className="relative flex flex-col justify-between h-full px-12 py-12">
            {/* Logo */}
            <div>
              <Link href="/" className="inline-flex items-center gap-2">
                <span className="text-2xl font-bold">
                  Answer Human<span className="text-emerald-400">.</span>
                </span>
              </Link>
            </div>

            {/* Main content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-sm">Join 50,000+ knowledge seekers</span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                Start your journey to{" "}
                <span className="text-emerald-400">expert knowledge</span>
              </h1>

              <p className="text-lg text-slate-300 max-w-md">
                Join a community where questions meet answers. Get personalized help from verified professionals.
              </p>

              {/* Benefits */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <benefit.icon className="w-5 h-5 text-emerald-400" />
                    </div>
                    <span className="text-sm text-slate-200">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {["JD", "MK", "SR", "AL"].map((initials, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-slate-900 flex items-center justify-center text-xs font-medium"
                    style={{
                      backgroundColor: ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b"][i],
                    }}
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-400">Trusted by experts worldwide</p>
              </div>
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
                  Create your account
                </CardTitle>
                <CardDescription className="text-center text-slate-500">
                  Enter your details to get started
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-red-600 text-xs">!</span>
                      </div>
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-700">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={isSubmitting}
                      className="h-11 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isSubmitting}
                      className="h-11 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-slate-700">
                      Username
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="johndoe"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      disabled={isSubmitting}
                      className="h-11 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-slate-700">
                        Password
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isSubmitting}
                        className="h-11 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-slate-700">
                        Confirm
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={isSubmitting}
                        className="h-11 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
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
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center text-sm">
                  <span className="text-slate-500">Already have an account? </span>
                  <Link
                    href={`/login${searchParams.get("redirect") ? `?redirect=${searchParams.get("redirect")}` : ""}`}
                    className="text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Sign in
                  </Link>
                </div>

                <p className="mt-4 text-xs text-center text-slate-400">
                  By creating an account, you agree to our{" "}
                  <Link href="#" className="underline hover:text-slate-600">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="#" className="underline hover:text-slate-600">
                    Privacy Policy
                  </Link>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* OTP Verification Dialog */}
      <Dialog open={showVerification} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md border-0 shadow-2xl rounded-2xl">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl" />
                <div className="relative h-20 w-20 rounded-full bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                  <Mail className="h-10 w-10 text-white" />
                </div>
              </div>
            </div>
            <DialogTitle className="text-center text-2xl font-bold text-slate-900">
              Verify your email
            </DialogTitle>
            <DialogDescription className="text-center text-slate-500">
              We&apos;ve sent a 6-digit code to{" "}
              <span className="font-medium text-slate-700">{email}</span>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleVerifyOtp} className="space-y-6 mt-4">
            {verificationError && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {verificationError}
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
                  disabled={isVerifying}
                />
              ))}
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium"
              disabled={isVerifying || otp.join("").length !== 6}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Verify Email
                </>
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-slate-500">
              Didn&apos;t receive the code?{" "}
              <button
                onClick={handleResendOtp}
                disabled={countdown > 0 || isResending}
                className="text-emerald-600 hover:text-emerald-700 font-medium disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                {isResending ? (
                  "Resending..."
                ) : countdown > 0 ? (
                  `Resend in ${countdown}s`
                ) : (
                  "Resend code"
                )}
              </button>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-600" />
            <p className="mt-2 text-slate-600">Loading...</p>
          </div>
        </div>
      }
    >
      <RegisterPageContent />
    </Suspense>
  );
}
