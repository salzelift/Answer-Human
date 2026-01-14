import { KnowledgeProvider } from "@/types/expert.types";
import { CommunicationMedium } from "@/types/expert.types";

export type Proposal = {
  id: string;
  questionId: string;
  expertId: string;
  expert: KnowledgeProvider;
  message: string;
  price: number;
  communicationMedium: CommunicationMedium;
  estimatedDuration: string;
  createdAt: Date;
  updatedAt: Date;
};

