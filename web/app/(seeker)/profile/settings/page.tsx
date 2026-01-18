"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Loader2, ArrowLeft, Bell, Shield, User } from "lucide-react";
import { seekerApi } from "@/lib/api/seeker";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"];
const EDUCATION_LEVELS = [
  "High School",
  "Associate Degree",
  "Bachelor's Degree",
  "Master's Degree",
  "PhD",
  "Other",
];
const EXPERIENCE_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];
const DEVICES = ["Desktop", "Mobile", "Tablet"];

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Demographic state
  const [age, setAge] = useState<number | undefined>();
  const [gender, setGender] = useState("");
  const [occupation, setOccupation] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");

  // Technical preferences
  const [devicePreferences, setDevicePreferences] = useState<string[]>([]);

  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [appointmentReminders, setAppointmentReminders] = useState(true);
  const [expertMessages, setExpertMessages] = useState(true);
  const [promotionalEmails, setPromotionalEmails] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const data = await seekerApi.getProfile();
      const profile = data;

      // Load demographic data
      setAge(profile.age);
      setGender(profile.gender || "");
      setOccupation(profile.occupation || "");
      setEducationLevel(profile.educationLevel || "");
      setExperienceLevel(profile.experienceLevel || "");

      // Load technical preferences
      setDevicePreferences(profile.devicePreferences || []);

      // Load notification preferences
      if (profile.notificationPreferences) {
        const prefs = profile.notificationPreferences as any;
        setEmailNotifications(prefs.emailNotifications ?? true);
        setSmsNotifications(prefs.smsNotifications ?? false);
        setPushNotifications(prefs.pushNotifications ?? true);
        setAppointmentReminders(prefs.appointmentReminders ?? true);
        setExpertMessages(prefs.expertMessages ?? true);
        setPromotionalEmails(prefs.promotionalEmails ?? false);
      }
    } catch (error: any) {
      console.error("Error loading profile:", error);
      toast({
        title: "Error",
        description: "Failed to load settings",
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
        age: age || undefined,
        gender: gender || undefined,
        occupation: occupation || undefined,
        educationLevel: educationLevel || undefined,
        experienceLevel: experienceLevel || undefined,
        devicePreferences,
        notificationPreferences: {
          emailNotifications,
          smsNotifications,
          pushNotifications,
          appointmentReminders,
          expertMessages,
          promotionalEmails,
        },
      });

      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDevice = (device: string) => {
    if (devicePreferences.includes(device)) {
      setDevicePreferences(devicePreferences.filter((d) => d !== device));
    } else {
      setDevicePreferences([...devicePreferences, device]);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="mt-2">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto space-y-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/profile")}
            className="w-fit"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>

          <Card className="border border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Settings</CardTitle>
              <CardDescription>
                Control your demographic, notification, and device preferences.
              </CardDescription>
            </CardHeader>
          </Card>

          <Tabs defaultValue="demographic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white border border-slate-200">
              <TabsTrigger value="demographic">
                <User className="h-4 w-4 mr-2" />
                Demographic
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="technical">
                <Shield className="h-4 w-4 mr-2" />
                Technical
              </TabsTrigger>
            </TabsList>

          {/* Demographic Tab */}
          <TabsContent value="demographic" className="space-y-6">
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle>Demographic Information</CardTitle>
                <CardDescription>
                  Help us personalize your experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Age */}
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    min="1"
                    max="120"
                    value={age || ""}
                    onChange={(e) =>
                      setAge(e.target.value ? parseInt(e.target.value) : undefined)
                    }
                    placeholder="Enter your age"
                  />
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDERS.map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Occupation */}
                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="e.g., Software Engineer"
                  />
                </div>

                {/* Education Level */}
                <div className="space-y-2">
                  <Label>Education Level</Label>
                  <Select value={educationLevel} onValueChange={setEducationLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select education level" />
                    </SelectTrigger>
                    <SelectContent>
                      {EDUCATION_LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Experience Level */}
                <div className="space-y-2">
                  <Label>Experience Level</Label>
                  <Select
                    value={experienceLevel}
                    onValueChange={setExperienceLevel}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPERIENCE_LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Your general skill level in your field of interest
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how you want to be notified
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email Notifications */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-500">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                {/* SMS Notifications */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-gray-500">
                      Receive notifications via SMS
                    </p>
                  </div>
                  <Switch
                    checked={smsNotifications}
                    onCheckedChange={setSmsNotifications}
                  />
                </div>

                {/* Push Notifications */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-gray-500">
                      Receive push notifications in your browser
                    </p>
                  </div>
                  <Switch
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                  />
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-semibold mb-4">Notification Types</h4>

                  {/* Appointment Reminders */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="space-y-0.5">
                      <Label>Appointment Reminders</Label>
                      <p className="text-sm text-gray-500">
                        Get reminded about upcoming appointments
                      </p>
                    </div>
                    <Switch
                      checked={appointmentReminders}
                      onCheckedChange={setAppointmentReminders}
                    />
                  </div>

                  {/* Expert Messages */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="space-y-0.5">
                      <Label>Expert Messages</Label>
                      <p className="text-sm text-gray-500">
                        Get notified when experts send you messages
                      </p>
                    </div>
                    <Switch
                      checked={expertMessages}
                      onCheckedChange={setExpertMessages}
                    />
                  </div>

                  {/* Promotional Emails */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Promotional Emails</Label>
                      <p className="text-sm text-gray-500">
                        Receive special offers and updates
                      </p>
                    </div>
                    <Switch
                      checked={promotionalEmails}
                      onCheckedChange={setPromotionalEmails}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Technical Tab */}
          <TabsContent value="technical" className="space-y-6">
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle>Technical Preferences</CardTitle>
                <CardDescription>
                  Optimize your experience across devices
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Device Preferences */}
                <div className="space-y-2">
                  <Label>Device Preferences</Label>
                  <p className="text-sm text-gray-500 mb-3">
                    Select the devices you commonly use
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {DEVICES.map((device) => (
                      <Badge
                        key={device}
                        variant={
                          devicePreferences.includes(device)
                            ? "default"
                            : "outline"
                        }
                        className={cn(
                          "cursor-pointer transition-colors px-4 py-2",
                          devicePreferences.includes(device)
                            ? "bg-primary hover:bg-primary/90"
                            : "hover:bg-gray-100"
                        )}
                        onClick={() => toggleDevice(device)}
                      >
                        {device}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Data Usage */}
                <div className="space-y-4 pt-6 border-t">
                  <h4 className="font-semibold">Data & Privacy</h4>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">
                      We collect usage data to improve your experience and provide
                      better expert recommendations.
                    </p>
                    <Button variant="outline" size="sm">
                      View Privacy Policy
                    </Button>
                  </div>
                </div>

                {/* Profile Completion */}
                <div className="space-y-2 pt-6 border-t">
                  <Label>Profile Completion</Label>
                  <p className="text-sm text-gray-500">
                    Complete your profile to get better recommendations
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: "0%" }}
                      />
                    </div>
                    <span className="text-sm font-semibold">0%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end mt-6">
          <Button onClick={handleSave} disabled={isSaving} size="lg">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
