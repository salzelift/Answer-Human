import { ReadonlyURLSearchParams } from "next/navigation";

export type ExploreFilters = {
  mode: "recommended" | "custom";
  categories: string[];
  sort: "relevance" | "rating" | "price" | "reviews";
  sortDirection: "asc" | "desc";
  searchQuery: string;
  connectType: "video" | "audio" | "chat";
  timeSlot: string;
};

export const parseFilters = (
  searchParams: ReadonlyURLSearchParams
): ExploreFilters => ({
  mode: (searchParams.get("mode") as ExploreFilters["mode"]) ?? "recommended",
  categories: searchParams.get("categories")
    ? searchParams.get("categories")!.split(",")
    : [],
  sort: (searchParams.get("sort") as ExploreFilters["sort"]) ?? "relevance",
  sortDirection:
    (searchParams.get("sortDirection") as ExploreFilters["sortDirection"]) ??
    "asc",
  searchQuery: searchParams.get("q") ?? "",
  connectType:
    (searchParams.get("connect") as ExploreFilters["connectType"]) ?? "video",
  timeSlot: searchParams.get("timeSlot") ?? "",
});
