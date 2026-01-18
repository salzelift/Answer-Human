"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/auth-context";
import { providerOnboardingApi } from "@/lib/api/provider-onboarding";
import { getCategories } from "@/lib/get-categories";
import { Category } from "@/types/category.types";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Loader2,
  MapPin,
  Rocket,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  User,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";

type OnboardingStep = 1 | 2 | 3 | 4;

const DAYS_OF_WEEK = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const TIME_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

export default function ExpertOnboardingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    jobTitle: "",
    bio: "",
    location: "",
    linkedInUrl: "",
    twitterUrl: "",
    websiteUrl: "",

    // Step 2: Professional Details
    industry: "",
    yearsOfExperience: "",
    skills: [] as string[],
    certifications: "",

    // Step 3: Categories & Expertise
    selectedCategories: [] as string[],
    interests: [] as string[],

    // Step 4: Availability & Pricing
    availableDays: [] as string[],
    availableTimeStart: "09:00",
    availableTimeEnd: "17:00",
    hourlyRate: "",
  });

  const [skillInput, setSkillInput] = useState("");
  const [interestInput, setInterestInput] = useState("");

  // Check authentication and eligibility
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/expert/onboarding");
      return;
    }

    const checkEligibility = async () => {
      try {
        const result = await providerOnboardingApi.checkEligibility();
        if (result.isExpert) {
        router.push("/expert");
        }
      } catch (err) {
        console.error("Error checking eligibility:", err);
      }
    };

    if (isAuthenticated) {
      checkEligibility();
    }
  }, [isAuthenticated, authLoading, router]);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await getCategories();
        setCategories(cats);
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const addInterest = () => {
    if (interestInput.trim() && !formData.interests.includes(interestInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        interests: [...prev.interests, interestInput.trim()],
      }));
      setInterestInput("");
    }
  };

  const removeInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.filter((i) => i !== interest),
    }));
  };

  const toggleCategory = (categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(categoryId)
        ? prev.selectedCategories.filter((id) => id !== categoryId)
        : [...prev.selectedCategories, categoryId],
    }));
  };

  const toggleDay = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter((d) => d !== day)
        : [...prev.availableDays, day],
    }));
  };

  const validateStep = (step: OnboardingStep): boolean => {
    setError("");

    switch (step) {
      case 1:
        if (!formData.jobTitle.trim()) {
          setError("Job title is required");
          return false;
        }
        if (!formData.bio.trim() || formData.bio.length < 50) {
          setError("Bio must be at least 50 characters");
          return false;
        }
        return true;

      case 2:
        if (!formData.industry.trim()) {
          setError("Industry is required");
          return false;
        }
        if (!formData.yearsOfExperience) {
          setError("Years of experience is required");
          return false;
        }
        if (formData.skills.length < 3) {
          setError("Please add at least 3 skills");
          return false;
        }
        return true;

      case 3:
        if (formData.selectedCategories.length === 0) {
          setError("Please select at least one category");
          return false;
        }
        return true;

      case 4:
        if (formData.availableDays.length === 0) {
          setError("Please select at least one available day");
          return false;
        }
        if (!formData.hourlyRate || parseFloat(formData.hourlyRate) <= 0) {
          setError("Please set a valid hourly rate");
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4) as OnboardingStep);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1) as OnboardingStep);
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    setError("");

    try {
      await providerOnboardingApi.apply({
        jobTitle: formData.jobTitle,
        bio: formData.bio,
        location: formData.location,
        linkedInUrl: formData.linkedInUrl || undefined,
        twitterUrl: formData.twitterUrl || undefined,
        websiteUrl: formData.websiteUrl || undefined,
        industry: formData.industry,
        yearsOfExperience: parseInt(formData.yearsOfExperience),
        skills: formData.skills,
        certifications: formData.certifications
          ? formData.certifications.split(",").map((c) => c.trim())
          : [],
        categoryIds: formData.selectedCategories,
        interests: formData.interests,
        availableDays: formData.availableDays,
        availableTimeStart: formData.availableTimeStart,
        availableTimeEnd: formData.availableTimeEnd,
        hourlyRate: parseFloat(formData.hourlyRate),
      });

      router.push("/expert/onboarding/verify");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || "Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-600" />
          <p className="mt-2 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  const steps = [
    { number: 1, title: "Basic Info", icon: User },
    { number: 2, title: "Professional", icon: Briefcase },
    { number: 3, title: "Expertise", icon: Award },
    { number: 4, title: "Availability", icon: Calendar },
  ];

  const benefits = [
    {
      icon: DollarSign,
      title: "Earn on your terms",
      description: "Set your own rates and work when you want",
    },
    {
      icon: Users,
      title: "Grow your network",
      description: "Connect with seekers from around the world",
    },
    {
      icon: TrendingUp,
      title: "Build your reputation",
      description: "Get reviews and build your expert profile",
    },
    {
      icon: Shield,
      title: "Secure payments",
      description: "Get paid reliably for every session",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="grid min-h-screen lg:grid-cols-5">
        {/* Left Panel - Benefits (2 cols) */}
        <div className="hidden lg:flex lg:col-span-2 flex-col relative overflow-hidden bg-slate-900 text-white">
          {/* Background effects */}
          <div className="absolute inset-0">
            <div className="absolute top-20 -left-20 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-40 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] border border-white/5 rounded-full" />
          </div>

          <div className="relative flex flex-col justify-between h-full px-10 py-12">
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
                <Rocket className="w-4 h-4 text-emerald-400" />
                <span className="text-sm">Become an Expert</span>
              </div>

              <h1 className="text-4xl font-bold leading-tight">
                Share your knowledge,{" "}
                <span className="text-emerald-400">earn income</span>
              </h1>

              <p className="text-lg text-slate-300 max-w-md">
                Join thousands of experts helping people solve problems and get answers. Your expertise matters.
              </p>

              {/* Benefits grid */}
              <div className="grid grid-cols-1 gap-4 pt-4">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <benefit.icon className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{benefit.title}</p>
                      <p className="text-sm text-slate-400">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonial */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-300 italic">
                &quot;Becoming an expert on Answer Human was the best career decision I made. 
                I&apos;ve helped hundreds of people and built a steady income stream.&quot;
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-medium">
                  JK
                </div>
                <div>
                  <p className="font-medium text-white">James Kim</p>
                  <p className="text-sm text-slate-400">Tax Consultant • 2 years on platform</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Form (3 cols) */}
        <div className="lg:col-span-3 flex flex-col bg-slate-50">
          {/* Header with steps */}
          <div className="bg-white border-b border-slate-200 px-6 py-6">
            <div className="max-w-2xl mx-auto">
              {/* Mobile logo */}
              <div className="lg:hidden mb-6">
                <Link href="/" className="inline-flex items-center gap-2">
                  <span className="text-xl font-bold text-slate-900">
                    Answer Human<span className="text-emerald-600">.</span>
                  </span>
                </Link>
              </div>

              {/* Progress steps */}
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          currentStep >= step.number
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        {currentStep > step.number ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <step.icon className="w-5 h-5" />
                        )}
                      </div>
                      <span
                        className={`mt-2 text-xs font-medium ${
                          currentStep >= step.number ? "text-emerald-600" : "text-slate-400"
                        }`}
                      >
                        {step.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-16 sm:w-24 h-1 mx-2 rounded-full transition-all ${
                          currentStep > step.number ? "bg-emerald-600" : "bg-slate-200"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form content */}
          <div className="flex-1 overflow-auto px-6 py-8">
            <div className="max-w-2xl mx-auto">
              {error && (
                <div className="mb-6 p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-red-600 text-xs font-bold">!</span>
                  </div>
                  {error}
                </div>
              )}

              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <Card className="border-0 shadow-lg rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-emerald-600" />
                      </div>
                      Basic Information
            </CardTitle>
            <CardDescription>
                      Tell us about yourself. This information will appear on your public profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
                <div className="space-y-2">
                      <Label className="text-slate-700">
                        Professional Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                        placeholder="e.g., Senior Tax Consultant, UX Design Lead"
                        value={formData.jobTitle}
                        onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                        className="h-11 border-slate-200"
                  />
                </div>

                <div className="space-y-2">
                      <Label className="text-slate-700">
                    Bio <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                        placeholder="Share your background, expertise, and what makes you unique. Minimum 50 characters."
                        value={formData.bio}
                        onChange={(e) => handleInputChange("bio", e.target.value)}
                        className="min-h-32 border-slate-200"
                      />
                      <p className="text-xs text-slate-400">
                        {formData.bio.length}/50 minimum characters
                  </p>
                </div>

                <div className="space-y-2">
                      <Label className="text-slate-700">Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                          placeholder="e.g., New York, USA"
                          value={formData.location}
                          onChange={(e) => handleInputChange("location", e.target.value)}
                          className="h-11 pl-10 border-slate-200"
                        />
                      </div>
                </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-slate-700">LinkedIn</Label>
                        <Input
                          placeholder="linkedin.com/in/..."
                          value={formData.linkedInUrl}
                          onChange={(e) => handleInputChange("linkedInUrl", e.target.value)}
                          className="h-11 border-slate-200"
                        />
                      </div>
                <div className="space-y-2">
                        <Label className="text-slate-700">Twitter</Label>
                  <Input
                          placeholder="twitter.com/..."
                          value={formData.twitterUrl}
                          onChange={(e) => handleInputChange("twitterUrl", e.target.value)}
                          className="h-11 border-slate-200"
                  />
                </div>
                <div className="space-y-2">
                        <Label className="text-slate-700">Website</Label>
                  <Input
                          placeholder="yoursite.com"
                          value={formData.websiteUrl}
                          onChange={(e) => handleInputChange("websiteUrl", e.target.value)}
                          className="h-11 border-slate-200"
                  />
                </div>
                    </div>
                  </CardContent>
                </Card>
            )}

            {/* Step 2: Professional Details */}
            {currentStep === 2 && (
                <Card className="border-0 shadow-lg rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-blue-600" />
                      </div>
                      Professional Details
                    </CardTitle>
                    <CardDescription>
                      Help seekers understand your qualifications and experience.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                        <Label className="text-slate-700">
                          Industry <span className="text-red-500">*</span>
                        </Label>
                    <Input
                          placeholder="e.g., Finance, Technology, Healthcare"
                          value={formData.industry}
                          onChange={(e) => handleInputChange("industry", e.target.value)}
                          className="h-11 border-slate-200"
                    />
                  </div>
                  <div className="space-y-2">
                        <Label className="text-slate-700">
                          Years of Experience <span className="text-red-500">*</span>
                        </Label>
                    <Input
                          type="number"
                          placeholder="e.g., 5"
                          value={formData.yearsOfExperience}
                          onChange={(e) => handleInputChange("yearsOfExperience", e.target.value)}
                          className="h-11 border-slate-200"
                    />
                  </div>
                </div>

                    <div className="space-y-3">
                      <Label className="text-slate-700">
                        Skills <span className="text-red-500">*</span>
                        <span className="text-slate-400 font-normal ml-2">(at least 3)</span>
                      </Label>
                  <div className="flex gap-2">
                    <Input
                          placeholder="Add a skill..."
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                          className="h-11 border-slate-200"
                        />
                        <Button
                          type="button"
                          onClick={addSkill}
                          variant="outline"
                          className="h-11 px-6"
                        >
                      Add
                    </Button>
                  </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                            className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer"
                            onClick={() => removeSkill(skill)}
                      >
                            {skill}
                            <span className="ml-2 text-emerald-400">×</span>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                      <Label className="text-slate-700">Certifications</Label>
                      <Input
                        placeholder="e.g., CPA, AWS Certified, PMP (comma-separated)"
                        value={formData.certifications}
                        onChange={(e) => handleInputChange("certifications", e.target.value)}
                        className="h-11 border-slate-200"
                      />
                      <p className="text-xs text-slate-400">
                        Separate multiple certifications with commas
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Categories & Expertise */}
              {currentStep === 3 && (
                <Card className="border-0 shadow-lg rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                        <Award className="w-5 h-5 text-purple-600" />
                      </div>
                      Areas of Expertise
                    </CardTitle>
                    <CardDescription>
                      Select categories and interests that match your expertise.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-slate-700">
                        Categories <span className="text-red-500">*</span>
                      </Label>
                      {isLoadingCategories ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {categories.map((category) => (
                            <label
                              key={category.id}
                              className={`relative flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                formData.selectedCategories.includes(category.id)
                                  ? "border-emerald-500 bg-emerald-50"
                                  : "border-slate-200 hover:border-slate-300"
                              }`}
                            >
                              <Checkbox
                                checked={formData.selectedCategories.includes(category.id)}
                                onCheckedChange={() => toggleCategory(category.id)}
                                className="sr-only"
                              />
                              <div
                                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                                  formData.selectedCategories.includes(category.id)
                                    ? "border-emerald-500 bg-emerald-500"
                                    : "border-slate-300"
                                }`}
                              >
                                {formData.selectedCategories.includes(category.id) && (
                                  <CheckCircle2 className="w-4 h-4 text-white" />
                                )}
                              </div>
                              <span className="text-sm font-medium text-slate-700">
                                {category.name}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label className="text-slate-700">
                        Interests & Topics
                        <span className="text-slate-400 font-normal ml-2">(optional)</span>
                      </Label>
                  <div className="flex gap-2">
                    <Input
                          placeholder="Add an interest..."
                      value={interestInput}
                      onChange={(e) => setInterestInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addInterest())}
                          className="h-11 border-slate-200"
                        />
                        <Button
                          type="button"
                          onClick={addInterest}
                          variant="outline"
                          className="h-11 px-6"
                        >
                      Add
                    </Button>
                  </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.interests.map((interest) => (
                      <Badge
                        key={interest}
                        variant="secondary"
                            className="px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 cursor-pointer"
                            onClick={() => removeInterest(interest)}
                      >
                            {interest}
                            <span className="ml-2 text-purple-400">×</span>
                      </Badge>
                    ))}
                  </div>
                </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 4: Availability & Pricing */}
              {currentStep === 4 && (
                <Card className="border-0 shadow-lg rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-amber-600" />
                      </div>
                      Availability & Pricing
                    </CardTitle>
                    <CardDescription>
                      Set your schedule and hourly rate for consultations.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-slate-700">
                        Available Days <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_OF_WEEK.map((day) => (
                          <button
                        key={day}
                            type="button"
                        onClick={() => toggleDay(day)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              formData.availableDays.includes(day)
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                      >
                        {day.charAt(0) + day.slice(1).toLowerCase()}
                          </button>
                    ))}
                  </div>
                </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-slate-700 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Available From
                        </Label>
                        <select
                          value={formData.availableTimeStart}
                          onChange={(e) => handleInputChange("availableTimeStart", e.target.value)}
                          className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-white text-slate-700"
                        >
                          {TIME_SLOTS.map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                      </div>
                <div className="space-y-2">
                        <Label className="text-slate-700 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Available Until
                        </Label>
                        <select
                          value={formData.availableTimeEnd}
                          onChange={(e) => handleInputChange("availableTimeEnd", e.target.value)}
                          className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-white text-slate-700"
                        >
                          {TIME_SLOTS.map((time) => (
                            <option key={time} value={time}>
                        {time}
                            </option>
                    ))}
                        </select>
                  </div>
                </div>

                <div className="space-y-2">
                      <Label className="text-slate-700">
                        Hourly Rate (USD) <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                          type="number"
                          placeholder="e.g., 75"
                          value={formData.hourlyRate}
                          onChange={(e) => handleInputChange("hourlyRate", e.target.value)}
                          className="h-11 pl-10 border-slate-200"
                        />
                      </div>
                      <p className="text-xs text-slate-400">
                        Recommended: $50-$200/hour based on experience
                      </p>
                    </div>

                    {/* Summary */}
                    <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        Application Summary
                      </h4>
                      <div className="space-y-2 text-sm text-slate-600">
                        <p>
                          <span className="font-medium">Title:</span> {formData.jobTitle || "—"}
                        </p>
                        <p>
                          <span className="font-medium">Industry:</span> {formData.industry || "—"}
                        </p>
                        <p>
                          <span className="font-medium">Experience:</span>{" "}
                          {formData.yearsOfExperience ? `${formData.yearsOfExperience} years` : "—"}
                        </p>
                        <p>
                          <span className="font-medium">Categories:</span>{" "}
                          {formData.selectedCategories.length > 0
                            ? categories
                                .filter((c) => formData.selectedCategories.includes(c.id))
                                .map((c) => c.name)
                                .join(", ")
                            : "—"}
                        </p>
                        <p>
                          <span className="font-medium">Rate:</span>{" "}
                          {formData.hourlyRate ? `$${formData.hourlyRate}/hour` : "—"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
                  </div>
                </div>

          {/* Footer with navigation */}
          <div className="bg-white border-t border-slate-200 px-6 py-4">
            <div className="max-w-2xl mx-auto flex items-center justify-between">
                <Button
                variant="ghost"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="text-slate-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>

              {currentStep < 4 ? (
                <Button
                  onClick={nextStep}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Submit Application
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
