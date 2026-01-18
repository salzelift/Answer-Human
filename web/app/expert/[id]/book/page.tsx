"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar,
  Clock,
  ArrowLeft,
  CheckCircle,
  Loader2,
  Video,
  Phone,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { providerApi } from "@/lib/api/provider";
import { appointmentApi } from "@/lib/api/appointment";
import { useToast } from "@/hooks/use-toast";
import { KnowledgeProvider } from "@/types/expert.types";
import { AvailableSlot, CommunicationMedium, PaymentMethod } from "@/types/appointment.types";

interface GroupedSlots {
  date: string;
  times: string[];
}

export default function BookExpertPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const expertId = params.id as string;

  const [expert, setExpert] = useState<KnowledgeProvider | null>(null);
  const [availableSlots, setAvailableSlots] = useState<GroupedSlots[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [communicationMedium, setCommunicationMedium] = useState<string>("VIDEO_CALL");
  const [details, setDetails] = useState<string>("");
  const [step, setStep] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [expertData, slotsData] = await Promise.all([
          providerApi.getById(expertId),
          appointmentApi.getAvailableSlots(expertId),
        ]);
        setExpert(expertData);
        
        // Group slots by date
        const grouped = slotsData.reduce((acc: GroupedSlots[], slot: AvailableSlot) => {
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
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load booking information",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [expertId, toast]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(""); // Reset time when date changes
    setStep(2);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep(3);
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !communicationMedium) {
      toast({
        title: "Validation Error",
        description: "Please select a date, time, and communication medium",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Extract the start time from the time range (e.g., "09:00-10:00" -> "09:00")
      const timeStart = selectedTime.split("-")[0];

      await appointmentApi.create({
        expertId: expertId,
        appointmentDate: selectedDate, // ISO date string (YYYY-MM-DD)
        appointmentTime: timeStart, // Time string (HH:MM)
        communicationMedium: communicationMedium as CommunicationMedium,
        paymentMethod: PaymentMethod.RAZORPAY,
      });

      toast({
        title: "Success!",
        description: "Your appointment has been booked successfully",
      });

      // Redirect to appointments page
      setTimeout(() => {
        router.push("/appointments");
      }, 1500);
    } catch (error: any) {
      console.error("Error booking appointment:", error);
      toast({
        title: "Booking Failed",
        description: error.response?.data?.error || "Failed to book appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAvailableTimesForDate = (date: string): string[] => {
    const slot = availableSlots.find((s) => s.date === date);
    return slot?.times || [];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="mt-2">Loading booking information...</p>
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

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push(`/expert/${expertId}`)}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profile
          </Button>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-600">
                  Booking
                </p>
                <h1 className="text-3xl font-semibold text-slate-900">Book a Session</h1>
                <p className="text-slate-600 mt-1">
                  Schedule a session with {expert.name}
                </p>
              </div>
            </div>
            
            {/* Progress Steps */}
            <div className="flex items-center gap-2 mt-6 bg-slate-50 rounded-lg p-4 border border-slate-200">
              {[
                { num: 1, label: "Date" },
                { num: 2, label: "Time" },
                { num: 3, label: "Details" },
              ].map((s, idx) => (
                <div key={s.num} className="flex items-center flex-1">
                  <div className="flex items-center gap-2 flex-1">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                        step >= s.num
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {step > s.num ? <CheckCircle className="h-5 w-5" /> : s.num}
                    </div>
                    <span
                      className={`text-sm font-semibold ${
                        step >= s.num ? "text-slate-900" : "text-slate-500"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {idx < 2 && (
                    <div
                      className={`h-1 w-full mx-2 rounded-full transition-all ${
                        step > s.num ? "bg-emerald-600" : "bg-slate-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Booking Form */}
          <div className="md:col-span-2 space-y-6">
            {/* Step 1: Select Date */}
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="bg-white border-b border-slate-200">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div
                    className={`flex items-center justify-center h-10 w-10 rounded-full transition-all ${
                      step >= 1
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {step > 1 ? <CheckCircle className="h-6 w-6" /> : "1"}
                  </div>
                  <div>
                    <div className="font-bold">Select Date</div>
                    <p className="text-sm font-normal text-gray-600">
                      Choose your preferred date
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {availableSlots.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="h-10 w-10 text-slate-400" />
                    </div>
                    <p className="font-semibold text-lg mb-2 text-slate-800">No Available Slots</p>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto">
                      This expert doesn't have any available slots at the moment. Please check back later.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {availableSlots.map((slot, idx) => (
                      <button
                        key={slot.date}
                        onClick={() => handleDateSelect(slot.date)}
                        className={`group p-5 border rounded-xl text-left transition-all ${
                          selectedDate === slot.date
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-slate-200 hover:border-emerald-300 bg-white"
                        }`}
                        style={{
                          animationDelay: `${idx * 50}ms`,
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`h-10 w-10 rounded-lg flex items-center justify-center transition-all ${
                              selectedDate === slot.date
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-100 text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600"
                            }`}
                          >
                            <Calendar className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-gray-800 mb-1">
                              {new Date(slot.date).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <Clock className="h-3 w-3" />
                              {slot.times.length} slots
                            </div>
                        </div>
                          {selectedDate === slot.date && (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 2: Select Time */}
            {selectedDate && (
              <Card className="shadow-md border">
                <CardHeader className="bg-white border-b border-slate-200">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div
                      className={`flex items-center justify-center h-10 w-10 rounded-full transition-all ${
                        step >= 2
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {step > 2 ? <CheckCircle className="h-6 w-6" /> : "2"}
                    </div>
                    <div>
                      <div className="font-bold">Select Time</div>
                      <p className="text-sm font-normal text-gray-600">
                        Pick a convenient time slot
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 font-medium">Selected Date</p>
                        <p className="font-semibold text-slate-800">
                          {formatDate(selectedDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {getAvailableTimesForDate(selectedDate).map((time, idx) => (
                        <button
                        key={time}
                        onClick={() => handleTimeSelect(time)}
                        className={`group p-4 border rounded-xl text-sm font-bold transition-all ${
                          selectedTime === time
                            ? "border-emerald-500 bg-emerald-600 text-white"
                            : "border-slate-200 hover:border-emerald-300 bg-white text-slate-700"
                        }`}
                        style={{
                          animationDelay: `${idx * 30}ms`,
                        }}
                      >
                        <Clock
                          className={`h-4 w-4 inline mr-2 ${
                            selectedTime === time ? "text-white" : "text-emerald-600"
                          }`}
                        />
                        {time}
                        </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Communication & Details */}
            {selectedTime && (
              <Card className="border border-slate-200 shadow-sm">
                <CardHeader className="bg-white border-b border-slate-200">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div
                      className={`flex items-center justify-center h-10 w-10 rounded-full transition-all ${
                        step >= 3
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      3
                    </div>
                    <div>
                      <div className="font-bold">Communication & Details</div>
                      <p className="text-sm font-normal text-gray-600">
                        How would you like to connect?
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Communication Medium */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-slate-800">
                      Communication Medium
                    </Label>
                    <RadioGroup
                      value={communicationMedium}
                      onValueChange={setCommunicationMedium}
                    >
                      <div
                        className={`flex items-center space-x-3 p-4 border rounded-xl cursor-pointer transition-all ${
                          communicationMedium === "VIDEO_CALL"
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-slate-200 hover:border-emerald-300 bg-white"
                        }`}
                      >
                        <RadioGroupItem value="VIDEO_CALL" id="video" />
                        <Label
                          htmlFor="video"
                          className="flex items-center gap-3 cursor-pointer flex-1"
                        >
                          <div
                            className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                              communicationMedium === "VIDEO_CALL"
                                ? "bg-emerald-600"
                                : "bg-slate-100"
                            }`}
                          >
                            <Video
                              className={`h-5 w-5 ${
                                communicationMedium === "VIDEO_CALL"
                                  ? "text-white"
                                  : "text-slate-600"
                              }`}
                            />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800">Video Call</div>
                            <div className="text-xs text-slate-600">Face-to-face meeting</div>
                          </div>
                        </Label>
                        {communicationMedium === "VIDEO_CALL" && (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                      <div
                        className={`flex items-center space-x-3 p-4 border rounded-xl cursor-pointer transition-all ${
                          communicationMedium === "AUDIO_CALL"
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-slate-200 hover:border-emerald-300 bg-white"
                        }`}
                      >
                        <RadioGroupItem value="AUDIO_CALL" id="audio" />
                        <Label
                          htmlFor="audio"
                          className="flex items-center gap-3 cursor-pointer flex-1"
                        >
                          <div
                            className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                              communicationMedium === "AUDIO_CALL"
                                ? "bg-emerald-600"
                                : "bg-slate-100"
                            }`}
                          >
                            <Phone
                              className={`h-5 w-5 ${
                                communicationMedium === "AUDIO_CALL"
                                  ? "text-white"
                                  : "text-slate-600"
                              }`}
                            />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800">Audio Call</div>
                            <div className="text-xs text-slate-600">Voice only conversation</div>
                          </div>
                        </Label>
                        {communicationMedium === "AUDIO_CALL" && (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                      <div
                        className={`flex items-center space-x-3 p-4 border rounded-xl cursor-pointer transition-all ${
                          communicationMedium === "MESSAGE"
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-slate-200 hover:border-emerald-300 bg-white"
                        }`}
                      >
                        <RadioGroupItem value="MESSAGE" id="chat" />
                        <Label
                          htmlFor="chat"
                          className="flex items-center gap-3 cursor-pointer flex-1"
                        >
                          <div
                            className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                              communicationMedium === "MESSAGE"
                                ? "bg-emerald-600"
                                : "bg-slate-100"
                            }`}
                          >
                            <MessageSquare
                              className={`h-5 w-5 ${
                                communicationMedium === "MESSAGE"
                                  ? "text-white"
                                  : "text-slate-600"
                              }`}
                            />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800">Text Chat</div>
                            <div className="text-xs text-slate-600">Message-based session</div>
                          </div>
                        </Label>
                        {communicationMedium === "MESSAGE" && (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                    </RadioGroup>
                  </div>
                  
                  {/* Additional Details */}
                  <div className="space-y-3">
                    <Label htmlFor="details" className="text-base font-semibold text-slate-800">
                      Additional Details (Optional)
                    </Label>
                    <Textarea
                      id="details"
                      placeholder="Share any specific topics or questions you'd like to discuss during the session..."
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      rows={4}
                      className="rounded-xl resize-none"
                    />
                    <p className="text-xs text-slate-500">
                      Help the expert prepare for your session by sharing your goals
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 border-t border-slate-200">
                    <Button
                      className="w-full h-12 text-lg font-semibold"
                      onClick={handleSubmit}
                      disabled={isSubmitting || !selectedDate || !selectedTime}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                          Processing Booking...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-3 h-5 w-5" />
                          Confirm Booking
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Expert Summary */}
          <div>
            <Card className="sticky top-6 border border-slate-200 shadow-sm">
              <div className="p-6 border-b border-slate-200">
                <CardTitle className="text-2xl font-semibold text-slate-900 mb-1">
                  Booking Summary
                </CardTitle>
                <p className="text-slate-600 text-sm">
                  Review your booking details
                </p>
              </div>
              <CardContent className="pt-6 space-y-5">
                {/* Expert Info */}
                <div className="flex items-center gap-4 pb-5 border-b border-slate-200">
                  <div className="relative">
                    <Avatar className="h-16 w-16 border-2 border-slate-200">
                      <AvatarImage src={expert.profilePictureUrl || undefined} />
                      <AvatarFallback className="bg-emerald-600 text-white text-lg font-bold">
                        {expert.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-emerald-500 rounded-full border-2 border-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-lg text-slate-900">{expert.name}</p>
                    {expert.jobTitle && (
                      <p className="text-sm text-slate-600 font-medium">{expert.jobTitle}</p>
                    )}
                  </div>
                </div>

                {/* Selected Details */}
                <div className="space-y-3">
                  {selectedDate ? (
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-emerald-600 flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-emerald-700 font-semibold">Date</p>
                          <p className="font-semibold text-slate-800">{formatDate(selectedDate)}</p>
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500 font-semibold">Date</p>
                          <p className="text-sm text-slate-400">Not selected</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedTime ? (
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-emerald-600 flex items-center justify-center">
                          <Clock className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-emerald-700 font-semibold">Time</p>
                          <p className="font-semibold text-slate-800">{selectedTime}</p>
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500 font-semibold">Time</p>
                          <p className="text-sm text-slate-400">Not selected</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {communicationMedium ? (
                    <div
                      className={`p-4 rounded-xl border ${
                        communicationMedium === "VIDEO_CALL"
                          ? "bg-emerald-50 border-emerald-200"
                          : communicationMedium === "AUDIO_CALL"
                          ? "bg-emerald-50 border-emerald-200"
                          : "bg-emerald-50 border-emerald-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                            communicationMedium === "VIDEO_CALL"
                              ? "bg-emerald-600"
                              : communicationMedium === "AUDIO_CALL"
                              ? "bg-emerald-600"
                              : "bg-emerald-600"
                          }`}
                        >
                          {communicationMedium === "VIDEO_CALL" && (
                            <Video className="h-5 w-5 text-white" />
                          )}
                          {communicationMedium === "AUDIO_CALL" && (
                            <Phone className="h-5 w-5 text-white" />
                          )}
                          {communicationMedium === "MESSAGE" && (
                            <MessageSquare className="h-5 w-5 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-emerald-700">
                            Communication
                          </p>
                          <p className="font-semibold text-slate-800">
                            {communicationMedium === "VIDEO_CALL" && "Video Call"}
                            {communicationMedium === "AUDIO_CALL" && "Audio Call"}
                            {communicationMedium === "MESSAGE" && "Text Chat"}
                          </p>
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <div className="flex items-center gap-3">
                        <Video className="h-5 w-5 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500 font-semibold">Communication</p>
                          <p className="text-sm text-slate-400">Not selected</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {!selectedDate && (
                  <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <AlertCircle className="h-10 w-10 mx-auto text-slate-400 mb-3" />
                    <p className="text-sm text-slate-600 font-medium px-4">
                      Select a date and time to see your booking details
                    </p>
                  </div>
                )}
                </CardContent>
              </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

