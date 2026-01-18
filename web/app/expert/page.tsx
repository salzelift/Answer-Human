"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  DollarSign,
  Users,
  Clock,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Shield,
  Edit,
  Save,
  MapPin,
  Briefcase,
  MessageSquare,
  Video,
  Phone,
  Eye,
} from "lucide-react";
import { providerOnboardingApi } from "@/lib/api/provider-onboarding";
import { useToast } from "@/hooks/use-toast";

interface AppointmentItem {
  id: string;
  appointmentStatus: string;
  paymentStatus: string;
  totalPaymemnt?: number | string;
  appointmentDate: string;
  appointmentTime: string;
  communicationMedium?: string;
  knowledgeSeeker?: { name: string };
  questions?: { questionTitle: string };
}

interface ProviderProfile {
  id: string;
  name: string;
  bio: string;
  description: string | null;
  profilePictureUrl: string | null;
  bannerPictureUrl: string | null;
  location: string | null;
  company: string | null;
  jobTitle: string | null;
  education: string | null;
  skills: string[];
  interests: string[];
  isAvailable: boolean;
  isVerified: boolean;
  verifiedAt: string | null;
  availableDays: string[];
  availableTimes: string[];
  availableLanguages: string[];
  categories: { id: string; name: string }[];
  appointments: AppointmentItem[];
  questions: { id: string; questionTitle: string }[];
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

export default function ExpertDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [appointmentFilter, setAppointmentFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await providerOnboardingApi.getProfile();
      setProfile(response);
    } catch (err: unknown) {
      console.error("Error loading profile:", err);
      const error = err as { response?: { status?: number } };
      if (error.response?.status === 404) {
        toast({
          title: "Not an Expert",
          description: "Please complete the expert application first",
        });
        router.push("/expert/onboarding");
      } else {
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [router, toast]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeStr: string) => {
    return new Date(timeStr).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDay = (day: string) => {
    return day.charAt(0) + day.slice(1).toLowerCase();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-20 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-20">
          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="py-12 text-center">
              <p>Profile not found. Please complete the expert application.</p>
              <Button
                onClick={() => router.push("/expert/onboarding")}
                className="mt-4"
              >
                Become an Expert
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Verification check - if not verified, show pending verification page
  if (!profile.isVerified) {
    return (
      <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-20">
          <Card className="max-w-2xl mx-auto border border-slate-200 shadow-sm">
          <CardContent className="py-12 text-center">
            <div className="h-20 w-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-10 w-10 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Verification Pending</h2>
            <p className="text-gray-600 mb-6">
              Your expert application is currently under review. Our team will verify your profile within 24-48 hours.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left max-w-md mx-auto">
              <h3 className="font-semibold text-yellow-800 mb-2">What happens next?</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Our team will review your credentials</li>
                <li>• You&apos;ll receive an email once verified</li>
                <li>• You can then access all expert features</li>
              </ul>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="mt-6"
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
      </div>
    );
  }

  const appointments = profile.appointments ?? [];

  // Stats calculations
  const totalAppointments = appointments.length;
  const pendingAppointments = appointments.filter(
    (a: AppointmentItem) => a.appointmentStatus === "PENDING"
  ).length;
  const completedAppointments = appointments.filter(
    (a: AppointmentItem) => a.appointmentStatus === "CONFIRMED"
  ).length;
  const totalEarnings =
    appointments
      .filter((a: AppointmentItem) => a.paymentStatus === "PAID")
      .reduce(
        (sum: number, a: AppointmentItem) =>
          sum + parseFloat(a.totalPaymemnt?.toString() || "0"),
        0
      ) || 0;
  const pendingPayments =
    appointments
      .filter(
        (a: AppointmentItem) =>
          a.paymentStatus === "PENDING" && a.appointmentStatus !== "CANCELLED"
      )
      .reduce(
        (sum: number, a: AppointmentItem) =>
          sum + parseFloat(a.totalPaymemnt?.toString() || "0"),
        0
      ) || 0;

  // Filter appointments
  const filteredAppointments = appointments.filter((apt: AppointmentItem) => {
    const matchesFilter =
      appointmentFilter === "all" ||
      apt.appointmentStatus === appointmentFilter.toUpperCase();
    const matchesSearch =
      !searchQuery ||
      apt.knowledgeSeeker?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.questions?.questionTitle?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
          {/* Header with Profile Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
                <Avatar className="h-20 w-20 border-4 border-slate-200">
              <AvatarImage
                src={profile.profilePictureUrl || undefined}
                alt={profile.name}
              />
                  <AvatarFallback className="bg-emerald-600 text-white font-semibold text-2xl">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>
            <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-600">
                    Expert Dashboard
                  </p>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-semibold text-slate-900">{profile.name}</h1>
                    {profile.isVerified && (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 mt-1">
                    {profile.jobTitle && (
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {profile.jobTitle}
                      </span>
                    )}
                    {profile.company && (
                      <span className="text-slate-400">at {profile.company}</span>
                    )}
                  </div>
                  {profile.location && (
                    <p className="text-slate-500 text-sm mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {profile.location}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-3">
                {profile.categories?.slice(0, 3).map((cat) => (
                  <Badge key={cat.id} variant="secondary">
                    {cat.name}
                  </Badge>
                ))}
                    {profile.categories?.length > 3 && (
                      <Badge variant="outline">+{profile.categories.length - 3}</Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => router.push(`/expert/${profile.id}`)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Public Profile
                </Button>
                <Button variant="outline" onClick={() => router.push("/expert/profile/edit")}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>
        </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="border border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-slate-500">Total Appointments</p>
                    <p className="text-2xl font-semibold mt-1 text-slate-900">{totalAppointments}</p>
                </div>
                  <Calendar className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

            <Card className="border border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-slate-500">Pending</p>
                    <p className="text-2xl font-semibold mt-1 text-slate-900">{pendingAppointments}</p>
                </div>
                  <Clock className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

            <Card className="border border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-slate-500">Completed</p>
                    <p className="text-2xl font-semibold mt-1 text-slate-900">{completedAppointments}</p>
                </div>
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

            <Card className="border border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-slate-500">Total Earnings</p>
                    <p className="text-2xl font-semibold mt-1 text-slate-900">
                      ${totalEarnings.toFixed(2)}
                    </p>
                </div>
                  <DollarSign className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
        </div>

          {/* Tabs Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 bg-white border border-slate-200">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="availability">Availability</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Appointments */}
                <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Appointments</CardTitle>
                    <CardDescription>Your latest booking activity</CardDescription>
          </CardHeader>
          <CardContent>
                    {profile.appointments?.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No appointments yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {appointments.slice(0, 5).map((apt) => (
                          <div
                            key={apt.id}
                            className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-gray-200 text-gray-600">
                                  {apt.knowledgeSeeker?.name?.charAt(0) || "?"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {apt.knowledgeSeeker?.name || "Unknown"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatDate(apt.appointmentDate)} at {formatTime(apt.appointmentTime)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  apt.appointmentStatus === "CONFIRMED"
                                    ? "default"
                                    : apt.appointmentStatus === "CANCELLED"
                                    ? "destructive"
                                    : "secondary"
                                }
                              >
                                {apt.appointmentStatus}
                              </Badge>
                              {apt.communicationMedium === "VIDEO_CALL" && <Video className="h-4 w-4 text-gray-400" />}
                              {apt.communicationMedium === "AUDIO_CALL" && <Phone className="h-4 w-4 text-gray-400" />}
                              {apt.communicationMedium === "MESSAGE" && <MessageSquare className="h-4 w-4 text-gray-400" />}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {profile.appointments?.length > 5 && (
                      <Button
                        variant="link"
                        className="w-full mt-4"
                        onClick={() => setActiveTab("appointments")}
                      >
                        View all appointments
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Stats & Info */}
                <div className="space-y-6">
                  {/* Earnings Summary */}
                  <Card className="border border-slate-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Earnings Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Earned</span>
                        <span className="font-bold text-green-600">${totalEarnings.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Pending</span>
                        <span className="font-medium text-yellow-600">${pendingPayments.toFixed(2)}</span>
                      </div>
                      <div className="border-t pt-4">
                        <Button variant="outline" className="w-full" onClick={() => setActiveTab("payments")}>
                          View Payment History
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Availability Status */}
                  <Card className="border border-slate-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Availability</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-600">Status</span>
                        <Badge className={profile.isAvailable ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                          {profile.isAvailable ? "Available" : "Unavailable"}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">Available Days:</p>
                        <div className="flex flex-wrap gap-1">
                          {profile.availableDays?.map((day) => (
                            <Badge key={day} variant="outline" className="text-xs">
                              {formatDay(day)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button variant="outline" className="w-full mt-4" onClick={() => setActiveTab("availability")}>
                        Manage Availability
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Appointments Tab */}
            <TabsContent value="appointments">
              <Card className="border border-slate-200 shadow-sm">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle>All Appointments</CardTitle>
                      <CardDescription>Manage your appointments with seekers</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Search appointments..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64"
                      />
                      <Select value={appointmentFilter} onValueChange={setAppointmentFilter}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Filter" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredAppointments.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>No appointments found</p>
              </div>
            ) : (
              <div className="space-y-4">
                      {filteredAppointments.map((apt) => (
                  <div
                          key={apt.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <Avatar className="h-12 w-12">
                                <AvatarFallback className="bg-emerald-50 text-emerald-600">
                                  {apt.knowledgeSeeker?.name?.charAt(0) || "?"}
                                </AvatarFallback>
                              </Avatar>
                      <div>
                                <p className="font-semibold">
                                  {apt.knowledgeSeeker?.name || "Unknown Seeker"}
                        </p>
                        <p className="text-sm text-gray-500">
                                  {apt.questions?.questionTitle || "Direct Consultation"}
                                </p>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {formatDate(apt.appointmentDate)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {formatTime(apt.appointmentTime)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    {apt.communicationMedium === "VIDEO_CALL" && <Video className="h-4 w-4" />}
                                    {apt.communicationMedium === "AUDIO_CALL" && <Phone className="h-4 w-4" />}
                                    {apt.communicationMedium === "MESSAGE" && <MessageSquare className="h-4 w-4" />}
                                    {apt.communicationMedium?.replace("_", " ")}
                            </span>
                          </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <Badge
                                  className={
                                    apt.appointmentStatus === "CONFIRMED"
                                      ? "bg-green-100 text-green-800"
                                      : apt.appointmentStatus === "CANCELLED"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }
                                >
                                  {apt.appointmentStatus}
                                </Badge>
                                <p className="text-lg font-bold mt-1">
                                  ${parseFloat(apt.totalPaymemnt?.toString() || "0").toFixed(2)}
                                </p>
                                <Badge variant="outline" className="mt-1">
                                  {apt.paymentStatus}
                                </Badge>
                              </div>
                              {apt.appointmentStatus === "PENDING" && (
                                <div className="flex flex-col gap-2">
                                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                    Confirm
                                  </Button>
                                  <Button size="sm" variant="destructive">
                                    Decline
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="border border-slate-200 shadow-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Total Earnings</p>
                        <p className="text-3xl font-bold text-green-600">${totalEarnings.toFixed(2)}</p>
                      </div>
                      <DollarSign className="h-10 w-10 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200 shadow-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Pending Payments</p>
                        <p className="text-3xl font-bold text-yellow-600">${pendingPayments.toFixed(2)}</p>
                      </div>
                      <Clock className="h-10 w-10 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200 shadow-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Paid Sessions</p>
                        <p className="text-3xl font-bold">
                          {appointments.filter((a) => a.paymentStatus === "PAID").length}
                        </p>
                      </div>
                      <CheckCircle className="h-10 w-10 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                  <CardDescription>Track your earnings and payment status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">Date</th>
                          <th className="text-left py-3 px-4 font-medium">Client</th>
                          <th className="text-left py-3 px-4 font-medium">Service</th>
                          <th className="text-left py-3 px-4 font-medium">Amount</th>
                          <th className="text-left py-3 px-4 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.slice(0, 10).map((apt) => (
                          <tr key={apt.id} className="border-b hover:bg-slate-50">
                            <td className="py-3 px-4">{formatDate(apt.appointmentDate)}</td>
                            <td className="py-3 px-4">{apt.knowledgeSeeker?.name || "Unknown"}</td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {apt.communicationMedium?.replace("_", " ")}
                            </td>
                            <td className="py-3 px-4 font-medium">
                              ${parseFloat(apt.totalPaymemnt?.toString() || "0").toFixed(2)}
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                className={
                                  apt.paymentStatus === "PAID"
                                    ? "bg-green-100 text-green-800"
                                    : apt.paymentStatus === "FAILED"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }
                              >
                                {apt.paymentStatus}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Availability Tab */}
            <TabsContent value="availability">
              <Card className="border border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Manage Availability</CardTitle>
                  <CardDescription>Set when you&apos;re available for appointments</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Availability Status */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium">Availability Status</p>
                      <p className="text-sm text-gray-500">Toggle to pause new bookings</p>
                    </div>
                    <Badge className={profile.isAvailable ? "bg-emerald-600 text-white" : "bg-slate-500 text-white"}>
                      {profile.isAvailable ? "Available" : "Unavailable"}
                    </Badge>
                  </div>

                  {/* Available Days */}
                  <div>
                    <Label className="text-base font-semibold">Available Days</Label>
                    <p className="text-sm text-gray-500 mb-3">Days when you accept appointments</p>
                    <div className="flex flex-wrap gap-2">
                      {["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"].map((day) => (
                        <Badge
                          key={day}
                          variant={profile.availableDays?.includes(day) ? "default" : "outline"}
                          className="cursor-pointer"
                        >
                          {formatDay(day)}
                        </Badge>
                      ))}
                    </div>
                      </div>

                  {/* Available Times */}
                  <div>
                    <Label className="text-base font-semibold">Time Slots</Label>
                    <p className="text-sm text-gray-500 mb-3">Your available time slots</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.availableTimes?.map((time) => (
                        <Badge key={time} variant="outline" className="bg-emerald-50">
                          <Clock className="h-3 w-3 mr-1" />
                          {time}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Languages */}
                  <div>
                    <Label className="text-base font-semibold">Languages</Label>
                    <p className="text-sm text-gray-500 mb-3">Languages you offer sessions in</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.availableLanguages?.map((lang) => (
                        <Badge key={lang} variant="outline">
                          {lang}
                        </Badge>
                ))}
              </div>
                  </div>

                  <Button className="w-full md:w-auto">
                    <Save className="h-4 w-4 mr-2" />
                    Update Availability
                  </Button>
          </CardContent>
        </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
