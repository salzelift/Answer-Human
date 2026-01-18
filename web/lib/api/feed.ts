import api from "../axios";
import { Question } from "@/types/question.types";

export const feedApi = {
  getExpertFeed: async (): Promise<Question[]> => {
    const response = await api.get("/feed/expert");
    return response.data.questions || [];
  },
};

