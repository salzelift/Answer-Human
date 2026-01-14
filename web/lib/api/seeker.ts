import api from "../axios";
import { Question } from "@/types/question.types";

export interface SeekerProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  interests: string[];
  profilePictureUrl: string | null;
  industry: string | null;
  isOnboarded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OnboardingData {
  name: string;
  phone: string;
  interests?: string[];
  industry?: string;
  profilePictureUrl?: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  phone?: string;
  interests?: string[];
  profilePictureUrl?: string;
  industry?: string;
  categoryIds?: string[];
}

export const seekerApi = {
  getProfile: async (): Promise<any> => {
    const response = await api.get("/seeker/profile");
    return response.data.seeker;
  },

  updateProfile: async (data: UpdateProfileData): Promise<any> => {
    const response = await api.put("/seeker/profile", data);
    return response.data.seeker;
  },

  completeOnboarding: async (data: OnboardingData): Promise<SeekerProfile> => {
    const response = await api.post("/seeker/onboarding", data);
    return response.data.seeker;
  },

  getOnboardingStatus: async (): Promise<{
    isOnboarded: boolean;
    profile: Partial<SeekerProfile>;
  }> => {
    const response = await api.get("/seeker/onboarding/status");
    return response.data;
  },

  getQuestions: async (): Promise<Question[]> => {
    const response = await api.get("/seeker/questions");
    return response.data.questions;
  },

  getQuestionById: async (id: string): Promise<Question> => {
    const response = await api.get(`/seeker/questions/${id}`);
    return response.data.question;
  },

  createQuestion: async (data: {
    questionTitle: string;
    questionDescription: string;
    questionCategory: string;
    questionTags?: string[];
  }): Promise<Question> => {
    const response = await api.post("/seeker/questions", data);
    return response.data.question;
  },

  updateQuestion: async (
    id: string,
    data: {
      questionTitle?: string;
      questionDescription?: string;
      questionCategory?: string;
      questionTags?: string[];
      questionStatus?: string;
    }
  ): Promise<Question> => {
    const response = await api.put(`/seeker/questions/${id}`, data);
    return response.data.question;
  },

  deleteQuestion: async (id: string): Promise<void> => {
    await api.delete(`/seeker/questions/${id}`);
  },
};

