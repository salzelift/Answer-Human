import { Category } from "@/types/category.types";
import { categoriesApi } from "./api/categories";

export async function getCategories(): Promise<Category[]> {
  // Try to fetch from API, fallback to mock data if API fails
  try {
    return await categoriesApi.getAll();
  } catch (error) {
    console.error("Error fetching categories from API, using mock data:", error);
    return [];
  }
}
