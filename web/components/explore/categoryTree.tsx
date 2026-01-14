'use client';

import { Category } from "@/types/category.types";
import { getCategories } from "@/lib/get-categories";
import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronRight } from "lucide-react";

interface Props {
  selected: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}

export default function CategoryTree({ selected, onChange, disabled = false }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  // Helper function to get all descendant category IDs (including the category itself)
  const getAllDescendantIds = (cat: Category): string[] => {
    const ids = [cat.id];
    cat.subCategories.forEach(subCat => {
      ids.push(...getAllDescendantIds(subCat));
    });
    return ids;
  };

  // Helper function to find a category by ID in the tree
  const findCategory = (categories: Category[], id: string): Category | null => {
    for (const cat of categories) {
      if (cat.id === id) return cat;
      const found = findCategory(cat.subCategories, id);
      if (found) return found;
    }
    return null;
  };

  const toggle = (id: string) => {
    const category = findCategory(categories, id);
    if (!category) return;

    const set = new Set(selected);
    const isCurrentlySelected = set.has(id);
    
    if (isCurrentlySelected) {
      // Deselect: remove this category and all its descendants
      const allIds = getAllDescendantIds(category);
      allIds.forEach(catId => set.delete(catId));
    } else {
      // Select: add this category and all its descendants
      const allIds = getAllDescendantIds(category);
      allIds.forEach(catId => set.add(catId));
    }
    
    onChange([...set]);
  };

  const toggleExpand = (id: string) => {
    if (disabled) return;
    const newExpanded = new Set(expanded);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpanded(newExpanded);
  };

  const hasSelectedDescendants = (cat: Category): boolean => {
    if (selected.includes(cat.id)) return true;
    return cat.subCategories.some(sub => hasSelectedDescendants(sub));
  };

  const render = (cat: Category, depth = 0) => {
    const hasChildren = cat.subCategories.length > 0;
    const isExpanded = expanded.has(cat.id);
    const isSelected = selected.includes(cat.id);
    const hasSelectedChildren = hasSelectedDescendants(cat);

    return (
      <div key={cat.id} className="space-y-0.5">
        <div 
          className={`flex items-center gap-2 py-1.5 px-2 rounded-md transition-colors group ${
            disabled ? '' : 'hover:bg-gray-50'
          } ${isSelected || hasSelectedChildren ? 'bg-gray-50' : ''}`}
        >
          {hasChildren ? (
            <button
              type="button"
              onClick={() => toggleExpand(cat.id)}
              disabled={disabled}
              className={`p-0.5 rounded hover:bg-gray-200 transition-colors ${
                disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
              }`}
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-600" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-600" />
              )}
            </button>
          ) : (
            <div className="w-5" /> // Spacer for alignment
          )}
          
          <Checkbox
            id={`category-${cat.id}`}
            checked={isSelected}
            onCheckedChange={() => toggle(cat.id)}
            disabled={disabled}
            className="shrink-0"
          />
          
          <Label 
            htmlFor={`category-${cat.id}`} 
            className={`font-normal text-sm flex-1 transition-colors ${
              disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer group-hover:text-gray-900'
            }`}
          >
            {cat.name}
          </Label>
        </div>

        {hasChildren && isExpanded && (
          <div className="ml-6 space-y-0.5 border-l border-gray-200 pl-2">
            {cat.subCategories.map(subCat => render(subCat, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <section>
      <h3 className="font-semibold mb-3">Categories</h3>
      <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2">
        {categories.map(cat => render(cat, 0))}
      </div>
    </section>
  );
}
