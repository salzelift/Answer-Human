import api from "../axios";
import { Category } from "@/types/category.types";

export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get("/categories");
    return response.data.categories;
  },

  getById: async (id: string): Promise<Category> => {
    const response = await api.get(`/categories/${id}`);
    return response.data.category;
  },
};

