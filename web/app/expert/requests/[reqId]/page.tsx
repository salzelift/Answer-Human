"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Send,
  Mail,
  DollarSign,
  Video,
  Phone,
  Sparkles,
} from "lucide-react";
import api from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";

interface Question {
  id: string;
  questionTitle: string;
  questionDescription: string;
  questionCategory: string;
  questionTags: string[];
  questionStatus: string;
  createdAt: string;
  updatedAt: string;
  knowledgeSeeker?: {
    id: string;
    name: string;
    email: string;
    profilePictureUrl?: string | null;
  };
}

const DURATION_OPTIONS = [
  { value: "30 minutes", label: "30 minutes" },
  { value: "1 hour", label: "1 hour" },
  { value: "1.5 hours", label: "1.5 hours" },
  { value: "2 hours", label: "2 hours" },
  { value: "3+ hours", label: "3+ hours" },
];

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const reqId = params.reqId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [question, setQuestion] = useState<Question | null>(null);
  const [hasPitched, setHasPitched] = useState(false);
  
  // Pitch form state
  const [pitchMessage, setPitchMessage] = useState("");
  const [proposedPrice, setProposedPrice] = useState("");
  const [communicationMedium, setCommunicationMedium] = useState("VIDEO_CALL");
  const [estimatedDuration, setEstimatedDuration] = useState("");

  const loadQuestion = useCallback(async () => {
    try {
      setIsLoading(true);
      // Fetch from seeker endpoint
      const response = await api.get(`/seeker/questions/${reqId}`);
      setQuestion(response.data.question);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      console.error("Error loading question:", error);
      toast({
        title: "Error",
        description: err.response?.data?.error || "Failed to load request",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [reqId, toast]);

  useEffect(() => {
    loadQuestion();
  }, [loadQuestion]);

  const handleSubmitPitch = async () => {
    if (!pitchMessage.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a pitch message",
        variant: "destructive",
      });
      return;
    }

    if (!proposedPrice || parseFloat(proposedPrice) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please provide a valid price",
        variant: "destructive",
      });
      return;
    }

    if (!estimatedDuration) {
      toast({
        title: "Validation Error",
        description: "Please select an estimated duration",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      await api.post("/proposals", {
        questionId: reqId,
        expertId: user?.id,
        message: pitchMessage,
        price: parseFloat(proposedPrice),
        communicationMedium,
        estimatedDuration,
      });

      toast({
        title: "Pitch Submitted!",
        description: "Your proposal has been sent to the seeker successfully.",
      });

      setHasPitched(true);
      setPitchMessage("");
      setProposedPrice("");
      setEstimatedDuration("");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      console.error("Error submitting pitch:", error);
      toast({
        title: "Error",
        description: err.response?.data?.error || "Failed to submit pitch",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: {
        label: "Pending",
        className: "bg-yellow-100 text-yellow-700 border-yellow-300",
        icon: Clock,
      },
      ANSWERED: {
        label: "Answered",
        className: "bg-green-100 text-green-700 border-green-300",
        icon: CheckCircle,
      },
      CLOSED: {
        label: "Closed",
        className: "bg-gray-100 text-gray-700 border-gray-300",
        icon: AlertCircle,
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <Badge className={cn("border-2 font-medium text-sm px-4 py-2", config.className)}>
        <Icon className="h-4 w-4 mr-2" />
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-emerald-600" />
            <p className="mt-4 text-lg font-medium">Loading request...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-md mx-auto">
            <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-10 w-10 text-slate-400" />
            </div>
            <h2 className="text-2xl font-semibold mb-4">Request Not Found</h2>
            <Button onClick={() => router.push("/expert/requests")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Requests
            </Button>
          </div>
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
            onClick={() => router.push("/expert/requests")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Requests
          </Button>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-600">
                    Request Details
                  </p>
                  <h1 className="text-3xl font-semibold text-slate-900">Request Details</h1>
                  <p className="text-slate-600 mt-1">
                    Submitted on {formatDate(question.createdAt)}
                  </p>
                </div>
              </div>
              {getStatusBadge(question.questionStatus)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question Details */}
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-200">
                <CardTitle className="text-2xl">{question.questionTitle}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Category & Tags */}
                <div>
                  <Label className="text-sm font-semibold text-slate-700 mb-3 block">
                    Category & Tags
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-emerald-600 text-white border-0 text-sm px-4 py-2">
                      {question.questionCategory}
                    </Badge>
                    {question.questionTags.map((tag, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="bg-slate-50 text-slate-700 border-slate-200 font-medium text-sm px-3 py-1.5"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label className="text-sm font-semibold text-slate-700 mb-3 block">
                    Question Description
                  </Label>
                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                    <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                      {question.questionDescription}
                    </p>
                  </div>
                </div>

                {/* Pitch Section */}
                {question.questionStatus === "PENDING" && !hasPitched && (
                  <div className="pt-6 border-t space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800">Submit Your Pitch</h3>
                        <p className="text-sm text-slate-500">
                          Introduce yourself and explain how you can help
                        </p>
                      </div>
                    </div>

                    {/* Pitch Message */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">
                        Your Pitch <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        placeholder="Introduce yourself and explain how you can help with this question. Share your relevant experience and why you're the right expert for this..."
                        value={pitchMessage}
                        onChange={(e) => setPitchMessage(e.target.value)}
                        rows={6}
                        className="rounded-xl resize-none"
                      />
                    </div>

                    {/* Price and Duration Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">
                          Proposed Price <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            type="number"
                            placeholder="e.g., 50"
                            value={proposedPrice}
                            onChange={(e) => setProposedPrice(e.target.value)}
                            className="pl-9 rounded-xl"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">
                          Estimated Duration <span className="text-red-500">*</span>
                        </Label>
                        <Select value={estimatedDuration} onValueChange={setEstimatedDuration}>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent>
                            {DURATION_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Communication Medium */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-slate-700">
                        Preferred Communication
                      </Label>
                      <RadioGroup
                        value={communicationMedium}
                        onValueChange={setCommunicationMedium}
                        className="grid grid-cols-3 gap-3"
                      >
                        <div
                          className={cn(
                            "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                            communicationMedium === "VIDEO_CALL"
                              ? "border-emerald-500 bg-emerald-50"
                              : "border-slate-200 hover:border-slate-300"
                          )}
                          onClick={() => setCommunicationMedium("VIDEO_CALL")}
                        >
                          <RadioGroupItem value="VIDEO_CALL" id="video" className="sr-only" />
                          <Video className={cn(
                            "h-5 w-5",
                            communicationMedium === "VIDEO_CALL" ? "text-emerald-600" : "text-slate-400"
                          )} />
                          <Label htmlFor="video" className="text-sm font-medium cursor-pointer">
                            Video
                          </Label>
                        </div>
                        <div
                          className={cn(
                            "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                            communicationMedium === "AUDIO_CALL"
                              ? "border-emerald-500 bg-emerald-50"
                              : "border-slate-200 hover:border-slate-300"
                          )}
                          onClick={() => setCommunicationMedium("AUDIO_CALL")}
                        >
                          <RadioGroupItem value="AUDIO_CALL" id="audio" className="sr-only" />
                          <Phone className={cn(
                            "h-5 w-5",
                            communicationMedium === "AUDIO_CALL" ? "text-emerald-600" : "text-slate-400"
                          )} />
                          <Label htmlFor="audio" className="text-sm font-medium cursor-pointer">
                            Audio
                          </Label>
                        </div>
                        <div
                          className={cn(
                            "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                            communicationMedium === "MESSAGE"
                              ? "border-emerald-500 bg-emerald-50"
                              : "border-slate-200 hover:border-slate-300"
                          )}
                          onClick={() => setCommunicationMedium("MESSAGE")}
                        >
                          <RadioGroupItem value="MESSAGE" id="message" className="sr-only" />
                          <MessageSquare className={cn(
                            "h-5 w-5",
                            communicationMedium === "MESSAGE" ? "text-emerald-600" : "text-slate-400"
                          )} />
                          <Label htmlFor="message" className="text-sm font-medium cursor-pointer">
                            Chat
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Submit Button */}
                    <Button
                      onClick={handleSubmitPitch}
                      disabled={isSubmitting || !pitchMessage.trim() || !proposedPrice || !estimatedDuration}
                      className="w-full h-12 text-base font-semibold bg-emerald-600 hover:bg-emerald-700"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Submitting Pitch...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-5 w-5" />
                          Submit Pitch
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Pitch Submitted Success */}
                {(hasPitched || question.questionStatus === "ANSWERED") && (
                  <div className="pt-6 border-t">
                    <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200">
                      <div className="flex items-center gap-3 mb-2">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                        <h3 className="text-lg font-bold text-green-800">
                          Pitch Submitted Successfully
                        </h3>
                      </div>
                      <p className="text-green-700">
                        Your proposal has been sent to the seeker. They will review it and contact you if they&apos;re interested.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Seeker Info */}
            <Card className="border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50 p-6 border-b border-slate-200">
                <CardTitle className="text-xl font-semibold text-slate-900 mb-1">
                  Seeker Information
                </CardTitle>
                <p className="text-slate-600 text-sm">
                  About the person who asked
                </p>
              </div>
              <CardContent className="pt-6 space-y-4">
                {/* Profile */}
                <div className="flex items-center gap-4 pb-4 border-b border-slate-200">
                  <Avatar className="h-16 w-16 border-2 border-slate-200">
                    <AvatarImage
                      src={question.knowledgeSeeker?.profilePictureUrl || undefined}
                    />
                    <AvatarFallback className="bg-emerald-600 text-white text-lg font-bold">
                      {question.knowledgeSeeker
                        ? getInitials(question.knowledgeSeeker.name)
                        : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-lg text-slate-900">
                      {question.knowledgeSeeker?.name || "Anonymous"}
                    </p>
                    <p className="text-sm text-slate-500">Knowledge Seeker</p>
                  </div>
                </div>

                {/* Contact Info */}
                {question.knowledgeSeeker && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <Mail className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-500 font-semibold">Email</p>
                        <p className="text-sm text-slate-800 truncate">
                          {question.knowledgeSeeker.email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-200">
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Clock className="h-5 w-5 text-emerald-600" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="w-0.5 h-full bg-gray-200 my-2" />
                  </div>
                  <div className="flex-1 pb-6">
                    <p className="font-semibold text-slate-800">Question Posted</p>
                    <p className="text-sm text-slate-500 mt-1">
                      {formatDate(question.createdAt)}
                    </p>
                  </div>
                </div>

                {question.updatedAt !== question.createdAt && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">Last Updated</p>
                      <p className="text-sm text-slate-500 mt-1">
                        {formatDate(question.updatedAt)}
                      </p>
                    </div>
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

