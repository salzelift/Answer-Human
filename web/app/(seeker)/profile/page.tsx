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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Phone,
  Camera,
  Save,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { seekerApi } from "@/lib/api/seeker";
import { getCategories } from "@/lib/get-categories";
import { flattenCategories } from "@/lib/category-utils";
import { Category } from "@/types/category.types";
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
  appointments: any[];
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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
        profileData.interestedCategories?.map((cat: any) => cat.id) || []
      );
    } catch (error: any) {
      console.error("Error loading profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to save profile",
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

  const getAppointmentStatusIcon = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "CANCELLED":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
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
      <div className="container mx-auto px-4 py-20 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-20">
        <Card>
          <CardContent className="py-12 text-center">
            <p>Profile not found. Please contact support.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
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
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold text-2xl">
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
                    Select the topics you're interested in
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
                        {profile.appointments.slice(0, 10).map((appointment: any) => (
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
                                ${(appointment.totalPayment || appointment.totalPaymemnt || 0).toString()}
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
  );
}

