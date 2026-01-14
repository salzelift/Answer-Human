"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Search,
  Loader2,
  Eye,
  MessageSquare,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Star,
} from "lucide-react";
import { providerOnboardingApi } from "@/lib/api/provider-onboarding";
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
  knowledgeSeeker?: {
    name: string;
    profilePictureUrl?: string | null;
  };
}

export default function ExpertRequestsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [questions, searchQuery, statusFilter, categoryFilter]);

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      const data = await providerOnboardingApi.getProfile();
      setQuestions(data.questions || []);
    } catch (error: any) {
      console.error("Error loading requests:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to load requests",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = [...questions];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (q) =>
          q.questionTitle.toLowerCase().includes(query) ||
          q.questionDescription.toLowerCase().includes(query) ||
          q.knowledgeSeeker?.name.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((q) => q.questionStatus === statusFilter);
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((q) => q.questionCategory === categoryFilter);
    }

    setFilteredQuestions(filtered);
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
      month: "short",
      day: "numeric",
      year: "numeric",
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
      <Badge className={cn("border-2 font-medium", config.className)}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const categories = Array.from(new Set(questions.map((q) => q.questionCategory)));

  // Calculate stats
  const stats = {
    total: questions.length,
    pending: questions.filter((q) => q.questionStatus === "PENDING").length,
    answered: questions.filter((q) => q.questionStatus === "ANSWERED").length,
    closed: questions.filter((q) => q.questionStatus === "CLOSED").length,
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-purple-600" />
          <p className="mt-4 text-lg font-medium">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 py-10">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <MessageSquare className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Requests</h1>
                <p className="text-blue-100 text-lg mt-1">
                  Manage questions from knowledge seekers
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total</p>
                    <p className="text-3xl font-bold mt-1">{stats.total}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-200" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm font-medium">Pending</p>
                    <p className="text-3xl font-bold mt-1">{stats.pending}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-200" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Answered</p>
                    <p className="text-3xl font-bold mt-1">{stats.answered}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-200" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-100 text-sm font-medium">Closed</p>
                    <p className="text-3xl font-bold mt-1">{stats.closed}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-gray-200" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6 border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-blue-600" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by title, description or seeker..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-2 focus:border-purple-400"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-2 focus:border-purple-400">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="ANSWERED">Answered</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>

              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="border-2 focus:border-purple-400">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {filteredQuestions.length === 0 ? (
          <Card className="border-0 shadow-xl">
            <CardContent className="py-16">
              <div className="text-center">
                <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No requests found</h3>
                <p className="text-gray-600">
                  {searchQuery || statusFilter !== "all" || categoryFilter !== "all"
                    ? "Try adjusting your filters"
                    : "You don't have any requests yet"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.map((question) => (
              <Card
                key={question.id}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onClick={() => router.push(`/expert/requests/${question.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Seeker Info */}
                    <div className="flex items-start gap-4 md:w-64 flex-shrink-0">
                      <Avatar className="h-14 w-14 border-4 border-white shadow-lg ring-2 ring-purple-100">
                        <AvatarImage
                          src={question.knowledgeSeeker?.profilePictureUrl || undefined}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                          {question.knowledgeSeeker
                            ? getInitials(question.knowledgeSeeker.name)
                            : "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-bold text-gray-800">
                          {question.knowledgeSeeker?.name || "Anonymous"}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(question.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Question Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <h3 className="text-xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors">
                          {question.questionTitle}
                        </h3>
                        {getStatusBadge(question.questionStatus)}
                      </div>

                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {question.questionDescription}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200 font-medium"
                        >
                          {question.questionCategory}
                        </Badge>
                        {question.questionTags.slice(0, 3).map((tag, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="bg-purple-50 text-purple-700 border-purple-200"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {question.questionTags.length > 3 && (
                          <Badge variant="outline" className="bg-gray-50 text-gray-600">
                            +{question.questionTags.length - 3} more
                          </Badge>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 group-hover:translate-x-2 transition-all"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

