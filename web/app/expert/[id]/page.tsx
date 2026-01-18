"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar,
  Clock,
  MapPin,
  Globe,
  Linkedin,
  Twitter,
  Github,
  Star,
  Users,
  CheckCircle,
  Award,
  Briefcase,
  GraduationCap,
  Languages,
  DollarSign,
  Video,
  Phone,
  MessageSquare,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { providerApi } from "@/lib/api/provider";
import { appointmentApi } from "@/lib/api/appointment";
import { KnowledgeProvider } from "@/types/expert.types";
import { AvailableSlot } from "@/types/appointment.types";

interface ExpertWithExtras extends KnowledgeProvider {
  rating?: number;
  reviewCount?: number;
  totalAppointments?: number;
  responseTime?: string | null;
  categories?: Array<{
  id: string;
    name: string;
    slug: string;
  }>;
  user?: {
    username: string;
    email: string;
  };
}

interface GroupedSlots {
  date: string;
  times: string[];
}

export default function ExpertProfilePage() {
  const params = useParams();
  const router = useRouter();
  const expertId = params.id as string;

  const [expert, setExpert] = useState<ExpertWithExtras | null>(null);
  const [availableSlots, setAvailableSlots] = useState<GroupedSlots[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  useEffect(() => {
    const fetchExpert = async () => {
      try {
        setIsLoading(true);
        const data = await providerApi.getById(expertId);
        setExpert(data as ExpertWithExtras);
      } catch (error) {
        console.error("Error fetching expert:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpert();
  }, [expertId]);

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      try {
        setIsLoadingSlots(true);
        const data = await appointmentApi.getAvailableSlots(expertId);
        
        // Group slots by date
        const grouped = data.reduce((acc: GroupedSlots[], slot: AvailableSlot) => {
          const existing = acc.find(s => s.date === slot.date);
          if (existing) {
            existing.times.push(slot.time);
          } else {
            acc.push({ date: slot.date, times: [slot.time] });
          }
          return acc;
        }, []);
        
        setAvailableSlots(grouped);
      } catch (error) {
        console.error("Error fetching available slots:", error);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    if (expertId) {
      fetchAvailableSlots();
    }
  }, [expertId]);

  const handleBookNow = () => {
    router.push(`/expert/${expertId}/book`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="mt-2">Loading expert profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!expert) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-semibold mb-4">Expert not found</h1>
          <Button onClick={() => router.push("/explore")}>Back to Explore</Button>
        </div>
      </div>
    );
  }

  const formatDay = (day: string) => {
    return day.charAt(0) + day.slice(1).toLowerCase();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Banner */}
      <div className="relative overflow-hidden">
        <div
          className="h-80 bg-blue-600 relative"
          style={
            expert.bannerPictureUrl
              ? {
                  backgroundImage: `url(${expert.bannerPictureUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        >
          {/* Overlay for better text visibility */}
        {expert.bannerPictureUrl && (
            <div className="absolute inset-0 bg-black/30" />
                  )}
          </div>
        </div>

      <div className="container mx-auto px-4 -mt-40 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Profile Card */}
            <Card className="border-0 shadow-xl backdrop-blur-sm bg-white/95 hover:shadow-2xl transition-shadow duration-300">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Avatar with status indicator */}
                  <div className="relative">
                    <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                      <AvatarImage src={expert.profilePictureUrl || undefined} />
                      <AvatarFallback className="text-3xl bg-blue-600 text-white">
                        {expert.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {expert.isAvailable && (
                      <div className="absolute bottom-2 right-2 h-6 w-6 bg-green-500 rounded-full border-4 border-white shadow-lg animate-pulse" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h1 className="text-4xl font-bold text-gray-900">
                            {expert.name}
                          </h1>
                          {expert.isAvailable && (
                            <Badge className="bg-green-500 text-white hover:bg-green-600">
                              <span className="inline-block w-1.5 h-1.5 bg-white rounded-full mr-1.5 animate-pulse" />
                              Available
                            </Badge>
                          )}
                        </div>
                        {expert.jobTitle && (
                          <p className="text-lg text-gray-700 font-medium mb-3 flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-gray-400" />
                            {expert.jobTitle}
                            {expert.company && (
                              <span className="text-gray-500">
                                at <span className="text-purple-600 font-semibold">{expert.company}</span>
                              </span>
                            )}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm mb-4">
                          {expert.location && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full">
                              <MapPin className="h-4 w-4 text-blue-600" />
                              <span className="font-medium text-gray-700">{expert.location}</span>
                            </div>
                          )}
                          {expert.responseTime && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 rounded-full">
                              <Clock className="h-4 w-4 text-blue-600" />
                              <span className="font-medium text-blue-700">{expert.responseTime}</span>
                            </div>
                          )}
                          {expert.totalAppointments && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 rounded-full">
                              <Users className="h-4 w-4 text-purple-600" />
                              <span className="font-medium text-purple-700">
                                {expert.totalAppointments} sessions
                              </span>
                      </div>
                    )}
                        </div>
                      </div>

                      {/* Rating */}
                      {expert.rating && expert.rating > 0 && (
                        <div className="flex flex-col items-center md:items-end bg-yellow-50 px-6 py-4 rounded-xl border border-yellow-200">
                          <div className="flex items-center gap-2 mb-1">
                            <Star className="h-6 w-6 fill-yellow-400 text-yellow-400 drop-shadow-sm" />
                            <span className="text-3xl font-bold text-gray-800">
                              {expert.rating.toFixed(1)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-yellow-400 mb-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                              key={i}
                                className={`h-3 w-3 ${
                                  i < Math.floor(expert.rating || 0)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-xs font-semibold text-gray-600">
                            {expert.reviewCount || 0} reviews
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Social Links */}
                    <div className="flex gap-2 mt-4">
                      {expert.websiteUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:bg-blue-50 hover:border-blue-300 hover:scale-105 transition-all"
                          onClick={() => window.open(expert.websiteUrl!, "_blank")}
                        >
                          <Globe className="h-4 w-4" />
                        </Button>
                      )}
                      {expert.linkedinUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:bg-blue-50 hover:border-blue-500 hover:scale-105 transition-all"
                          onClick={() => window.open(expert.linkedinUrl!, "_blank")}
                        >
                          <Linkedin className="h-4 w-4 text-blue-600" />
                        </Button>
                      )}
                      {expert.twitterUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:bg-sky-50 hover:border-sky-400 hover:scale-105 transition-all"
                          onClick={() => window.open(expert.twitterUrl!, "_blank")}
                        >
                          <Twitter className="h-4 w-4 text-sky-500" />
                        </Button>
                      )}
                      {expert.githubUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:bg-gray-100 hover:border-gray-400 hover:scale-105 transition-all"
                          onClick={() => window.open(expert.githubUrl!, "_blank")}
                        >
                          <Github className="h-4 w-4 text-gray-700" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About */}
            <Card className="shadow-md border">
              <CardHeader className="border-b bg-white">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <div className="h-8 w-1 bg-blue-600 rounded-full" />
                  About Me
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                  {expert.bio}
                </p>
                {expert.description && (
                  <div className="pl-4 border-l-4 border-blue-200 bg-blue-50 py-3 pr-4 rounded-r">
                    <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                      {expert.description}
                            </p>
                          </div>
                )}
              </CardContent>
            </Card>

            {/* Expertise */}
            {expert.categories && expert.categories.length > 0 && (
              <Card className="shadow-md border">
                <CardHeader className="bg-white border-b">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Award className="h-5 w-5 text-blue-600" />
                    Areas of Expertise
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-wrap gap-2">
                    {expert.categories.map((category) => (
                      <Badge
                        key={category.id}
                        className="text-sm px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {category.name}
                      </Badge>
                            ))}
                          </div>
                      </CardContent>
                    </Card>
            )}

            {/* Skills */}
            {expert.skills.length > 0 && (
              <Card className="shadow-md border">
                <CardHeader className="bg-white border-b">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Skills & Technologies
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-wrap gap-2">
                    {expert.skills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-sm px-4 py-2 border-green-600 text-green-700 hover:bg-green-50"
                      >
                        {skill}
                      </Badge>
                  ))}
                </div>
                </CardContent>
              </Card>
            )}

            {/* Education */}
            {expert.education && (
              <Card className="shadow-md border">
                <CardHeader className="bg-white border-b">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <GraduationCap className="h-5 w-5 text-indigo-600" />
                    Education
                  </CardTitle>
                      </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 p-4 bg-indigo-50/50 rounded-lg border border-indigo-100">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                      <GraduationCap className="h-5 w-5 text-indigo-600" />
                    </div>
                    <p className="text-gray-700 leading-relaxed flex-1 pt-1.5 font-medium">
                      {expert.education}
                    </p>
                  </div>
                      </CardContent>
                    </Card>
            )}

            {/* Interests */}
            {expert.interests.length > 0 && (
              <Card className="shadow-md border">
                <CardHeader className="bg-white border-b">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Star className="h-5 w-5 text-orange-600" />
                    Personal Interests
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-wrap gap-2">
                    {expert.interests.map((interest, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-sm px-4 py-2 border-2 border-orange-200 hover:border-orange-400 hover:bg-orange-50 transition-all duration-200"
                      >
                        {interest}
                      </Badge>
                  ))}
                </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Booking Info */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card className="sticky top-6 shadow-lg border">
              <div className="bg-blue-600 p-6 text-white">
                <CardTitle className="text-2xl font-bold mb-2">
                  Book a Session
                </CardTitle>
                <p className="text-blue-100 text-sm">
                  Get expert guidance from {expert.name.split(" ")[0]}
                </p>
                        </div>
              <CardContent className="pt-6 space-y-5">
                {/* Availability Status */}
                <div
                  className={`flex items-center justify-between p-4 rounded-xl border-2 ${
                    expert.isAvailable
                      ? "bg-green-50 border-green-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                <div className="flex items-center gap-3">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        expert.isAvailable
                          ? "bg-green-500 animate-pulse shadow-lg shadow-green-500/50"
                          : "bg-gray-400"
                      }`}
                    />
                    <span className="font-semibold text-gray-800">
                      {expert.isAvailable ? "Available Now" : "Not Available"}
                    </span>
                  </div>
                  {expert.isAvailable && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                </div>

                {/* Available Days */}
                {expert.availableDays.length > 0 && (
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <h4 className="text-sm font-bold mb-3 flex items-center gap-2 text-gray-800">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      Available Days
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {expert.availableDays.map((day) => (
                        <Badge
                          key={day}
                          className="text-xs px-3 py-1 bg-white border-2 border-blue-200 text-blue-700 hover:bg-blue-50 font-medium"
                        >
                          {formatDay(day)}
                          </Badge>
                        ))}
                      </div>
                  </div>
                )}

                {/* Available Times */}
                {expert.availableTimes.length > 0 && (
                  <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100">
                    <h4 className="text-sm font-bold mb-3 flex items-center gap-2 text-gray-800">
                      <Clock className="h-4 w-4 text-purple-600" />
                      Time Slots
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {expert.availableTimes.slice(0, 6).map((time) => (
                        <Badge
                          key={time}
                          className="text-xs px-3 py-1 bg-white border-2 border-purple-200 text-purple-700 hover:bg-purple-50 font-medium"
                        >
                          {time}
                        </Badge>
                      ))}
                      {expert.availableTimes.length > 6 && (
                        <Badge className="text-xs px-3 py-1 bg-purple-600 text-white font-medium">
                          +{expert.availableTimes.length - 6} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Languages */}
                {expert.availableLanguages.length > 0 && (
                  <div className="bg-pink-50/50 p-4 rounded-xl border border-pink-100">
                    <h4 className="text-sm font-bold mb-3 flex items-center gap-2 text-gray-800">
                      <Languages className="h-4 w-4 text-pink-600" />
                      Languages
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {expert.availableLanguages.map((lang) => (
                        <Badge
                          key={lang}
                          className="text-xs px-3 py-1 bg-white border-2 border-pink-200 text-pink-700 hover:bg-pink-50 font-medium"
                        >
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Next Available Slots */}
                <div className="border-t pt-4">
                  {isLoadingSlots ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600" />
                      <p className="text-sm text-gray-500 mt-3 font-medium">Loading slots...</p>
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div>
                      <h4 className="text-sm font-bold mb-3 flex items-center gap-2 text-gray-800">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        Next Available Slots
                      </h4>
                      <div className="space-y-2">
                        {availableSlots.slice(0, 3).map((slot) => (
                          <div
                            key={slot.date}
                            className="p-3 bg-blue-50 rounded-lg border border-blue-200 hover:border-blue-400 transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-bold text-gray-800 mb-1">
                                  {new Date(slot.date).toLocaleDateString("en-US", {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </div>
                                <div className="text-xs text-gray-600 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {slot.times.length} slots available
                                </div>
                              </div>
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                      <AlertCircle className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 font-medium">
                        No available slots at the moment
                      </p>
                    </div>
                  )}
                </div>

                {/* Book Button */}
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                  onClick={handleBookNow}
                  disabled={!expert.isAvailable}
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  <span className="font-bold">Book a Session Now</span>
                </Button>
                
                {!expert.isAvailable && (
                  <p className="text-xs text-center text-gray-500 -mt-2">
                    This expert is currently not available for bookings
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

