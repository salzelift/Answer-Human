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

export interface AvailableSlot {
  date: string; // ISO date string (YYYY-MM-DD)
  time: string; // Time range string (e.g., "09:00-12:00")
}

export interface Appointment {
  id: string;
  knowledgeProviderId: string;
  knowledgeSeekerId: string;
  appointmentDate: Date | string;
  appointmentTime: Date | string;
  appointmentStatus: AppointmentStatus;
  communicationMedium: CommunicationMedium;
  totalPaymemnt: number;
  paymentStatus: PaymentStatus;
  questionsId: string;
  paymentMethod: PaymentMethod;
  paymentTransactionId?: string | null;
  paymentTransactionStatus?: string | null;
  paymentTransactionError?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  knowledgeProvider?: {
    id: string;
    name: string;
    profilePictureUrl?: string | null;
    description?: string | null;
    jobTitle?: string | null;
    company?: string | null;
    location?: string | null;
  };
  knowledgeSeeker?: {
    id: string;
    name: string;
    email: string;
  };
  questions?: {
    id: string;
    questionTitle: string;
    questionDescription?: string;
    questionTags?: string[];
  };
}

export interface CreateAppointmentRequest {
  expertId: string;
  appointmentDate: string; // ISO date string (YYYY-MM-DD)
  appointmentTime: string; // Time string (HH:MM)
  communicationMedium: CommunicationMedium | string;
  questionId?: string;
  paymentMethod: PaymentMethod | string;
}


