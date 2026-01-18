import api from "../axios";
import { KnowledgeProvider } from "@/types/expert.types";

export interface GetExpertsParams {
  q?: string; // search query
  categories?: string; // comma-separated category/industry names
  sort?: string; // relevance, rating, price, reviews
  sortDirection?: string; // asc, desc
  connect?: string; // video, audio, chat
  timeSlot?: string;
}

export const providerApi = {
  getAll: async (filters?: GetExpertsParams): Promise<KnowledgeProvider[]> => {
    const params = new URLSearchParams();
    
    if (filters?.q) params.append("q", filters.q);
    if (filters?.categories) params.append("categories", filters.categories);
    if (filters?.sort) params.append("sort", filters.sort);
    if (filters?.sortDirection) params.append("sortDirection", filters.sortDirection);
    if (filters?.connect) params.append("connect", filters.connect);
    if (filters?.timeSlot) params.append("timeSlot", filters.timeSlot);

    const queryString = params.toString();
    const url = `/providers${queryString ? `?${queryString}` : ""}`;
    
    const response = await api.get(url);
    return response.data.experts;
  },

  getById: async (id: string): Promise<KnowledgeProvider> => {
    const response = await api.get(`/providers/${id}`);
    return response.data.expert;
  },
};

