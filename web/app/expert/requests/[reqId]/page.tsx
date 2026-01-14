"use client";

import { useState, useEffect } from "react";
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
import {
  Calendar,
  Clock,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Send,
  User,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import api from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const reqId = params.reqId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [question, setQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    loadQuestion();
  }, [reqId]);

  const loadQuestion = async () => {
    try {
      setIsLoading(true);
      // For now, we'll fetch from seeker endpoint - you may need to create a provider endpoint
      const response = await api.get(`/seeker/questions/${reqId}`);
      setQuestion(response.data.question);
    } catch (error: any) {
      console.error("Error loading question:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to load request",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide an answer",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      // Update question status to ANSWERED
      await api.put(`/seeker/questions/${reqId}`, {
        questionStatus: "ANSWERED",
      });

      toast({
        title: "Success!",
        description: "Your answer has been submitted successfully",
      });

      // Reload question to get updated status
      await loadQuestion();
      setAnswer("");
    } catch (error: any) {
      console.error("Error submitting answer:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to submit answer",
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
      <div className="container mx-auto px-4 py-20 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-purple-600" />
          <p className="mt-4 text-lg font-medium">Loading request...</p>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-md mx-auto">
          <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-10 w-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Request Not Found</h2>
          <Button onClick={() => router.push("/expert/requests")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Requests
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/expert/requests")}
            className="mb-4 hover:bg-white/80 transition-all hover:scale-105"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Requests
          </Button>

          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <MessageSquare className="h-7 w-7" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Request Details</h1>
                  <p className="text-blue-100 mt-1">
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
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                <CardTitle className="text-2xl">{question.questionTitle}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Category & Tags */}
                <div>
                  <Label className="text-sm font-bold text-gray-700 mb-3 block">
                    Category & Tags
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 text-sm px-4 py-2">
                      {question.questionCategory}
                    </Badge>
                    {question.questionTags.map((tag, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="bg-purple-50 text-purple-700 border-purple-200 font-medium text-sm px-3 py-1.5"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label className="text-sm font-bold text-gray-700 mb-3 block">
                    Question Description
                  </Label>
                  <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-100">
                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                      {question.questionDescription}
                    </p>
                  </div>
                </div>

                {/* Answer Section */}
                {question.questionStatus === "PENDING" && (
                  <div className="pt-6 border-t">
                    <Label className="text-base font-bold text-gray-800 mb-3 block">
                      Provide Your Answer
                    </Label>
                    <Textarea
                      placeholder="Write your detailed answer here..."
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      rows={8}
                      className="border-2 focus:border-purple-400 rounded-xl resize-none mb-4"
                    />
                    <Button
                      onClick={handleSubmitAnswer}
                      disabled={isSubmitting || !answer.trim()}
                      className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 h-12 text-base font-bold"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-5 w-5" />
                          Submit Answer
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {question.questionStatus === "ANSWERED" && (
                  <div className="pt-6 border-t">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                      <div className="flex items-center gap-3 mb-2">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                        <h3 className="text-lg font-bold text-green-800">
                          Question Answered
                        </h3>
                      </div>
                      <p className="text-green-700">
                        You have successfully answered this question.
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
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-6 text-white">
                <CardTitle className="text-xl font-bold mb-1">
                  Seeker Information
                </CardTitle>
                <p className="text-blue-100 text-sm">
                  About the person who asked
                </p>
              </div>
              <CardContent className="pt-6 space-y-4">
                {/* Profile */}
                <div className="flex items-center gap-4 pb-4 border-b">
                  <Avatar className="h-16 w-16 border-4 border-white shadow-lg ring-2 ring-purple-100">
                    <AvatarImage
                      src={question.knowledgeSeeker?.profilePictureUrl || undefined}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-bold">
                      {question.knowledgeSeeker
                        ? getInitials(question.knowledgeSeeker.name)
                        : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-lg text-gray-800">
                      {question.knowledgeSeeker?.name || "Anonymous"}
                    </p>
                    <p className="text-sm text-gray-500">Knowledge Seeker</p>
                  </div>
                </div>

                {/* Contact Info */}
                {question.knowledgeSeeker && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 font-semibold">Email</p>
                        <p className="text-sm text-gray-800 truncate">
                          {question.knowledgeSeeker.email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-600" />
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
                    <p className="font-bold text-gray-800">Question Posted</p>
                    <p className="text-sm text-gray-500 mt-1">
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
                      <p className="font-bold text-gray-800">Last Updated</p>
                      <p className="text-sm text-gray-500 mt-1">
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

