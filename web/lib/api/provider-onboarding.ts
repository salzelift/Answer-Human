import api from "../axios";

export interface ProviderOnboardingData {
  name?: string;
  description?: string;
  websiteUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  githubUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  tiktokUrl?: string;
  profilePictureUrl?: string;
  bannerPictureUrl?: string;
  location?: string;
  categoryIds?: string[];
  company?: string;
  jobTitle?: string;
  education?: string;
  skills?: string[];
  interests?: string[];
  bio: string;
  availableDays?: string[];
  availableTimes?: string[];
  availableLanguages?: string[];
  // Additional fields
  industry?: string;
  yearsOfExperience?: number;
  certifications?: string[];
  availableTimeStart?: string;
  availableTimeEnd?: string;
  hourlyRate?: number;
}

export const providerOnboardingApi = {
  apply: async (data: ProviderOnboardingData) => {
    const response = await api.post("/provider-onboarding/apply", data);
    return response.data;
  },

  checkEligibility: async () => {
    const response = await api.get("/provider-onboarding/check-eligibility");
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get("/provider-onboarding/profile");
    return response.data.provider;
  },
};

