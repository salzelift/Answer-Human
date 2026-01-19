"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Calendar, Tag, FolderOpen, Clock, Wand2, Loader2, RefreshCw, Check, X } from "lucide-react";
import { Question, QuestionStatus } from "@/types/question.types";
import { aiApi, EnhancedQuestion } from "@/lib/api/ai";
import { useToast } from "@/hooks/use-toast";
import { getQuestions, createQuestion } from "@/lib/get-questions";
import { getCategories } from "@/lib/get-categories";
import { flattenCategories } from "@/lib/category-utils";
import { Category } from "@/types/category.types";
import { cn } from "@/lib/utils";
import { getSocket } from "@/lib/socket";

export default function PostPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form state
  const [questionTitle, setQuestionTitle] = useState("");
  const [questionDescription, setQuestionDescription] = useState("");
  const [questionCategory, setQuestionCategory] = useState("");
  const [questionTags, setQuestionTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // AI Enhancement state
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedVersion, setEnhancedVersion] = useState<EnhancedQuestion | null>(null);
  const [showEnhanced, setShowEnhanced] = useState(false);
  
  // Filter and sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const [questionsData, categoriesData] = await Promise.all([
          getQuestions(),
          getCategories(),
        ]);
        setQuestions(questionsData);
        setCategories(categoriesData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewQuestion = (question: Question) => {
      setQuestions((prev) => {
        if (prev.some((q) => q.id === question.id)) {
          return prev;
        }
        return [question, ...prev];
      });
    };

    socket.on("question:new", handleNewQuestion);

    return () => {
      socket.off("question:new", handleNewQuestion);
    };
  }, []);

  useEffect(() => {
    let filtered = [...questions];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (q) =>
          q.questionTitle.toLowerCase().includes(query) ||
          q.questionDescription.toLowerCase().includes(query) ||
          q.questionTags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((q) => q.questionCategory === categoryFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((q) => q.questionStatus === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      const dateA = typeof a.createdAt === "string" ? new Date(a.createdAt) : a.createdAt;
      const dateB = typeof b.createdAt === "string" ? new Date(b.createdAt) : b.createdAt;
      
      if (sortBy === "newest") {
        return dateB.getTime() - dateA.getTime();
      } else {
        return dateA.getTime() - dateB.getTime();
      }
    });

    setFilteredQuestions(filtered);
  }, [questions, searchQuery, categoryFilter, statusFilter, sortBy]);

  const handleSubmit = async () => {
    if (!questionTitle.trim() || !questionDescription.trim() || !questionCategory.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const tags = questionTags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const newQuestion = await createQuestion(
        questionTitle.trim(),
        questionDescription.trim(),
        questionCategory,
        tags
      );

      // Update questions list
      setQuestions((prev) => [newQuestion, ...prev]);

      // Reset form
      setQuestionTitle("");
      setQuestionDescription("");
      setQuestionCategory("");
      setQuestionTags("");
      setIsDialogOpen(false);

      // Navigate to question detail page
      router.push(`/post/${newQuestion.id}`);
    } catch (error) {
      console.error("Error creating question:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCardClick = (questionId: string) => {
    router.push(`/post/${questionId}`);
  };

  // AI Enhancement handlers
  const handleEnhanceWithAI = async () => {
    if (!questionTitle.trim() && !questionDescription.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a question title or description first.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsEnhancing(true);
      const response = await aiApi.enhanceQuestion({
        questionTitle: questionTitle,
        questionDescription: questionDescription,
        questionCategory: questionCategory,
      });

      setEnhancedVersion(response.enhancedQuestion);
      setShowEnhanced(true);
      
      toast({
        title: "Question Enhanced!",
        description: "Review the AI-improved version below.",
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      console.error("AI enhancement error:", err);
      toast({
        title: "Enhancement Failed",
        description: error.response?.data?.error || "Failed to enhance question. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleAcceptEnhanced = () => {
    if (enhancedVersion) {
      setQuestionTitle(enhancedVersion.enhancedTitle);
      setQuestionDescription(enhancedVersion.enhancedDescription);
      if (enhancedVersion.suggestedTags?.length) {
        setQuestionTags(enhancedVersion.suggestedTags.join(", "));
      }
      setShowEnhanced(false);
      setEnhancedVersion(null);
      toast({
        title: "Enhanced Version Applied",
        description: "You can still edit the question before posting.",
      });
    }
  };

  const handleRejectEnhanced = () => {
    setShowEnhanced(false);
    setEnhancedVersion(null);
  };

  const handleRegenerateEnhanced = () => {
    handleEnhanceWithAI();
  };

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

  const flatCategories = flattenCategories(categories);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-10">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  const totalQuestions = questions.length;
  const pendingCount = questions.filter((q) => q.questionStatus === QuestionStatus.PENDING).length;
  const answeredCount = questions.filter((q) => q.questionStatus === QuestionStatus.ANSWERED).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-600">Seeker</p>
            <h1 className="text-3xl font-semibold text-slate-900">My Questions</h1>
            <p className="text-slate-600 mt-2">
              Track proposals and manage your open requests.
            </p>
          </div>
          <Button
            onClick={() => setIsDialogOpen(true)}
            size="lg"
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Post a Question
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mt-6">
          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <p className="text-sm text-slate-500">Total questions</p>
              <p className="text-2xl font-semibold text-slate-900">{totalQuestions}</p>
            </CardContent>
          </Card>
          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <p className="text-sm text-slate-500">Pending</p>
              <p className="text-2xl font-semibold text-slate-900">{pendingCount}</p>
            </CardContent>
          </Card>
          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <p className="text-sm text-slate-500">Answered</p>
              <p className="text-2xl font-semibold text-slate-900">{answeredCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mt-6 border border-slate-200 shadow-sm">
          <CardContent className="pt-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search questions by title, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* Category Filter */}
          <div className="flex-1 min-w-[150px]">
            <Label htmlFor="category-filter" className="sr-only">
              Category
            </Label>
            <select
              id="category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={cn(
                "h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              )}
            >
              <option value="all">All Categories</option>
              {flatCategories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex-1 min-w-[150px]">
            <Label htmlFor="status-filter" className="sr-only">
              Status
            </Label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={cn(
                "h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              )}
            >
              <option value="all">All Status</option>
              <option value={QuestionStatus.PENDING}>Pending</option>
              <option value={QuestionStatus.ANSWERED}>Answered</option>
              <option value={QuestionStatus.CLOSED}>Closed</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex-1 min-w-[150px]">
            <Label htmlFor="sort" className="sr-only">
              Sort
            </Label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "oldest")}
              className={cn(
                "h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              )}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
          </CardContent>
        </Card>

      {/* Questions List */}
      {filteredQuestions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {searchQuery || categoryFilter !== "all" || statusFilter !== "all"
            ? "No questions match your filters."
            : "No questions yet. Post your first question!"}
        </div>
      ) : (
        <div className="grid gap-4 mt-6">
          {filteredQuestions.map((question) => (
            <Card
              key={question.id}
              onClick={() => handleCardClick(question.id)}
              className="cursor-pointer border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{question.questionTitle}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {question.questionDescription}
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusBadgeVariant(question.questionStatus)}>
                    {question.questionStatus}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  {/* Category */}
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    <span>{question.questionCategory}</span>
                  </div>

                  {/* Tags */}
                  {question.questionTags.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Tag className="h-4 w-4" />
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
                    <span>Created: {formatDate(question.createdAt)}</span>
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
                      <span>Updated: {formatDate(question.updatedAt)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Post Question Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Post a New Question</DialogTitle>
            <DialogDescription>
              Fill in the details below to post your question. Experts will be able to see and respond to it.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* AI Enhancement Button */}
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border border-emerald-200">
              <div>
                <p className="text-sm font-medium text-slate-800">Need help improving your question?</p>
                <p className="text-xs text-slate-500">AI can enhance clarity and add context</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleEnhanceWithAI}
                disabled={isEnhancing || (!questionTitle.trim() && !questionDescription.trim())}
                className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              >
                {isEnhancing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4" />
                )}
                Enhance with AI
              </Button>
            </div>

            {/* Enhanced Version Preview */}
            {showEnhanced && enhancedVersion && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-blue-800">AI Enhanced Version</p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRegenerateEnhanced}
                      disabled={isEnhancing}
                      className="gap-1"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Regenerate
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRejectEnhanced}
                      className="gap-1 text-red-600 hover:bg-red-50"
                    >
                      <X className="h-3 w-3" />
                      Reject
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAcceptEnhanced}
                      className="gap-1 bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Check className="h-3 w-3" />
                      Accept
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">Enhanced Title:</p>
                  <p className="text-sm text-slate-800 bg-white p-2 rounded border">
                    {enhancedVersion.enhancedTitle}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">Enhanced Description:</p>
                  <p className="text-sm text-slate-800 bg-white p-2 rounded border whitespace-pre-wrap">
                    {enhancedVersion.enhancedDescription}
                  </p>
                </div>
                {enhancedVersion.suggestedTags?.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700">Suggested Tags:</p>
                    <div className="flex flex-wrap gap-1">
                      {enhancedVersion.suggestedTags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Question Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Question Title *</Label>
              <Input
                id="title"
                placeholder="Enter a clear and descriptive title"
                value={questionTitle}
                onChange={(e) => setQuestionTitle(e.target.value)}
              />
            </div>

            {/* Question Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Question Description *</Label>
              <Textarea
                id="description"
                placeholder="Provide detailed information about your question"
                value={questionDescription}
                onChange={(e) => setQuestionDescription(e.target.value)}
                rows={6}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                value={questionCategory}
                onChange={(e) => setQuestionCategory(e.target.value)}
                className={cn(
                  "h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                )}
              >
                <option value="">Select a category</option>
                {flatCategories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                placeholder="e.g., react, javascript, performance"
                value={questionTags}
                onChange={(e) => setQuestionTags(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Separate multiple tags with commas
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                !questionTitle.trim() ||
                !questionDescription.trim() ||
                !questionCategory.trim()
              }
            >
              {isSubmitting ? "Posting..." : "Post Question"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </div>
  );
}
