"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Tag,
  FolderOpen,
  CheckCircle,
  Video,
  Phone,
  MessageSquare,
  DollarSign,
  MapPin,
  Briefcase,
} from "lucide-react";
import { Question, QuestionStatus } from "@/types/question.types";
import { Proposal } from "@/types/proposal.types";
import { CommunicationMedium } from "@/types/expert.types";
import { getQuestionById } from "@/lib/get-questions";
import { getProposalsByQuestionId } from "@/lib/get-proposals";
import { getSocket } from "@/lib/socket";

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const questionId = params.id as string;

  const [question, setQuestion] = useState<Question | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [questionData, proposalsData] = await Promise.all([
          getQuestionById(questionId),
          getProposalsByQuestionId(questionId),
        ]);

        if (!questionData) {
          setIsLoading(false);
          return;
        }

        setQuestion(questionData);
        setProposals(proposalsData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        setIsLoading(false);
      }
    };

    if (questionId) {
      loadData();
    }
  }, [questionId]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !questionId) return;

    const room = `question:${questionId}`;
    socket.emit("room:join", room);

    const handleNewProposal = (proposal: Proposal) => {
      if (proposal.questionId !== questionId) return;
      setProposals((prev) => {
        if (prev.some((p) => p.id === proposal.id)) {
          return prev;
        }
        return [proposal, ...prev];
      });
    };

    const handleQuestionUpdate = (updatedQuestion: Question) => {
      if (updatedQuestion.id !== questionId) return;
      setQuestion(updatedQuestion);
    };

    socket.on("proposal:new", handleNewProposal);
    socket.on("question:update", handleQuestionUpdate);

    return () => {
      socket.emit("room:leave", room);
      socket.off("proposal:new", handleNewProposal);
      socket.off("question:update", handleQuestionUpdate);
    };
  }, [questionId]);

  const formatDate = (date: Date | string) => {
    // Convert string to Date if needed
    const dateObj = typeof date === "string" ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return "Invalid date";
    }
    
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateObj);
  };

  const getStatusBadgeVariant = (status: QuestionStatus) => {
    switch (status) {
      case QuestionStatus.PENDING:
        return "default";
      case QuestionStatus.ANSWERED:
        return "secondary";
      case QuestionStatus.CLOSED:
        return "outline";
      default:
        return "default";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getModeIcon = (mode: CommunicationMedium) => {
    switch (mode) {
      case CommunicationMedium.VIDEO_CALL:
        return <Video className="h-4 w-4" />;
      case CommunicationMedium.AUDIO_CALL:
        return <Phone className="h-4 w-4" />;
      case CommunicationMedium.MESSAGE:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getModeName = (mode: CommunicationMedium) => {
    switch (mode) {
      case CommunicationMedium.VIDEO_CALL:
        return "Video Call";
      case CommunicationMedium.AUDIO_CALL:
        return "Audio Call";
      case CommunicationMedium.MESSAGE:
        return "Message";
    }
  };

  const handleAcceptProposal = (proposal: Proposal) => {
    // Redirect to book page with expert ID and question ID as query parameter
    router.push(`/expert/${proposal.expertId}/book?questionId=${questionId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-10">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-10">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-2">Question Not Found</h1>
            <Button onClick={() => router.push("/post")}>Back to Questions</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-10">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/post")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Questions
        </Button>

      {/* Question Details */}
      <Card className="mb-8 border border-slate-200 shadow-sm">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-3">{question.questionTitle}</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                {question.questionDescription}
              </CardDescription>
            </div>
            <Badge variant={getStatusBadgeVariant(question.questionStatus)}>
              {question.questionStatus}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6 text-sm text-gray-600">
            {/* Category */}
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              <span className="font-medium">Category:</span>
              <span>{question.questionCategory}</span>
            </div>

            {/* Tags */}
            {question.questionTags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="h-4 w-4" />
                <span className="font-medium">Tags:</span>
                <div className="flex gap-1 flex-wrap">
                  {question.questionTags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Created At */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">Created:</span>
              <span>{formatDate(question.createdAt)}</span>
            </div>

            {/* Updated At */}
            {(() => {
              const createdAt = typeof question.createdAt === "string" 
                ? new Date(question.createdAt) 
                : question.createdAt;
              const updatedAt = typeof question.updatedAt === "string" 
                ? new Date(question.updatedAt) 
                : question.updatedAt;
              return updatedAt.getTime() !== createdAt.getTime();
            })() && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Updated:</span>
                <span>{formatDate(question.updatedAt)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Proposals Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">
          Expert Proposals ({proposals.length})
        </h2>
        {proposals.length === 0 ? (
          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="py-12 text-center text-gray-500">
              <p>No proposals yet. Experts will submit their proposals here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {proposals.map((proposal) => (
              <Card
                key={proposal.id}
                className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    {/* Expert Avatar */}
                    <Avatar className="h-16 w-16 border-2 border-gray-200">
                      <AvatarImage
                        src={proposal.expert.profilePictureUrl || undefined}
                        alt={proposal.expert.name}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold text-lg">
                        {getInitials(proposal.expert.name)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Expert Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <CardTitle className="text-xl mb-2">
                            {proposal.expert.name}
                          </CardTitle>
                          <div className="space-y-1 text-sm text-gray-600">
                            {proposal.expert.jobTitle && (
                              <div className="flex items-center gap-2">
                                <Briefcase className="h-3 w-3" />
                                <span>
                                  {proposal.expert.jobTitle}
                                  {proposal.expert.company && (
                                    <span> at {proposal.expert.company}</span>
                                  )}
                                </span>
                              </div>
                            )}
                            {proposal.expert.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-3 w-3" />
                                <span>{proposal.expert.location}</span>
                              </div>
                            )}
                            {proposal.expert.skills && proposal.expert.skills.length > 0 && (
                              <div className="flex items-center gap-2 flex-wrap mt-2">
                                {proposal.expert.skills.slice(0, 3).map((skill, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Proposal Message */}
                  <div className="mb-4">
                    <p className="text-gray-700 leading-relaxed">{proposal.message}</p>
                  </div>

                  {/* Proposal Details */}
                  <div className="flex flex-wrap gap-4 items-center text-sm mb-4 pb-4 border-b">
                    {/* Communication Medium */}
                    <div className="flex items-center gap-2">
                      {getModeIcon(proposal.communicationMedium)}
                      <span className="font-medium">
                        {getModeName(proposal.communicationMedium)}
                      </span>
                    </div>

                    {/* Duration */}
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{proposal.estimatedDuration}</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-semibold text-lg">${proposal.price}</span>
                    </div>

                    {/* Created At */}
                    <div className="flex items-center gap-2 text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span className="text-xs">
                        Proposed {formatDate(proposal.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Accept Button */}
                  <div className="flex justify-end">
                    <Button
                      onClick={() => handleAcceptProposal(proposal)}
                      size="lg"
                      className="gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Accept Proposal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
    </div>
  );
}

