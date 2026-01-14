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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Loader2, ArrowLeft } from "lucide-react";
import { seekerApi } from "@/lib/api/seeker";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const COMMUNICATION_MEDIUMS = ["VIDEO_CALL", "AUDIO_CALL", "MESSAGE"];
const PRICE_RANGES = ["$0-$50", "$50-$100", "$100-$200", "$200+"];
const SESSION_DURATIONS = ["30min", "1hr", "2hr", "3hr+"];
const TIME_SLOTS = ["Morning", "Afternoon", "Evening", "Night"];
const LANGUAGES = ["English", "Spanish", "French", "German", "Chinese", "Japanese", "Hindi", "Arabic", "Portuguese", "Russian"];
const BUDGET_RANGES = ["$0-$100", "$100-$500", "$500-$1000", "$1000+"];
const URGENCY_LEVELS = ["Low", "Medium", "High", "Critical"];
const LEARNING_STYLES = ["Visual", "Auditory", "Reading", "Kinesthetic", "Mixed"];
const RESPONSE_TIMES = ["Immediate", "Within 1hr", "Within 24hr", "Flexible"];
const EXPERT_LOCATIONS = ["Same timezone", "Same country", "Any"];

export default function PreferencesPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Preference state
  const [preferredCommunicationMedium, setPreferredCommunicationMedium] = useState("");
  const [preferredPriceRange, setPreferredPriceRange] = useState("");
  const [preferredSessionDuration, setPreferredSessionDuration] = useState("");
  const [preferredTimeSlots, setPreferredTimeSlots] = useState<string[]>([]);
  const [preferredLanguages, setPreferredLanguages] = useState<string[]>([]);
  const [budgetRange, setBudgetRange] = useState("");
  const [urgencyLevel, setUrgencyLevel] = useState("");
  const [learningStyle, setLearningStyle] = useState("");
  const [preferredExpertRating, setPreferredExpertRating] = useState<number>(0);
  const [preferredResponseTime, setPreferredResponseTime] = useState("");
  const [preferredExpertLocation, setPreferredExpertLocation] = useState("");
  const [timezone, setTimezone] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const data = await seekerApi.getProfile();
      const profile = data;

      // Load preferences
      setPreferredCommunicationMedium(profile.preferredCommunicationMedium || "");
      setPreferredPriceRange(profile.preferredPriceRange || "");
      setPreferredSessionDuration(profile.preferredSessionDuration || "");
      setPreferredTimeSlots(profile.preferredTimeSlots || []);
      setPreferredLanguages(profile.preferredLanguages || []);
      setBudgetRange(profile.budgetRange || "");
      setUrgencyLevel(profile.urgencyLevel || "");
      setLearningStyle(profile.learningStyle || "");
      setPreferredExpertRating(parseFloat(profile.preferredExpertRating || "0"));
      setPreferredResponseTime(profile.preferredResponseTime || "");
      setPreferredExpertLocation(profile.preferredExpertLocation || "");
      setTimezone(profile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
    } catch (error: any) {
      console.error("Error loading profile:", error);
      toast({
        title: "Error",
        description: "Failed to load preferences",
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
        preferredCommunicationMedium: preferredCommunicationMedium || undefined,
        preferredPriceRange: preferredPriceRange || undefined,
        preferredSessionDuration: preferredSessionDuration || undefined,
        preferredTimeSlots,
        preferredLanguages,
        budgetRange: budgetRange || undefined,
        urgencyLevel: urgencyLevel || undefined,
        learningStyle: learningStyle || undefined,
        preferredExpertRating: preferredExpertRating || undefined,
        preferredResponseTime: preferredResponseTime || undefined,
        preferredExpertLocation: preferredExpertLocation || undefined,
        timezone: timezone || undefined,
      });

      toast({
        title: "Success",
        description: "Preferences saved successfully",
      });
    } catch (error: any) {
      console.error("Error saving preferences:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to save preferences",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleItem = (item: string, list: string[], setList: (list: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2">Loading preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.push("/profile")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profile
        </Button>

        <h1 className="text-3xl font-bold mb-6">Preferences</h1>

        <Tabs defaultValue="communication" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="communication">Communication</TabsTrigger>
            <TabsTrigger value="learning">Learning</TabsTrigger>
            <TabsTrigger value="booking">Booking</TabsTrigger>
          </TabsList>

          {/* Communication Preferences */}
          <TabsContent value="communication" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Communication Preferences</CardTitle>
                <CardDescription>
                  Set your preferred way to communicate with experts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Preferred Communication Medium */}
                <div className="space-y-2">
                  <Label>Preferred Communication Medium</Label>
                  <Select
                    value={preferredCommunicationMedium}
                    onValueChange={setPreferredCommunicationMedium}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select medium" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMUNICATION_MEDIUMS.map((medium) => (
                        <SelectItem key={medium} value={medium}>
                          {medium.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Preferred Languages */}
                <div className="space-y-2">
                  <Label>Preferred Languages</Label>
                  <p className="text-sm text-gray-500 mb-3">
                    Select languages you're comfortable with
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map((language) => (
                      <Badge
                        key={language}
                        variant={
                          preferredLanguages.includes(language)
                            ? "default"
                            : "outline"
                        }
                        className={cn(
                          "cursor-pointer transition-colors",
                          preferredLanguages.includes(language)
                            ? "bg-primary hover:bg-primary/90"
                            : "hover:bg-gray-100"
                        )}
                        onClick={() =>
                          toggleItem(language, preferredLanguages, setPreferredLanguages)
                        }
                      >
                        {language}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Preferred Response Time */}
                <div className="space-y-2">
                  <Label>Preferred Response Time</Label>
                  <Select
                    value={preferredResponseTime}
                    onValueChange={setPreferredResponseTime}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select response time" />
                    </SelectTrigger>
                    <SelectContent>
                      {RESPONSE_TIMES.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Timezone */}
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Input
                    type="text"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    placeholder="e.g., America/New_York"
                  />
                  <p className="text-xs text-gray-500">
                    Current: {Intl.DateTimeFormat().resolvedOptions().timeZone}
                  </p>
                </div>

                {/* Preferred Expert Location */}
                <div className="space-y-2">
                  <Label>Preferred Expert Location</Label>
                  <Select
                    value={preferredExpertLocation}
                    onValueChange={setPreferredExpertLocation}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location preference" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPERT_LOCATIONS.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Learning Preferences */}
          <TabsContent value="learning" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Learning Preferences</CardTitle>
                <CardDescription>
                  Help us match you with the right experts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Learning Style */}
                <div className="space-y-2">
                  <Label>Learning Style</Label>
                  <Select value={learningStyle} onValueChange={setLearningStyle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select learning style" />
                    </SelectTrigger>
                    <SelectContent>
                      {LEARNING_STYLES.map((style) => (
                        <SelectItem key={style} value={style}>
                          {style}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    How do you learn best?
                  </p>
                </div>

                {/* Preferred Expert Rating */}
                <div className="space-y-2">
                  <Label>Minimum Expert Rating</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="number"
                      min="0"
                      max="5"
                      step="0.5"
                      value={preferredExpertRating}
                      onChange={(e) =>
                        setPreferredExpertRating(parseFloat(e.target.value))
                      }
                      className="w-24"
                    />
                    <span className="text-sm text-gray-500">
                      out of 5.0
                    </span>
                  </div>
                </div>

                {/* Urgency Level */}
                <div className="space-y-2">
                  <Label>Urgency Level</Label>
                  <Select value={urgencyLevel} onValueChange={setUrgencyLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select urgency level" />
                    </SelectTrigger>
                    <SelectContent>
                      {URGENCY_LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    How urgent is your need for help?
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Booking Preferences */}
          <TabsContent value="booking" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Preferences</CardTitle>
                <CardDescription>
                  Set your session and budget preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Preferred Price Range */}
                <div className="space-y-2">
                  <Label>Preferred Price Range</Label>
                  <Select
                    value={preferredPriceRange}
                    onValueChange={setPreferredPriceRange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select price range" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRICE_RANGES.map((range) => (
                        <SelectItem key={range} value={range}>
                          {range}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Budget Range */}
                <div className="space-y-2">
                  <Label>Monthly Budget</Label>
                  <Select value={budgetRange} onValueChange={setBudgetRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select budget range" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUDGET_RANGES.map((range) => (
                        <SelectItem key={range} value={range}>
                          {range}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Preferred Session Duration */}
                <div className="space-y-2">
                  <Label>Preferred Session Duration</Label>
                  <Select
                    value={preferredSessionDuration}
                    onValueChange={setPreferredSessionDuration}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {SESSION_DURATIONS.map((duration) => (
                        <SelectItem key={duration} value={duration}>
                          {duration}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Preferred Time Slots */}
                <div className="space-y-2">
                  <Label>Preferred Time Slots</Label>
                  <p className="text-sm text-gray-500 mb-3">
                    Select your preferred times of day
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {TIME_SLOTS.map((slot) => (
                      <Badge
                        key={slot}
                        variant={
                          preferredTimeSlots.includes(slot)
                            ? "default"
                            : "outline"
                        }
                        className={cn(
                          "cursor-pointer transition-colors",
                          preferredTimeSlots.includes(slot)
                            ? "bg-primary hover:bg-primary/90"
                            : "hover:bg-gray-100"
                        )}
                        onClick={() =>
                          toggleItem(slot, preferredTimeSlots, setPreferredTimeSlots)
                        }
                      >
                        {slot}
                      </Badge>
                    ))}
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
                Save Preferences
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
