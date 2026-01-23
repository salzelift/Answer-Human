import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo-config";

// API base URL for fetching dynamic data
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Static routes with their priority and change frequency
const staticRoutes: Array<{
  path: string;
  priority: number;
  changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
}> = [
  { path: "", priority: 1.0, changeFrequency: "daily" },
  { path: "/explore", priority: 0.9, changeFrequency: "daily" },
  { path: "/login", priority: 0.5, changeFrequency: "monthly" },
  { path: "/register", priority: 0.6, changeFrequency: "monthly" },
  { path: "/expert/onboarding", priority: 0.7, changeFrequency: "weekly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
];

// Fetch experts for dynamic sitemap entries
async function getExperts(): Promise<Array<{ id: string; updatedAt?: string }>> {
  try {
    const response = await fetch(`${API_URL}/api/experts`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!response.ok) {
      console.error("Failed to fetch experts for sitemap");
      return [];
    }

    const data = await response.json();
    return data.data || data || [];
  } catch (error) {
    console.error("Error fetching experts for sitemap:", error);
    return [];
  }
}

// Fetch categories for dynamic sitemap entries
async function getCategories(): Promise<Array<{ id: string; slug?: string }>> {
  try {
    const response = await fetch(`${API_URL}/api/category`, {
      next: { revalidate: 86400 }, // Revalidate every 24 hours
    });

    if (!response.ok) {
      console.error("Failed to fetch categories for sitemap");
      return [];
    }

    const data = await response.json();
    return data.data || data || [];
  } catch (error) {
    console.error("Error fetching categories for sitemap:", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;
  const now = new Date();

  // Static routes
  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // Dynamic expert profile pages
  const experts = await getExperts();
  const expertEntries: MetadataRoute.Sitemap = experts.map((expert) => ({
    url: `${baseUrl}/expert/${expert.id}`,
    lastModified: expert.updatedAt ? new Date(expert.updatedAt) : now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Dynamic category pages (explore with category filter)
  const categories = await getCategories();
  const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/explore?categories=${category.id}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...expertEntries, ...categoryEntries];
}

