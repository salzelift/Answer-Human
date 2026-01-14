import api from "../axios";

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role?: "ADMIN" | "KNOWLEDGE_SEEKER" | "KNOWLEDGE_PROVIDER";
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    isOnboarded?: boolean;
    isEmailVerified?: boolean;
  };
}

export interface InitiateRegisterResponse {
  message: string;
  userId: string;
  email: string;
}

export interface VerifyOTPData {
  userId: string;
  otp: string;
}

export interface ForgotPasswordResponse {
  message: string;
  userId?: string;
}

export interface ResetPasswordData {
  userId: string;
  newPassword: string;
  resetToken?: string;
}

export const authApi = {
  // New registration flow with OTP
  initiateRegister: async (data: RegisterData): Promise<InitiateRegisterResponse> => {
    const response = await api.post("/auth/register/initiate", data);
    return response.data;
  },

  verifyRegistration: async (data: VerifyOTPData): Promise<AuthResponse> => {
    const response = await api.post("/auth/register/verify", data);
    if (typeof window !== "undefined" && response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  resendRegistrationOTP: async (userId: string): Promise<{ message: string }> => {
    const response = await api.post("/auth/register/resend-otp", { userId });
    return response.data;
  },

  // Legacy register (without OTP)
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post("/auth/register", data);
    if (typeof window !== "undefined" && response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post("/auth/login", data);
    if (typeof window !== "undefined" && response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  getCurrentUser: async () => {
    const response = await api.get("/auth/me");
    if (typeof window !== "undefined" && response.data.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Forgot Password flow
  forgotPassword: async (email: string): Promise<ForgotPasswordResponse> => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  verifyForgotPasswordOTP: async (data: VerifyOTPData): Promise<{ message: string; resetToken: string }> => {
    const response = await api.post("/auth/forgot-password/verify", data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordData): Promise<{ message: string }> => {
    const response = await api.post("/auth/reset-password", data);
    return response.data;
  },

  resendForgotPasswordOTP: async (userId: string): Promise<{ message: string }> => {
    const response = await api.post("/auth/forgot-password/resend-otp", { userId });
    return response.data;
  },

  getToken: (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  },

  getUser: (): any | null => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  isAuthenticated: (): boolean => {
    return !!authApi.getToken();
  },
};
