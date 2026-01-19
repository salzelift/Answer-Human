import api from "../axios";

export interface ExpandedProfile {
  bio: string;
  skillTags: string[];
  serviceCategories: string[];
  experienceSummary: string;
  suggestions: string[];
}

export interface ExpandProfileRequest {
  name: string;
  headline?: string;
  company?: string;
  skills?: string[];
  experience?: string;
}

export interface EnhancedQuestion {
  enhancedTitle: string;
  enhancedDescription: string;
  suggestedTags: string[];
  additionalQuestions: string[];
}

export interface EnhanceQuestionRequest {
  questionTitle: string;
  questionDescription?: string;
  questionCategory?: string;
}

export interface GeneratePitchRequest {
  questionTitle: string;
  questionDescription?: string;
  expertName: string;
  expertSkills?: string[];
  expertBio?: string;
}

export const aiApi = {
  // Expand expert profile using AI
  expandProfile: async (data: ExpandProfileRequest): Promise<{ expandedProfile: ExpandedProfile }> => {
    const response = await api.post("/ai/expand-profile", data);
    return response.data;
  },

  // Enhance seeker question using AI
  enhanceQuestion: async (data: EnhanceQuestionRequest): Promise<{
    enhancedQuestion: EnhancedQuestion;
    original: { title: string; description: string };
  }> => {
    const response = await api.post("/ai/enhance-question", data);
    return response.data;
  },

  // Generate pitch message for expert
  generatePitch: async (data: GeneratePitchRequest): Promise<{ pitchMessage: string }> => {
    const response = await api.post("/ai/generate-pitch", data);
    return response.data;
  },
};

