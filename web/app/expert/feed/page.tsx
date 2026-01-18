"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, Eye, Loader2, Search, Tag } from "lucide-react";
import { feedApi } from "@/lib/api/feed";
import { providerOnboardingApi } from "@/lib/api/provider-onboarding";
import { getSocket } from "@/lib/socket";
import { Question, QuestionStatus } from "@/types/question.types";

type ProviderProfile = {
  categories: { name: string }[];
  skills: string[];
  interests: string[];
};

const normalize = (value: string) => value.trim().toLowerCase();

const matchesProfile = (question: Question, profile: ProviderProfile) => {
  const category = normalize(question.questionCategory || "");
  const tags = (question.questionTags || []).map(normalize);

  const categoryMatches = profile.categories
    .map((c) => normalize(c.name))
    .includes(category);

  const tagMatches = tags.some(
    (tag) =>
      profile.skills.map(normalize).includes(tag) ||
      profile.interests.map(normalize).includes(tag)
  );

  return categoryMatches || tagMatches;
};

const getMatchScore = (question: Question, profile: ProviderProfile) => {
  let score = 0;
  const category = normalize(question.questionCategory || "");
  const tags = (question.questionTags || []).map(normalize);
  const categories = profile.categories.map((c) => normalize(c.name));
  const skills = profile.skills.map(normalize);
  const interests = profile.interests.map(normalize);

  if (categories.includes(category)) score += 3;
  tags.forEach((tag) => {
    if (skills.includes(tag)) score += 2;
    if (interests.includes(tag)) score += 1;
  });

  return score;
};

const formatDate = (dateValue: Date | string) => {
  const date = typeof dateValue === "string" ? new Date(dateValue) : dateValue;
  if (Number.isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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

export default function ExpertFeedPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadFeed = async () => {
      try {
        setIsLoading(true);
        const [profileData, feedQuestions] = await Promise.all([
          providerOnboardingApi.getProfile(),
          feedApi.getExpertFeed(),
        ]);
        setProfile(profileData);
        const matched = feedQuestions.filter((q: Question) =>
          matchesProfile(q, profileData)
        );
        matched.sort((a: Question, b: Question) => {
          const scoreDiff = getMatchScore(b, profileData) - getMatchScore(a, profileData);
          if (scoreDiff !== 0) return scoreDiff;
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        });
        setQuestions(matched);
      } catch (error) {
        console.error("Failed to load expert feed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFeed();
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !profile) return;

    const rooms = new Set<string>();
    profile.categories?.forEach((category) => {
      if (category?.name) rooms.add(`category:${normalize(category.name)}`);
    });
    profile.skills?.forEach((skill) => {
      if (skill) rooms.add(`tag:${normalize(skill)}`);
    });
    profile.interests?.forEach((interest) => {
      if (interest) rooms.add(`tag:${normalize(interest)}`);
    });

    rooms.forEach((room) => socket.emit("room:join", room));

    const handleNewQuestion = (question: Question) => {
      if (!matchesProfile(question, profile)) return;
      setQuestions((prev) => {
        if (prev.some((item) => item.id === question.id)) {
          return prev;
        }
        const next = [question, ...prev];
        next.sort((a, b) => {
          const scoreDiff = getMatchScore(b, profile) - getMatchScore(a, profile);
          if (scoreDiff !== 0) return scoreDiff;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        return next;
      });
    };

    const handleQuestionUpdate = (updated: Question) => {
      setQuestions((prev) => {
        const isMatch = matchesProfile(updated, profile);
        const existingIndex = prev.findIndex((item) => item.id === updated.id);

        if (!isMatch) {
          if (existingIndex === -1) return prev;
          return prev.filter((item) => item.id !== updated.id);
        }

        const next = [...prev];
        if (existingIndex === -1) {
          next.unshift(updated);
        } else {
          next[existingIndex] = updated;
        }

        next.sort((a, b) => {
          const scoreDiff = getMatchScore(b, profile) - getMatchScore(a, profile);
          if (scoreDiff !== 0) return scoreDiff;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        return next;
      });
    };

    socket.on("question:new", handleNewQuestion);
    socket.on("question:update", handleQuestionUpdate);

    return () => {
      rooms.forEach((room) => socket.emit("room:leave", room));
      socket.off("question:new", handleNewQuestion);
      socket.off("question:update", handleQuestionUpdate);
    };
  }, [profile]);

  const filteredQuestions = useMemo(() => {
    if (!searchQuery.trim()) return questions;
    const query = searchQuery.toLowerCase();
    return questions.filter((question) => {
      const tags = question.questionTags || [];
      return (
        question.questionTitle.toLowerCase().includes(query) ||
        question.questionDescription.toLowerCase().includes(query) ||
        question.questionCategory.toLowerCase().includes(query) ||
        tags.some((tag) => tag.toLowerCase().includes(query))
      );
    });
  }, [questions, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-600">
              Expert Feed
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">Live Requests</h1>
            <p className="text-slate-600">
              Real-time questions matched to your expertise and interests.
            </p>
          </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search questions, categories, tags..."
              className="pl-9"
            />
          </div>
          <Button variant="outline" onClick={() => router.push("/expert/requests")}>
            View all requests
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : filteredQuestions.length === 0 ? (
          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="py-12 text-center text-slate-500">
              No matching questions yet. Keep this tab open to receive updates.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredQuestions.map((question) => (
              <Card key={question.id} className="border border-slate-200 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-xl">{question.questionTitle}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                        <Calendar className="h-4 w-4" />
                        {formatDate(question.createdAt)}
                      </div>
                    </div>
                    <Badge variant={getStatusBadgeVariant(question.questionStatus)}>
                      {question.questionStatus}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700 line-clamp-3">
                    {question.questionDescription}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {question.questionCategory}
                    </Badge>
                    {(question.questionTags || []).slice(0, 4).map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                    {(question.questionTags || []).length > 4 && (
                      <span className="text-xs text-gray-500">
                        +{(question.questionTags || []).length - 4} more
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="h-4 w-4" />
                      Recent question
                    </div>
                    <Button
                      size="sm"
                      onClick={() => router.push(`/expert/requests/${question.id}`)}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View request
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

