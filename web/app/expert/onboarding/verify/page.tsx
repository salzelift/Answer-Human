"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Home,
  Mail,
  Shield,
  Sparkles,
} from "lucide-react";

export default function ExpertOnboardingVerifyPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  const steps = [
    {
      icon: Mail,
      title: "Application Received",
      description: "We've got your application and it's in our queue",
      status: "completed",
    },
    {
      icon: Shield,
      title: "Profile Review",
      description: "Our team is verifying your credentials and experience",
      status: "in-progress",
    },
    {
      icon: CheckCircle2,
      title: "Approval & Activation",
      description: "Once approved, you'll get full access to expert features",
      status: "pending",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Success animation */}
          <div className="text-center mb-12">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse" />
              <div className="relative w-24 h-24 rounded-full bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/30">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
            </div>

            <h1 className="mt-8 text-3xl sm:text-4xl font-bold text-slate-900">
              Application Submitted!
            </h1>
            <p className="mt-4 text-lg text-slate-600 max-w-md mx-auto">
              Thank you for applying to become an expert. We&apos;re excited to have you join our community!
            </p>
          </div>

          {/* Timeline */}
          <Card className="border-0 shadow-xl rounded-2xl mb-8">
            <CardContent className="p-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">
                What happens next?
              </h2>

              <div className="space-y-6">
                {steps.map((step, index) => (
                  <div key={index} className="relative flex gap-4">
                    {/* Connector line */}
                    {index < steps.length - 1 && (
                      <div
                        className={`absolute left-5 top-10 w-0.5 h-full -ml-px ${
                          step.status === "completed" ? "bg-emerald-500" : "bg-slate-200"
                        }`}
                      />
                    )}

                    {/* Icon */}
                    <div
                      className={`relative shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        step.status === "completed"
                          ? "bg-emerald-600 text-white"
                          : step.status === "in-progress"
                          ? "bg-amber-100 text-amber-600 ring-4 ring-amber-50"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {step.status === "completed" ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : step.status === "in-progress" ? (
                        <Clock className="w-5 h-5" />
                      ) : (
                        <step.icon className="w-5 h-5" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-6">
                      <div className="flex items-center gap-2">
                        <h3
                          className={`font-semibold ${
                            step.status === "pending" ? "text-slate-400" : "text-slate-900"
                          }`}
                        >
                          {step.title}
                        </h3>
                        {step.status === "in-progress" && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                            In Progress
                          </span>
                        )}
                      </div>
                      <p
                        className={`mt-1 text-sm ${
                          step.status === "pending" ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Info card */}
          <Card className="border border-blue-200 bg-blue-50 rounded-2xl mb-8">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">
                    Estimated Review Time: 24-48 hours
                  </h3>
                  <p className="mt-1 text-sm text-blue-700">
                    We&apos;ll send you an email notification once your application has been reviewed. 
                    Make sure to check your inbox and spam folder.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button
                variant="outline"
                className="w-full sm:w-auto px-6 py-5 rounded-xl border-slate-300"
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <Link href="/explore">
              <Button className="w-full sm:w-auto px-6 py-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white">
                Explore Experts
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Additional info */}
          <p className="mt-8 text-center text-sm text-slate-500">
            Have questions?{" "}
            <Link href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Contact our support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
