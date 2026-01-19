import api from "../axios";

export interface LinkedInAuthUrlResponse {
  authUrl: string;
}

export interface LinkedInProfileData {
  name: string;
  email: string;
  picture: string;
  sub: string;
}

export const linkedinApi = {
  // Get LinkedIn OAuth authorization URL
  getAuthUrl: async (): Promise<LinkedInAuthUrlResponse> => {
    const response = await api.get("/linkedin/auth-url");
    return response.data;
  },

  // Validate LinkedIn URL
  parseUrl: async (linkedinUrl: string) => {
    const response = await api.post("/linkedin/parse-url", { linkedinUrl });
    return response.data;
  },
};

