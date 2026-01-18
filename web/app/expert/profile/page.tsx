"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Briefcase, GraduationCap, Globe, Shield } from "lucide-react";
import { providerOnboardingApi } from "@/lib/api/provider-onboarding";
import { Appointment } from "@/types/appointment.types";

type ProviderProfile = {
  id: string;
  name: string;
  bio: string;
  description: string | null;
  profilePictureUrl: string | null;
  location: string | null;
  company: string | null;
  jobTitle: string | null;
  education: string | null;
  skills: string[];
  interests: string[];
  isVerified: boolean;
  availableDays: string[];
  availableTimes: string[];
  availableLanguages: string[];
  categories: { id: string; name: string }[];
  user: { username: string; email: string };
  appointments: Appointment[];
  questions: { id: string; questionTitle: string }[];
  websiteUrl?: string | null;
  linkedinUrl?: string | null;
  twitterUrl?: string | null;
  githubUrl?: string | null;
};

export default function ExpertProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<ProviderProfile | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const data = await providerOnboardingApi.getProfile();
        setProfile(data);
      } catch (error: unknown) {
        const err = error as { response?: { status?: number } };
        console.error("Error loading expert profile:", error);
        if (err.response?.status === 404) {
          router.push("/expert/onboarding");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-12">
          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="py-10 text-center text-slate-500">
              Expert profile not found.
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col gap-8">
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={profile.profilePictureUrl || undefined} />
                  <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-semibold">{profile.name}</h1>
                    <Badge variant={profile.isVerified ? "default" : "secondary"}>
                      {profile.isVerified ? "Verified" : "Pending verification"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">@{profile.user.username}</p>
                  <p className="text-sm text-gray-500">{profile.user.email}</p>
                </div>
              </div>
              <Button onClick={() => router.push("/expert/profile/edit")}>
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">{profile.bio}</p>
                {profile.description && (
                  <p className="text-gray-600">{profile.description}</p>
                )}
                <div className="grid gap-3 text-sm text-gray-600 sm:grid-cols-2">
                  {profile.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {profile.location}
                    </div>
                  )}
                  {profile.jobTitle && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      {profile.jobTitle}
                      {profile.company ? ` at ${profile.company}` : ""}
                    </div>
                  )}
                  {profile.education && (
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      {profile.education}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle>Expertise</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.categories.map((category) => (
                      <Badge key={category.id} variant="outline">
                        {category.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Interests</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest) => (
                      <Badge key={interest} variant="secondary">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle>Availability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Available days</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.availableDays.map((day) => (
                      <Badge key={day} variant="outline">
                        {day}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Available times</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.availableTimes.map((time) => (
                      <Badge key={time} variant="outline">
                        {time}
                      </Badge>
                    ))}
                  </div>
                </div>
                {profile.availableLanguages.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Languages</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.availableLanguages.map((language) => (
                        <Badge key={language} variant="outline">
                          {language}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle>Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Total appointments</span>
                  <span className="font-semibold text-gray-900">
                    {profile.appointments?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total questions</span>
                  <span className="font-semibold text-gray-900">
                    {profile.questions?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Verification</span>
                  <span className="font-semibold text-gray-900 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    {profile.isVerified ? "Verified" : "Pending"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {(profile.websiteUrl ||
              profile.linkedinUrl ||
              profile.twitterUrl ||
              profile.githubUrl) && (
              <Card className="border border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {profile.websiteUrl && (
                    <a
                      href={profile.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-primary"
                    >
                      <Globe className="h-4 w-4" />
                      Website
                    </a>
                  )}
                  {profile.linkedinUrl && (
                    <a
                      href={profile.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-primary"
                    >
                      <Globe className="h-4 w-4" />
                      LinkedIn
                    </a>
                  )}
                  {profile.twitterUrl && (
                    <a
                      href={profile.twitterUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-primary"
                    >
                      <Globe className="h-4 w-4" />
                      Twitter
                    </a>
                  )}
                  {profile.githubUrl && (
                    <a
                      href={profile.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-primary"
                    >
                      <Globe className="h-4 w-4" />
                      GitHub
                    </a>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}