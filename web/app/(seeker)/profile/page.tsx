"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Mail,
  Phone,
  Camera,
  Save,
  Calendar,
  Loader2,
  CreditCard,
  IndianRupee,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { seekerApi } from "@/lib/api/seeker";
import { getCategories } from "@/lib/get-categories";
import { flattenCategories } from "@/lib/category-utils";
import { Category } from "@/types/category.types";
import { Appointment } from "@/types/appointment.types";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface SeekerProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  profilePictureUrl: string | null;
  isOnboarded: boolean;
  interestedCategories: Category[];
  appointments: Appointment[];
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<SeekerProfile | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [profileData, categoriesData] = await Promise.all([
        seekerApi.getProfile(),
        getCategories(),
      ]);

      setProfile(profileData as SeekerProfile);
      setCategories(categoriesData);
      
      // Set form values
      setName(profileData.name);
      setEmail(profileData.email);
      setPhone(profileData.phone);
      setProfilePictureUrl(profileData.profilePictureUrl || "");
      setSelectedCategoryIds(
        profileData.interestedCategories?.map((cat: Category) => cat.id) || []
      );
    } catch (error: unknown) {
      console.error("Error loading profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await seekerApi.updateProfile({
        name,
        email,
        phone,
        categoryIds: selectedCategoryIds,
        profilePictureUrl: profilePictureUrl || undefined,
      });

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      // Reload data
      await loadData();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: err.response?.data?.error || "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "Invalid date";
    
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateObj);
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const flatCategories = flattenCategories(categories);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="mt-2">Loading profile...</p>
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
              <p>Profile not found. Please contact support.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-6xl mx-auto space-y-6">
          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={profile.profilePictureUrl || undefined} />
                    <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-emerald-600">
                      Seeker Profile
                    </p>
                    <h1 className="text-2xl font-semibold text-slate-900">{profile.name}</h1>
                    <p className="text-sm text-slate-500">@{profile.user.username}</p>
                  </div>
                </div>
                <Button
                  onClick={() => router.push("/appointments")}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  View appointments
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white border border-slate-200">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {/* Profile Header Card */}
            <Card>
              <CardHeader>
                <div className="flex items-start gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-4 border-gray-200">
                      <AvatarImage
                        src={profilePictureUrl || undefined}
                        alt={name}
                      />
                      <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-500 text-white font-semibold text-2xl">
                        {getInitials(name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">{name}</CardTitle>
                    <CardDescription className="text-base">
                      @{profile.user.username}
                    </CardDescription>
                    <div className="mt-4 flex gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{email}</span>
                      </div>
                      {phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Edit Profile Form */}
            <Card>
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>
                  Update your personal information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture URL */}
                <div className="space-y-2">
                  <Label htmlFor="profilePicture">Profile Picture URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="profilePicture"
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={profilePictureUrl}
                      onChange={(e) => setProfilePictureUrl(e.target.value)}
                    />
                    <Button variant="outline" size="icon">
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Enter a URL to your profile picture
                  </p>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                {/* Interested Categories */}
                <div className="space-y-2">
                  <Label>Interested Categories</Label>
                  <p className="text-sm text-gray-500 mb-3">
                    Select the topics you&apos;re interested in
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

                {/* Save Button */}
                <div className="flex justify-end">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving || !name || !email || !phone}
                    size="lg"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Appointments Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Appointments</CardTitle>
                    <CardDescription>
                      Your 10 most recent appointments
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/appointments")}
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {!profile.appointments || profile.appointments.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No appointments yet</p>
                    <p className="text-sm">
                      Your appointments will appear here
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-semibold text-sm">Expert</th>
                          <th className="text-left py-3 px-4 font-semibold text-sm">Question</th>
                          <th className="text-left py-3 px-4 font-semibold text-sm">Date & Time</th>
                          <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                          <th className="text-left py-3 px-4 font-semibold text-sm">Payment</th>
                          <th className="text-left py-3 px-4 font-semibold text-sm">Amount</th>
                          <th className="text-left py-3 px-4 font-semibold text-sm">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {profile.appointments.slice(0, 10).map((appointment) => (
                          <tr key={appointment.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage
                                    src={
                                      appointment.knowledgeProvider
                                        ?.profilePictureUrl || undefined
                                    }
                                    alt={appointment.knowledgeProvider?.name || "Expert"}
                                  />
                                  <AvatarFallback>
                                    {getInitials(
                                      appointment.knowledgeProvider?.name || "EX"
                                    )}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-sm">
                                  {appointment.knowledgeProvider?.name || "Unknown Expert"}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-gray-600">
                                {appointment.questions?.questionTitle || "Consultation"}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-sm">
                                <div>{formatDate(appointment.appointmentDate)}</div>
                                <div className="text-gray-500 text-xs">
                                  {new Date(appointment.appointmentTime).toLocaleTimeString()}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                variant={
                                  appointment.appointmentStatus === "CONFIRMED"
                                    ? "default"
                                    : appointment.appointmentStatus === "CANCELLED"
                                    ? "destructive"
                                    : "secondary"
                                }
                                className="text-xs"
                              >
                                {appointment.appointmentStatus}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                className={cn(
                                  "text-xs",
                                  getPaymentStatusColor(appointment.paymentStatus)
                                )}
                              >
                                {appointment.paymentStatus}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-semibold">
                                ${( appointment.totalPaymemnt || 0).toString()}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/appointments/${appointment.id}`)}
                              >
                                View
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle>Payment History</CardTitle>
                    <CardDescription>
                      View all your payments for consultations and sessions
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!profile.appointments || profile.appointments.filter(a => a.paymentStatus === "PAID").length === 0 ? (
                  <div className="text-center py-12">
                    <IndianRupee className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 font-medium">No payment history</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Your completed payments will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Payment Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                      <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                        <p className="text-sm text-green-600 font-medium">Total Paid</p>
                        <p className="text-2xl font-bold text-green-700">
                          ₹{profile.appointments
                            .filter(a => a.paymentStatus === "PAID")
                            .reduce((sum, a) => sum + Number(a.totalPaymemnt || 0), 0)}
                        </p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <p className="text-sm text-blue-600 font-medium">Completed Sessions</p>
                        <p className="text-2xl font-bold text-blue-700">
                          {profile.appointments.filter(a => a.paymentStatus === "PAID").length}
                        </p>
                      </div>
                      <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                        <p className="text-sm text-yellow-600 font-medium">Pending Payments</p>
                        <p className="text-2xl font-bold text-yellow-700">
                          {profile.appointments.filter(a => a.paymentStatus === "PENDING").length}
                        </p>
                      </div>
                    </div>

                    {/* Payment List */}
                    <div className="space-y-3">
                      {profile.appointments
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((appointment) => (
                          <div
                            key={appointment.id}
                            className={cn(
                              "flex items-center justify-between p-4 rounded-xl border",
                              appointment.paymentStatus === "PAID"
                                ? "bg-green-50 border-green-200"
                                : appointment.paymentStatus === "FAILED"
                                ? "bg-red-50 border-red-200"
                                : "bg-yellow-50 border-yellow-200"
                            )}
                          >
                            <div className="flex items-center gap-4">
                              <Avatar className="h-10 w-10">
                                <AvatarImage
                                  src={appointment.knowledgeProvider?.profilePictureUrl || undefined}
                                />
                                <AvatarFallback>
                                  {getInitials(appointment.knowledgeProvider?.name || "EX")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold text-slate-800">
                                  Session with {appointment.knowledgeProvider?.name || "Expert"}
                                </p>
                                <p className="text-sm text-slate-500">
                                  {appointment.questions?.questionTitle || "Consultation"} • {formatDate(appointment.appointmentDate)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={cn(
                                "font-bold text-lg",
                                appointment.paymentStatus === "PAID" ? "text-green-600" : "text-slate-600"
                              )}>
                                ₹{Number(appointment.totalPaymemnt || 0)}
                              </p>
                              <Badge
                                className={cn(
                                  "text-xs",
                                  appointment.paymentStatus === "PAID"
                                    ? "bg-green-100 text-green-700"
                                    : appointment.paymentStatus === "FAILED"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-yellow-100 text-yellow-700"
                                )}
                              >
                                {appointment.paymentStatus === "PAID" && <CheckCircle className="h-3 w-3 mr-1" />}
                                {appointment.paymentStatus === "PENDING" && <Clock className="h-3 w-3 mr-1" />}
                                {appointment.paymentStatus === "FAILED" && <AlertCircle className="h-3 w-3 mr-1" />}
                                {appointment.paymentStatus}
                              </Badge>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>
                  Customize your notification and communication preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Set your preferences to get the best experience and help us recommend the right experts for you.
                  </p>
                  <Button
                    onClick={() => router.push("/profile/preferences")}
                    size="lg"
                  >
                    Open Preferences Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>
                  Manage your account settings and security
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Update your account information, change password, and manage security settings.
                  </p>
                  <Button
                    onClick={() => router.push("/profile/settings")}
                    size="lg"
                  >
                    Open Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
  );
}

