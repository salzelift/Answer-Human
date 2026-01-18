import api from "../axios";
import { Proposal } from "@/types/proposal.types";

export interface CreateProposalPayload {
  questionId: string;
  expertId: string;
  message: string;
  price: number;
  communicationMedium: string;
  estimatedDuration: string;
}

export const proposalsApi = {
  getByQuestionId: async (questionId: string): Promise<Proposal[]> => {
    const response = await api.get("/proposals", { params: { questionId } });
    return response.data.proposals || [];
  },

  create: async (payload: CreateProposalPayload): Promise<Proposal> => {
    const response = await api.post("/proposals", payload);
    return response.data.proposal;
  },
};

