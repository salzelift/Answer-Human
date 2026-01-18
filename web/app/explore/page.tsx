"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FilterSidebar from "@/components/explore/filterSidebar";
import { parseFilters, ExploreFilters } from "@/lib/filters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoveRightIcon, SearchIcon, SlidersHorizontal } from "lucide-react";
import { getCategories } from "@/lib/get-categories";
import { getExperts } from "@/lib/get-experts";
import { Category } from "@/types/category.types";
import { KnowledgeProvider } from "@/types/expert.types";
import ExpertCard from "@/components/expert-card";
import clsx from "clsx";

export default function ExplorePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<ExploreFilters>(() =>
    parseFilters(searchParams)
  );

  const [categories, setCategories] = useState<Category[]>([]);
  const [experts, setExperts] = useState<KnowledgeProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Initialize search query from URL params
  const initialFilters = parseFilters(searchParams);
  const [searchQuery, setSearchQuery] = useState(initialFilters.searchQuery);

  // Load categories on mount
  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  // Update filters when search params change
  useEffect(() => {
    const newFilters = parseFilters(searchParams);
    setFilters(newFilters);
    setSearchQuery(newFilters.searchQuery);
  }, [searchParams]);

  // Fetch experts when filters change
  useEffect(() => {
    const loadExperts = async () => {
      setIsLoading(true);
      try {
        const currentFilters = parseFilters(searchParams);
        
        // Build API filter parameters
        const apiFilters: {
          q?: string;
          categories?: string;
          sort?: string;
          sortDirection?: string;
          connect?: string;
        } = {};

        if (currentFilters.searchQuery) {
          apiFilters.q = currentFilters.searchQuery;
        }

        if (currentFilters.categories.length > 0) {
          // Map category IDs to industry names for backend filtering
          // For now, we'll pass category IDs and backend will try to match with industry
          // In a real app, you'd map category IDs to industry names
          apiFilters.categories = currentFilters.categories.join(",");
        }

        if (currentFilters.sort) {
          apiFilters.sort = currentFilters.sort;
        }

        if (currentFilters.sortDirection) {
          apiFilters.sortDirection = currentFilters.sortDirection;
        }

        if (currentFilters.connectType) {
          apiFilters.connect = currentFilters.connectType;
        }

        const data = await getExperts(apiFilters);
        setExperts(data);
      } catch (error) {
        console.error("Error loading experts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExperts();
  }, [searchParams]);

  const updateFilter = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "recommended") {
      clearFilters();
      return;
    }

    if (!value || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    params.set("mode", "custom");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set("q", value.trim());
    } else {
      params.delete("q");
    }
    params.set("mode", "custom");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const applyFilters = () => {
    setShowFilters(false);
    router.push(`?${searchParams.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    setShowFilters(false);
    router.push(`/explore`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HERO */}
      <section className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-600">
                Marketplace
              </p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-slate-900">
                Find verified experts for every challenge.
              </h1>
              <p className="text-base sm:text-lg mt-4 text-slate-600">
                Compare profiles, read reviews, and book trusted professionals in minutes.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                Vetted experts
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                Secure payments
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                On-time sessions
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                Verified reviews
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative mt-8 max-w-3xl">
            <Input
              placeholder="Search for an expert"
              className="h-14 pr-14 text-base sm:text-lg bg-white border-slate-200"
              value={searchQuery}
              onChange={handleSearch}
            />
            <SearchIcon className="absolute right-4 top-1/2 -translate-y-1/2 bg-emerald-600 text-white p-2 rounded-md h-9 w-9" />
          </div>

          {/* Categories */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="relative flex items-center justify-between rounded-xl border border-slate-200 bg-white hover:border-emerald-200 hover:shadow-sm transition p-4 cursor-pointer"
              >
                <span className="text-sm sm:text-base text-slate-700">{category.name}</span>
                <MoveRightIcon className="h-4 w-4 text-slate-400" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div className="container mx-auto px-4 py-10 flex gap-6 relative">
        {/* MOBILE FILTER BUTTON */}
        <Button
          variant="outline"
          className="lg:hidden flex items-center gap-2 mb-4"
          onClick={() => setShowFilters(true)}
        >
          <SlidersHorizontal size={16} />
          Filters
        </Button>

        {/* SIDEBAR */}
        <aside
          className={clsx(
            "fixed inset-0 z-40 bg-white lg:bg-transparent lg:static lg:w-72 transition-transform",
            showFilters ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <FilterSidebar
            filters={filters}
            updateFilter={updateFilter}
            applyFilters={applyFilters}
            clearFilters={clearFilters}
            isOpen={showFilters}
            onClose={() => setShowFilters(false)}
          />
        </aside>

        {/* OVERLAY */}
        {showFilters && (
          <div
            className="fixed inset-0 bg-black/40 z-30 lg:hidden"
            onClick={() => setShowFilters(false)}
          />
        )}

        {/* CONTENT */}
        <main className="flex-1">
          <header className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Explore Experts</h2>
            <span className="text-sm text-gray-500">
              {isLoading ? "Loading..." : `${experts.length} experts`}
            </span>
          </header>

          {/* GRID */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-80 rounded-xl bg-white border animate-pulse"
                />
              ))}
            </div>
          ) : experts.length > 0 ? (
            <div className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
              {experts.map((expert) => (
                <ExpertCard key={expert.id} expert={expert} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-lg text-gray-600">No experts found</p>
              <p className="text-sm text-gray-400 mt-2">
                Try adjusting your filters
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
