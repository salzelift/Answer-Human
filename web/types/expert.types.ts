// Enums from Prisma schema
export enum Role {
  ADMIN = "ADMIN",
  KNOWLEDGE_SEEKER = "KNOWLEDGE_SEEKER",
  KNOWLEDGE_PROVIDER = "KNOWLEDGE_PROVIDER",
}

export enum AvailableDays {
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
  SUNDAY = "SUNDAY",
}

export enum AppointmentStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
}

export enum PaymentMethod {
  RAZORPAY = "RAZORPAY",
  STRIPE = "STRIPE",
  QR_CODE = "QR_CODE",
}

export enum CommunicationMedium {
  VIDEO_CALL = "VIDEO_CALL",
  AUDIO_CALL = "AUDIO_CALL",
  MESSAGE = "MESSAGE",
}

// Base KnowledgeProvider type (expert)
export type KnowledgeProvider = {
  id: string;
  userId: string;
  
  // Provider profile details
  name: string;
  description: string | null;
  websiteUrl: string | null;
  linkedinUrl: string | null;
  twitterUrl: string | null;
  githubUrl: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  youtubeUrl: string | null;
  tiktokUrl: string | null;
  profilePictureUrl: string | null;
  bannerPictureUrl: string | null;
  location: string | null;
  industry: string | null;
  company: string | null;
  jobTitle: string | null;
  education: string | null;
  skills: string[];
  interests: string[];
  bio: string | null;

  // Provider availability details
  isAvailable: boolean;
  availableDays: string[];
  availableTimes: string[];
  availableLanguages: string[];

  createdAt: Date;
  updatedAt: Date;
};

// KnowledgeProvider with User relation
export type KnowledgeProviderWithUser = KnowledgeProvider & {
  user: {
    id: string;
    email: string;
    role: Role;
    createdAt: Date;
    updatedAt: Date;
  };
};

// KnowledgeProvider with appointments
export type KnowledgeProviderWithAppointments = KnowledgeProvider & {
  appointments: Appointment[];
};

// Full KnowledgeProvider with all relations
export type KnowledgeProviderFull = KnowledgeProvider & {
  user: {
    id: string;
    email: string;
    role: Role;
    createdAt: Date;
    updatedAt: Date;
  };
  appointments: Appointment[];
};

// Appointment type
export type Appointment = {
  id: string;
  knowledgeProviderId: string;
  knowledgeSeekerId: string;
  appointmentDate: Date;
  appointmentTime: Date;
  appointmentStatus: AppointmentStatus;
  communicationMedium: CommunicationMedium;
  totalPaymemnt: number; // Note: typo in schema (totalPaymemnt instead of totalPayment)
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentTransactionId: string | null;
  paymentTransactionStatus: string | null;
  paymentTransactionError: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// Appointment with relations
export type AppointmentWithRelations = Appointment & {
  knowledgeProvider: KnowledgeProvider;
  knowledgeSeeker: {
    id: string;
    userId: string;
    name: string;
    email: string;
    phone: string;
    interests: string[];
    profilePictureUrl: string | null;
    industry: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
};

// User type
export type User = {
  id: string;
  email: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
};

// KnowledgeSeeker type (for reference)
export type KnowledgeSeeker = {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  interests: string[];
  profilePictureUrl: string | null;
  industry: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// Expert card display type (simplified for UI)
export type ExpertCard = {
  id: string;
  name: string;
  description: string | null;
  profilePictureUrl: string | null;
  bannerPictureUrl: string | null;
  location: string | null;
  industry: string | null;
  company: string | null;
  jobTitle: string | null;
  skills: string[];
  isAvailable: boolean;
  rating?: number; // If you have a rating system
  reviewCount?: number; // If you have reviews
  price?: number; // If you have pricing
};

// Expert profile type (full details for profile page)
export type ExpertProfile = KnowledgeProviderWithUser & {
  rating?: number;
  reviewCount?: number;
  totalAppointments?: number;
  completedAppointments?: number;
};

