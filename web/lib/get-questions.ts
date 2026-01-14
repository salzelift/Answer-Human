import { Question, QuestionStatus } from "@/types/question.types";
import { seekerApi } from "./api/seeker";

// Mock data for fallback - in production this would fetch from an API
let mockQuestions: Question[] = [
  {
    id: "q1",
    knowledgeSeekerId: "seeker-1",
    questionTitle: "How to optimize React performance?",
    questionDescription: "I'm building a large React application and noticing performance issues. What are the best practices for optimizing React components?",
    questionCategory: "Frontend Development",
    questionTags: ["react", "performance", "optimization"],
    questionStatus: QuestionStatus.PENDING,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: "q2",
    knowledgeSeekerId: "seeker-1",
    questionTitle: "Database design best practices",
    questionDescription: "I need help designing a database schema for an e-commerce platform. What are the key considerations?",
    questionCategory: "Backend Development",
    questionTags: ["database", "sql", "design"],
    questionStatus: QuestionStatus.ANSWERED,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    id: "q3",
    knowledgeSeekerId: "seeker-1",
    questionTitle: "UI/UX design principles",
    questionDescription: "What are the fundamental principles I should follow when designing user interfaces?",
    questionCategory: "UI / UX Design",
    questionTags: ["design", "ui", "ux"],
    questionStatus: QuestionStatus.CLOSED,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
  },
];

export async function getQuestions(knowledgeSeekerId?: string): Promise<Question[]> {
  // Try to fetch from API if authenticated, fallback to mock data
  try {
    const questions = await seekerApi.getQuestions();
    return questions;
  } catch (error) {
    console.error("Error fetching questions from API, using mock data:", error);
    // Fallback to mock data
    if (knowledgeSeekerId) {
      return mockQuestions.filter(q => q.knowledgeSeekerId === knowledgeSeekerId);
    }
    return [...mockQuestions];
  }
}

export async function createQuestion(
  questionTitle: string,
  questionDescription: string,
  questionCategory: string,
  questionTags: string[]
): Promise<Question> {
  // Try to create via API if authenticated, fallback to mock data
  try {
    const question = await seekerApi.createQuestion({
      questionTitle,
      questionDescription,
      questionCategory,
      questionTags,
    });
    return question;
  } catch (error) {
    console.error("Error creating question via API, using mock data:", error);
    // Fallback to mock data (still needs seekerId for mock, but API doesn't need it)
    const newQuestion: Question = {
      id: `q${Date.now()}`,
      knowledgeSeekerId: "seeker-1", // Mock fallback only
      questionTitle,
      questionDescription,
      questionCategory,
      questionTags,
      questionStatus: QuestionStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    mockQuestions = [newQuestion, ...mockQuestions];
    return newQuestion;
  }
}

export async function getQuestionById(questionId: string): Promise<Question | null> {
  // Try to fetch from API if authenticated, fallback to mock data
  try {
    const question = await seekerApi.getQuestionById(questionId);
    return question;
  } catch (error) {
    console.error("Error fetching question from API, using mock data:", error);
    // Fallback to mock data
    const question = mockQuestions.find(q => q.id === questionId);
    return question || null;
  }
}

