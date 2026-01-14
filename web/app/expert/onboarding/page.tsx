"use client";

import { useState, useEffect } from "react";
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
import {
  Loader2,
  CheckCircle,
  Users,
  TrendingUp,
  DollarSign,
  Globe,
  Star,
  ArrowRight,
} from "lucide-react";
import { providerOnboardingApi } from "@/lib/api/provider-onboarding";
import { getCategories } from "@/lib/get-categories";
import { flattenCategories } from "@/lib/category-utils";
import { Category } from "@/types/category.types";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const DAYS_OF_WEEK = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const DEFAULT_TIME_SLOTS = [
  "09:00-10:00",
  "10:00-11:00",
  "11:00-12:00",
  "13:00-14:00",
  "14:00-15:00",
  "15:00-16:00",
  "16:00-17:00",
  "17:00-18:00",
];

const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Chinese",
  "Japanese",
  "Hindi",
  "Arabic",
  "Portuguese",
  "Russian",
];

export default function BecomeExpertPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canBecomeExpert, setCanBecomeExpert] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentStep, setCurrentStep] = useState(1);

  // Form state
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [description, setDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [education, setEducation] = useState("");
  const [location, setLocation] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState("");
  const [bannerPictureUrl, setBannerPictureUrl] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["English"]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [eligibility, categoriesData] = await Promise.all([
        providerOnboardingApi.checkEligibility(),
        getCategories(),
      ]);

      setCanBecomeExpert(eligibility.canBecomeExpert);
      setCategories(categoriesData);

      if (!eligibility.canBecomeExpert) {
        toast({
          title: "Already an Expert",
          description: "You're already registered as an expert!",
        });
        router.push("/expert");
      }
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleAddInterest = () => {
    if (interestInput.trim() && !interests.includes(interestInput.trim())) {
      setInterests([...interests, interestInput.trim()]);
      setInterestInput("");
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setInterests(interests.filter((i) => i !== interest));
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const toggleTime = (time: string) => {
    setSelectedTimes((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    );
  };

  const toggleLanguage = (language: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(language)
        ? prev.filter((l) => l !== language)
        : [...prev, language]
    );
  };

  const handleSubmit = async () => {
    // Validation
    if (!name.trim() || !bio.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (selectedCategoryIds.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one category",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await providerOnboardingApi.apply({
        name,
        bio,
        description: description || undefined,
        jobTitle: jobTitle || undefined,
        company: company || undefined,
        education: education || undefined,
        location: location || undefined,
        websiteUrl: websiteUrl || undefined,
        linkedinUrl: linkedinUrl || undefined,
        twitterUrl: twitterUrl || undefined,
        githubUrl: githubUrl || undefined,
        profilePictureUrl: profilePictureUrl || undefined,
        bannerPictureUrl: bannerPictureUrl || undefined,
        skills,
        interests,
        categoryIds: selectedCategoryIds,
        availableDays: selectedDays,
        availableTimes: selectedTimes,
        availableLanguages: selectedLanguages,
      });

      toast({
        title: "Success!",
        description: "Your expert application has been submitted successfully",
      });

      // Redirect to expert dashboard
      router.push("/expert");
    } catch (error: any) {
      console.error("Error submitting application:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.error || "Failed to submit application",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const flatCategories = flattenCategories(categories);

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

  if (!canBecomeExpert) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">Become an Expert</h1>
          <p className="text-xl text-gray-600 mb-8">
            Share your knowledge and help others while earning money
          </p>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="text-sm font-semibold">Connect with Seekers</p>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6 text-center">
                <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p className="text-sm font-semibold">Earn Money</p>
              </CardContent>
            </Card>
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="pt-6 text-center">
                <Globe className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <p className="text-sm font-semibold">Work Remotely</p>
              </CardContent>
            </Card>
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="pt-6 text-center">
                <Star className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                <p className="text-sm font-semibold">Build Reputation</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Multi-step Form */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <div
                      className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold",
                        currentStep >= step
                          ? "bg-primary text-white"
                          : "bg-gray-200 text-gray-500"
                      )}
                    >
                      {currentStep > step ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        step
                      )}
                    </div>
                    {step < 3 && (
                      <div
                        className={cn(
                          "h-1 w-8 mx-2",
                          currentStep > step ? "bg-primary" : "bg-gray-200"
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>
              <span className="text-sm text-gray-500">
                Step {currentStep} of 3
              </span>
            </div>
            <CardTitle>
              {currentStep === 1 && "Basic Information"}
              {currentStep === 2 && "Professional Details"}
              {currentStep === 3 && "Availability & Categories"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Tell us about yourself"}
              {currentStep === 2 &&
                "Share your professional background and links"}
              {currentStep === 3 &&
                "Set your availability and areas of expertise"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">
                    Bio <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself and your expertise..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    This will be displayed on your profile
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Additional information about your services..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profilePicture">Profile Picture URL</Label>
                  <Input
                    id="profilePicture"
                    type="url"
                    placeholder="https://example.com/profile.jpg"
                    value={profilePictureUrl}
                    onChange={(e) => setProfilePictureUrl(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bannerPicture">Banner Picture URL</Label>
                  <Input
                    id="bannerPicture"
                    type="url"
                    placeholder="https://example.com/banner.jpg"
                    value={bannerPictureUrl}
                    onChange={(e) => setBannerPictureUrl(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Step 2: Professional Details */}
            {currentStep === 2 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      placeholder="Senior Developer"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      placeholder="Tech Corp"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="education">Education</Label>
                  <Input
                    id="education"
                    placeholder="BS Computer Science, MIT"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="San Francisco, CA"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                {/* Skills */}
                <div className="space-y-2">
                  <Label>Skills</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a skill"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                    />
                    <Button type="button" onClick={handleAddSkill}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => handleRemoveSkill(skill)}
                      >
                        {skill} ×
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Interests */}
                <div className="space-y-2">
                  <Label>Interests</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add an interest"
                      value={interestInput}
                      onChange={(e) => setInterestInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddInterest())}
                    />
                    <Button type="button" onClick={handleAddInterest}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {interests.map((interest) => (
                      <Badge
                        key={interest}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => handleRemoveInterest(interest)}
                      >
                        {interest} ×
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Social Links */}
                <div className="space-y-4">
                  <Label>Social Links</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Website URL"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                    />
                    <Input
                      placeholder="LinkedIn URL"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                    />
                    <Input
                      placeholder="Twitter URL"
                      value={twitterUrl}
                      onChange={(e) => setTwitterUrl(e.target.value)}
                    />
                    <Input
                      placeholder="GitHub URL"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Availability & Categories */}
            {currentStep === 3 && (
              <>
                {/* Categories */}
                <div className="space-y-2">
                  <Label>
                    Expertise Categories{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-sm text-gray-500 mb-3">
                    Select the areas you can help with
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {flatCategories.map((category) => (
                      <Badge
                        key={category.id}
                        variant={
                          selectedCategoryIds.includes(category.id)
                            ? "default"
                            : "outline"
                        }
                        className={cn(
                          "cursor-pointer transition-colors",
                          selectedCategoryIds.includes(category.id)
                            ? "bg-primary hover:bg-primary/90"
                            : "hover:bg-gray-100"
                        )}
                        onClick={() => toggleCategory(category.id)}
                      >
                        {category.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Available Days */}
                <div className="space-y-2">
                  <Label>Available Days</Label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <Badge
                        key={day}
                        variant={
                          selectedDays.includes(day) ? "default" : "outline"
                        }
                        className={cn(
                          "cursor-pointer transition-colors",
                          selectedDays.includes(day)
                            ? "bg-primary hover:bg-primary/90"
                            : "hover:bg-gray-100"
                        )}
                        onClick={() => toggleDay(day)}
                      >
                        {day.charAt(0) + day.slice(1).toLowerCase()}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Available Times */}
                <div className="space-y-2">
                  <Label>Available Time Slots</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {DEFAULT_TIME_SLOTS.map((time) => (
                      <Badge
                        key={time}
                        variant={
                          selectedTimes.includes(time) ? "default" : "outline"
                        }
                        className={cn(
                          "cursor-pointer transition-colors justify-center py-2",
                          selectedTimes.includes(time)
                            ? "bg-primary hover:bg-primary/90"
                            : "hover:bg-gray-100"
                        )}
                        onClick={() => toggleTime(time)}
                      >
                        {time}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div className="space-y-2">
                  <Label>Languages</Label>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map((language) => (
                      <Badge
                        key={language}
                        variant={
                          selectedLanguages.includes(language)
                            ? "default"
                            : "outline"
                        }
                        className={cn(
                          "cursor-pointer transition-colors",
                          selectedLanguages.includes(language)
                            ? "bg-primary hover:bg-primary/90"
                            : "hover:bg-gray-100"
                        )}
                        onClick={() => toggleLanguage(language)}
                      >
                        {language}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  disabled={isSubmitting}
                >
                  Back
                </Button>
              )}
              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="ml-auto"
                  disabled={
                    (currentStep === 1 && (!name.trim() || !bio.trim()))
                  }
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={
                    isSubmitting ||
                    !name.trim() ||
                    !bio.trim() ||
                    selectedCategoryIds.length === 0
                  }
                  className="ml-auto"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

