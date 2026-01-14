import { Proposal } from "@/types/proposal.types";
import { KnowledgeProvider } from "@/types/expert.types";
import { CommunicationMedium } from "@/types/expert.types";
import { getExpertById } from "./get-experts";

// Mock proposals data
const mockProposals: Omit<Proposal, "expert">[] = [
  {
    id: "proposal-1",
    questionId: "q1",
    expertId: "expert-1",
    message: "I have extensive experience with React performance optimization. I can help you identify bottlenecks and implement best practices like memoization, code splitting, and virtualization.",
    price: 99,
    communicationMedium: CommunicationMedium.VIDEO_CALL,
    estimatedDuration: "30 min",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: "proposal-2",
    questionId: "q1",
    expertId: "expert-2",
    message: "I specialize in React performance tuning. I'll review your codebase and provide actionable recommendations.",
    price: 79,
    communicationMedium: CommunicationMedium.AUDIO_CALL,
    estimatedDuration: "30 min",
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
  {
    id: "proposal-3",
    questionId: "q2",
    expertId: "expert-3",
    message: "I can help you design a scalable database schema for your e-commerce platform. I'll cover normalization, indexing strategies, and performance optimization.",
    price: 149,
    communicationMedium: CommunicationMedium.VIDEO_CALL,
    estimatedDuration: "45 min",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
];

export async function getProposalsByQuestionId(questionId: string): Promise<Proposal[]> {
  // In production, this would fetch from API
  const proposalsData = mockProposals.filter(p => p.questionId === questionId);
  
  // Fetch expert data for each proposal
  const proposals: Proposal[] = await Promise.all(
    proposalsData.map(async (proposal) => {
      const expert = await getExpertById(proposal.expertId);
      if (!expert) {
        throw new Error(`Expert ${proposal.expertId} not found`);
      }
      return {
        ...proposal,
        expert,
      };
    })
  );
  
  return proposals;
}

