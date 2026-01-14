import { Category } from "@/types/category.types";

// Flatten category tree to get all category names in a flat list
export function flattenCategories(categories: Category[]): { id: string; name: string }[] {
  const result: { id: string; name: string }[] = [];
  
  function traverse(cats: Category[]) {
    for (const cat of cats) {
      result.push({ id: cat.id, name: cat.name });
      if (cat.subCategories.length > 0) {
        traverse(cat.subCategories);
      }
    }
  }
  
  traverse(categories);
  return result;
}

